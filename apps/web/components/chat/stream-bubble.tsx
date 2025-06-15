import React, { useRef, useEffect } from "react";
import MarkdownRenderer from "../markdown-renderer";
import { Loader } from "lucide-react";
import Link from "next/link";

const StreamBubble = ({
  streamData,
}: {
  streamData: {
    text: string;
    images: string;
    webSearches: { title: string; url: string }[];
    reasoning: string;
  };
}) => {
  console.log(streamData, "streamData");

  const reasoningRef = useRef<HTMLDivElement>(null);
  const reasoningEndRef = useRef<HTMLDivElement>(null);
  // Auto-scroll the reasoning section to bottom whenever content changes with smooth animation
  useEffect(() => {
    if (reasoningEndRef.current && streamData.reasoning) {
      reasoningEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [streamData.reasoning]);

  return (
    <div>
      <div className={streamData.webSearches?.length > 0 ? "" : "hidden"}>
        <h3 className="text-sm font-semibold">Sources</h3>
        <div className="overflow-x-auto flex mt-2 gap-4">
          {streamData.webSearches?.map((webSearch) => (
            <Link
              href={webSearch.url}
              target="_blank"
              key={webSearch.url}
              className="max-w-36 border rounded-md p-2 bg-accent hover:border-primary transition-colors border-accent"
            >
              <p className="text-sm font-semibold truncate">
                {webSearch.title}
              </p>
              <p className="text-xs truncate">{webSearch.url}</p>
            </Link>
          ))}
        </div>
      </div>
      {streamData.reasoning && (
        <div className="mt-2 border p-2 rounded">
          <h3 className="text-sm font-semibold">Reasoning</h3>
          <div
            ref={reasoningRef}
            className="text-xs text-muted-foreground font-semibold max-h-36 overflow-y-auto whitespace-pre-wrap"
          >
            {streamData.reasoning}
            <div
              ref={reasoningEndRef}
              style={{ float: "left", clear: "both" }}
            />
          </div>
        </div>
      )}
      {streamData.text.trim() ? (
        <MarkdownRenderer content={streamData.text} />
      ) : (
        <Loader className="animate-spin" />
      )}
    </div>
  );
};

export default StreamBubble;
