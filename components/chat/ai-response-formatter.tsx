"use client";

import { FormulaRenderer } from "@/components/chat/formula-renderer";

function normalizeAsterisks(text: string) {
  return text
    .replace(/^\s*\*{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeMathDelimiters(text: string) {
  return text
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expr: string) => `$${expr.trim()}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expr: string) => `$$${expr.trim()}$$`);
}

export function formatAIResponse(raw: string) {
  return normalizeAsterisks(normalizeMathDelimiters(raw));
}

type AIResponseFormatterProps = {
  content: string;
};

export function AIResponseFormatter({ content }: AIResponseFormatterProps) {
  return <FormulaRenderer content={formatAIResponse(content)} />;
}
