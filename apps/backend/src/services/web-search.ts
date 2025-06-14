import axios from "axios";
import { env } from "../lib/env.js";

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

export const webSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.trim() === "") {
    return [];
  }

  const url = "https://www.googleapis.com/customsearch/v1";

  try {
    const { data } = await axios.get(url, {
      params: {
        key: env.GOOGLE_WEB_SEARCH_API_KEY,
        cx: env.GOOGLE_CX,
        q: query,
        num: 5,
        fields: "items(title,snippet,link)",
      },
    });

    return (data.items ?? []).map(
      ({ title, snippet, link }: any): SearchResult => ({
        title,
        snippet,
        link,
      })
    );
  } catch (error) {
    console.error("Web search API error:", error);
    return [];
  }
};
