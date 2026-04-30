"use client";

type ContentData = {
  title?: string;
  summary?: string;
  examples?: string[];
  references?: string[];
};

type ContentViewerProps = {
  data: ContentData | null;
  loading: boolean;
};

export function ContentViewer({ data, loading }: ContentViewerProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Generando contenido estructurado...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-2 text-base font-semibold text-slate-900">{data.title}</h4>
      <p className="mb-3 text-sm leading-6 text-slate-700">{data.summary}</p>

      {!!data.examples?.length && (
        <section className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Ejemplos</p>
          <ul className="space-y-1 text-sm text-slate-700">
            {data.examples.map((example) => (
              <li key={example}>• {example}</li>
            ))}
          </ul>
        </section>
      )}

      {!!data.references?.length && (
        <section>
          <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Referencias</p>
          <ul className="space-y-1 text-sm text-slate-700">
            {data.references.map((reference) => (
              <li key={reference}>• {reference}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
