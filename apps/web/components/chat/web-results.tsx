import useWebSearchQuery from "@/lib/react-query/use-websearch-query";
import Link from "next/link";
import React from "react";

const WebResults = ({ answerId }: { answerId: string }) => {
  const { data: webSearch } = useWebSearchQuery(answerId);
  return (
    <div
      className={
        webSearch && webSearch?.length > 0
          ? "max-w-[800px] overflow-hidden"
          : "hidden"
      }
    >
      <h3 className="text-sm font-semibold">Sources</h3>
      <div className="overflow-x-auto hide-scrollbar flex mt-2 gap-4">
        {webSearch?.map((webSearch) => (
          <Link
            href={webSearch.url}
            target="_blank"
            key={webSearch.url}
            className="max-w-36 border rounded-md p-2 bg-accent hover:border-primary transition-colors border-accent"
          >
            <p className="text-sm font-semibold truncate">{webSearch.title}</p>
            <p className="text-xs truncate">{webSearch.url}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WebResults;
