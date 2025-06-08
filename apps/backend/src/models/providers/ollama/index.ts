export const askOllamaQuestion = async (
  question: string,
  onChunk?: (chunk: string) => void
): Promise<void> => {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "hf.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF:Q4_K_M",
        prompt: question,
      }),
    });

    if (!response.body) {
      throw new Error("Response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              result += parsed.response;
              if (onChunk) {
                onChunk(parsed.response);
              }
            }
            if (parsed.done) {
              done = true;
              break;
            }
          } catch (e) {
            throw e;
          }
        }
      }
    }

    return;
  } catch (error) {
    throw error;
  }
};
