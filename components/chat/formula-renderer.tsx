"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type FormulaRendererProps = {
  content: string;
};

export function FormulaRenderer({ content }: FormulaRendererProps) {
  return (
    <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
