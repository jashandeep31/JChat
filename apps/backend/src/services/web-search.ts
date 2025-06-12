import axios from "axios";
import { env } from "../lib/env.js";

export const webSearch = async (query: string) => {
  const url = "https://www.googleapis.com/customsearch/v1";

  const { data } = await axios.get(url, {
    params: {
      key: env.GOOGLE_WEB_SEARCH_API_KEY,
      cx: env.GOOGLE_CX,
      q: query,
      num: 5,
      fields: "items(title,snippet,link)",
    },
  });

  // data.items is now an array of compact objects:
  // [{ title, snippet, link }, …]
  return (data.items ?? []).map(({ title, snippet, link }: any) => ({
    title,
    snippet,
    link,
  }));
};
