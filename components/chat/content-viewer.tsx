"use client";

import { useLanguage } from "@/context/language-context";

type ContentData = {
  title?: string;
  summary?: string;
  examples?: string[];
  references?: string[];
  articles?: string[];
  explanations?: string[];
};

type ContentViewerProps = {
  data: ContentData | null;
  loading: boolean;
  isDarkMode?: boolean;
};

export function ContentViewer({ data, loading, isDarkMode = false }: ContentViewerProps) {
  const { t } = useLanguage();
  const card = isDarkMode
    ? "border-slate-700/80 bg-slate-800/60 text-slate-200"
    : "border-slate-200/80 bg-white text-slate-700 shadow-sm";

  const label = isDarkMode ? "text-slate-500" : "text-slate-500";
  const title = isDarkMode ? "text-slate-100" : "text-slate-900";

  if (loading) {
    return (
      <article className={`rounded-2xl border p-5 ${card}`}>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm">{t("contentLoading")}</p>
        </div>
      </article>
    );
  }

  if (!data) return null;

  const articleItems = data.articles?.length ? data.articles : data.summary ? [data.summary] : [];
  const explanationItems = data.explanations?.length ? data.explanations : data.summary ? [data.summary] : [];

  return (
    <article className={`rounded-2xl border p-5 ${card}`}>
      <h3 className={`mb-2 text-base font-semibold tracking-tight ${title}`}>{data.title ?? t("contentTitle")}</h3>
      <p className="mb-4 text-sm leading-relaxed opacity-90">{data.summary}</p>

      <section className="mb-4">
        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${label}`}>{t("contentExplanations")}</p>
        <ul className="space-y-1.5 text-sm">
          {explanationItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-blue-500">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4">
        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${label}`}>{t("contentArticles")}</p>
        <ul className="space-y-1.5 text-sm">
          {articleItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-blue-500">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {!!data.examples?.length && (
        <section className="mb-4">
          <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${label}`}>{t("contentExamples")}</p>
          <ul className="space-y-1.5 text-sm">
            {data.examples.map((example) => (
              <li key={example} className="flex gap-2">
                <span className="text-blue-500">·</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!data.references?.length && (
        <section>
          <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${label}`}>{t("contentReferences")}</p>
          <ul className="space-y-1.5 text-sm">
            {data.references.map((reference) => (
              <li key={reference} className="flex gap-2">
                <span className="text-blue-500">·</span>
                <span>{reference}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
