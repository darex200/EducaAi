import { chatJSON } from "@/lib/ai/openai";

export type ConceptNode = {
  concept: string;
  children?: ConceptNode[];
};

export type DocumentAnalysis = {
  extractedText: string;
  summary: string;
  topics: string[];
  errorsFound: string[];
  exercises: Array<{ question: string; answer?: string }>;
  conceptMap: ConceptNode | null;
};

const ANALYSIS_SCHEMA = [
  "Responde SOLO con JSON válido con esta forma exacta:",
  "{",
  '  "extractedText": "transcripción fiel del contenido (texto, fórmulas en LaTeX con $...$, enunciados)",',
  '  "summary": "resumen claro del contenido en 3-6 frases",',
  '  "topics": ["temas académicos concretos detectados"],',
  '  "errorsFound": ["errores detectados en el documento (cálculos, conceptos, ortografía relevante); vacío si no hay"],',
  '  "exercises": [{"question": "ejercicio nuevo basado en el contenido", "answer": "solución o criterios"}] (3 a 5 ejercicios),',
  '  "conceptMap": {"concept": "tema central", "children": [{"concept": "subtema", "children": [{"concept": "detalle"}]}]}',
  "}",
  "Prohibido dar descripciones genéricas tipo 'la imagen muestra texto'. Extrae y analiza el contenido académico real.",
  "Todo en español.",
].join("\n");

function normalizeAnalysis(raw: unknown): DocumentAnalysis | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const summary = String(item.summary ?? "").trim();
  if (!summary) return null;

  return {
    extractedText: String(item.extractedText ?? "").trim(),
    summary,
    topics: Array.isArray(item.topics)
      ? item.topics.map((t) => String(t).trim()).filter(Boolean).slice(0, 10)
      : [],
    errorsFound: Array.isArray(item.errorsFound)
      ? item.errorsFound.map((e) => String(e).trim()).filter(Boolean).slice(0, 10)
      : [],
    exercises: Array.isArray(item.exercises)
      ? item.exercises.reduce<Array<{ question: string; answer?: string }>>(
          (acc, exercise) => {
            if (acc.length >= 6 || !exercise || typeof exercise !== "object") return acc;
            const e = exercise as Record<string, unknown>;
            const question = String(e.question ?? "").trim();
            if (!question) return acc;
            const answer = String(e.answer ?? "").trim();
            acc.push(answer ? { question, answer } : { question });
            return acc;
          },
          [],
        )
      : [],
    conceptMap:
      item.conceptMap && typeof item.conceptMap === "object"
        ? (item.conceptMap as ConceptNode)
        : null,
  };
}

/** Analiza una imagen (foto de cuaderno, ejercicio, diapositiva) con visión. */
export async function analyzeImageDocument(
  imageDataUrl: string,
  context?: { topic?: string },
): Promise<DocumentAnalysis | null> {
  const result = await chatJSON<unknown>(
    [
      {
        role: "system",
        content: `Eres un analista académico de documentos. Analiza la imagen de material de estudio.\n${ANALYSIS_SCHEMA}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analiza este documento académico.${context?.topic ? ` Tema de estudio actual: ${context.topic}.` : ""}`,
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    { temperature: 0.2, maxTokens: 2500 },
  );
  return normalizeAnalysis(result);
}

/** Analiza el texto extraído de un PDF. */
export async function analyzePdfText(
  text: string,
  context?: { topic?: string; fileName?: string },
): Promise<DocumentAnalysis | null> {
  const truncated = text.slice(0, 14000);
  const result = await chatJSON<unknown>(
    [
      {
        role: "system",
        content: `Eres un analista académico de documentos. Analiza el texto extraído de un PDF de estudio.\n${ANALYSIS_SCHEMA}`,
      },
      {
        role: "user",
        content: `Documento: ${context?.fileName ?? "PDF"}${context?.topic ? ` (tema actual: ${context.topic})` : ""}\n\nCONTENIDO:\n${truncated}`,
      },
    ],
    { temperature: 0.2, maxTokens: 2500 },
  );
  const analysis = normalizeAnalysis(result);
  if (analysis && !analysis.extractedText) {
    analysis.extractedText = truncated.slice(0, 4000);
  }
  return analysis;
}

function renderConceptMap(node: ConceptNode, depth = 0): string[] {
  const indent = "  ".repeat(depth);
  const lines = [`${indent}- **${node.concept}**`];
  for (const child of node.children ?? []) {
    lines.push(...renderConceptMap(child, depth + 1));
  }
  return lines;
}

/** Convierte el análisis en un mensaje enriquecido (markdown) para el chat. */
export function buildAnalysisMarkdown(fileName: string, analysis: DocumentAnalysis) {
  const sections: string[] = [`### Análisis del documento: ${fileName}`, "", `**Resumen:** ${analysis.summary}`];

  if (analysis.topics.length) {
    sections.push("", "**Temas detectados:**", ...analysis.topics.map((topic) => `- ${topic}`));
  }

  if (analysis.errorsFound.length) {
    sections.push("", "**Errores detectados:**", ...analysis.errorsFound.map((error) => `- ⚠ ${error}`));
  }

  if (analysis.exercises.length) {
    sections.push("", "**Ejercicios propuestos:**");
    analysis.exercises.forEach((exercise, index) => {
      sections.push(`${index + 1}. ${exercise.question}`);
    });
  }

  if (analysis.conceptMap) {
    sections.push("", "**Mapa conceptual:**", ...renderConceptMap(analysis.conceptMap));
  }

  sections.push(
    "",
    "_¿Quieres que trabajemos alguno de estos temas, resolvamos los ejercicios o que te genere un cuestionario?_",
  );

  return sections.join("\n");
}
