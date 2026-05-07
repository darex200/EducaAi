"use client";

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
};

export function ContentViewer({ data, loading }: ContentViewerProps) {
  if (loading) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">Generando explicaciones y contenido...</p>
      </article>
    );
  }

  if (!data) return null;

  const articleItems = data.articles?.length ? data.articles : data.summary ? [data.summary] : [];
  const explanationItems = data.explanations?.length ? data.explanations : data.summary ? [data.summary] : [];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{data.title ?? "Contenido del tema"}</h3>
      <p className="mb-4 text-sm leading-6 text-slate-700">{data.summary}</p>

      <section className="mb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Explicaciones</p>
        <ul className="space-y-1 text-sm text-slate-700">
          {explanationItems.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Articulos</p>
        <ul className="space-y-1 text-sm text-slate-700">
          {articleItems.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </section>

      {!!data.examples?.length && (
        <section className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Ejemplos</p>
          <ul className="space-y-1 text-sm text-slate-700">
            {data.examples.map((example) => (
              <li key={example}>- {example}</li>
            ))}
          </ul>
        </section>
      )}

      {!!data.references?.length && (
        <section>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Referencias</p>
          <ul className="space-y-1 text-sm text-slate-700">
            {data.references.map((reference) => (
              <li key={reference}>- {reference}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
