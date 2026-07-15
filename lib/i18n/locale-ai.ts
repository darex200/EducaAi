import type { AppLocale } from "@/lib/i18n/translations";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/translations";

export function normalizeAppLocale(value?: string): AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale) ? (value as AppLocale) : DEFAULT_LOCALE;
}

export function aiLanguageLabel(locale: AppLocale) {
  const labels = { en: "English", es: "Spanish", pt: "Portuguese" } as const;
  return labels[locale];
}

export function aiJsonSystemPrompt(locale: AppLocale) {
  const language = aiLanguageLabel(locale);
  return `You are an expert educational content generator. Respond only with valid JSON in ${language}, without markdown.`;
}

export function fallbackSubtopics(topic: string, locale: AppLocale) {
  const templates = {
    en: [`Introduction to ${topic}`, `Key concepts of ${topic}`, `Applications of ${topic}`],
    es: [`Introducción a ${topic}`, `Conceptos clave de ${topic}`, `Aplicaciones de ${topic}`],
    pt: [`Introdução a ${topic}`, `Conceitos-chave de ${topic}`, `Aplicações de ${topic}`],
  } as const;
  return [...templates[locale]];
}

export function fallbackTopicContent(topic: string, locale: AppLocale) {
  const copy = {
    en: {
      summary: `${topic} is a key topic for building conceptual understanding and analytical skills.`,
      examples: [
        `Example 1: basic application of ${topic}.`,
        `Example 2: intermediate practical case of ${topic}.`,
      ],
      references: [
        "Recommended article: fundamentals of the topic.",
        "Academic reference: structured conceptual review.",
      ],
    },
    es: {
      summary: `${topic} es un tema clave para desarrollar comprensión conceptual y capacidad de análisis.`,
      examples: [
        `Ejemplo 1: aplicación básica de ${topic}.`,
        `Ejemplo 2: caso práctico intermedio de ${topic}.`,
      ],
      references: [
        "Artículo recomendado: fundamentos del tema.",
        "Referencia académica: revisión conceptual estructurada.",
      ],
    },
    pt: {
      summary: `${topic} é um tópico-chave para desenvolver compreensão conceitual e capacidade de análise.`,
      examples: [
        `Exemplo 1: aplicação básica de ${topic}.`,
        `Exemplo 2: caso prático intermediário de ${topic}.`,
      ],
      references: [
        "Artigo recomendado: fundamentos do tópico.",
        "Referência acadêmica: revisão conceitual estruturada.",
      ],
    },
  } as const;

  const block = copy[locale];
  return {
    title: topic,
    summary: block.summary,
    examples: [...block.examples],
    references: [...block.references],
  };
}

export function fallbackOnboardingTopics(subjects: string[], level: string, locale: AppLocale) {
  const subject = subjects[0] || (locale === "en" ? "General learning" : locale === "pt" ? "Aprendizagem geral" : "Aprendizaje general");

  const catalogs = {
    en: {
      Matematicas: [
        "Algebra and equations",
        "Analytic geometry",
        "Trigonometry",
        "Differential and integral calculus",
        "Statistics and probability",
        "Financial mathematics",
      ],
      Fisica: [
        "Motion and velocity",
        "Force and energy",
        "Newton's laws",
        "Waves and sound",
        "Electricity basics",
        "Energy conservation",
      ],
      Quimica: [
        "Atomic structure",
        "Chemical bonds",
        "Basic reactions",
        "The periodic table",
        "Solutions and mixtures",
        "Acids and bases",
      ],
      Lenguaje: [
        "Reading comprehension",
        "Text structure",
        "Grammar analysis",
        "Essay writing",
        "Vocabulary building",
        "Oral expression",
      ],
      Biologia: [
        "The cell",
        "Photosynthesis",
        "Ecosystems",
        "Genetics basics",
        "Human body systems",
        "Evolution",
      ],
      Historia: [
        "Timelines",
        "Causes and consequences",
        "Historical sources",
        "Revolutions",
        "Ancient civilizations",
        "Modern history",
      ],
    },
    es: {
      Matematicas: [
        "Álgebra y ecuaciones",
        "Geometría analítica",
        "Trigonometría",
        "Cálculo diferencial e integral",
        "Estadística y probabilidad",
        "Matemáticas financieras",
      ],
      Fisica: [
        "Movimiento y velocidad",
        "Fuerza y energía",
        "Leyes de Newton",
        "Ondas y sonido",
        "Electricidad básica",
        "Conservación de la energía",
      ],
      Quimica: [
        "Estructura atómica",
        "Enlaces químicos",
        "Reacciones básicas",
        "Tabla periódica",
        "Soluciones y mezclas",
        "Ácidos y bases",
      ],
      Lenguaje: [
        "Comprensión lectora",
        "Estructura textual",
        "Análisis gramatical",
        "Redacción de ensayos",
        "Ampliación de vocabulario",
        "Expresión oral",
      ],
      Biologia: [
        "Célula",
        "Fotosíntesis",
        "Ecosistemas",
        "Genética básica",
        "Sistemas del cuerpo humano",
        "Evolución",
      ],
      Historia: [
        "Líneas del tiempo",
        "Causas y consecuencias",
        "Fuentes históricas",
        "Revoluciones",
        "Civilizaciones antiguas",
        "Historia moderna",
      ],
    },
    pt: {
      Matematicas: [
        "Álgebra e equações",
        "Geometria analítica",
        "Trigonometria",
        "Cálculo diferencial e integral",
        "Estatística e probabilidade",
        "Matemática financeira",
      ],
      Fisica: [
        "Movimento e velocidade",
        "Força e energia",
        "Leis de Newton",
        "Ondas e som",
        "Eletricidade básica",
        "Conservação de energia",
      ],
      Quimica: [
        "Estrutura atômica",
        "Ligações químicas",
        "Reações básicas",
        "Tabela periódica",
        "Soluções e misturas",
        "Ácidos e bases",
      ],
      Lenguaje: [
        "Compreensão de leitura",
        "Estrutura textual",
        "Análise gramatical",
        "Redação de ensaios",
        "Ampliação de vocabulário",
        "Expressão oral",
      ],
      Biologia: [
        "Célula",
        "Fotossíntese",
        "Ecossistemas",
        "Genética básica",
        "Sistemas do corpo humano",
        "Evolução",
      ],
      Historia: [
        "Linhas do tempo",
        "Causas e consequências",
        "Fontes históricas",
        "Revoluções",
        "Civilizações antigas",
        "História moderna",
      ],
    },
  } as const;

  const catalog = catalogs[locale];
  const match = catalog[subject as keyof typeof catalog];
  if (match) return [...match];

  const generic = {
    en: [`Fundamentals of ${subject}`, `Practice exercises for ${subject}`, `Review for ${level}`],
    es: [`Fundamentos de ${subject}`, `Ejercicios de ${subject}`, `Repaso de ${level}`],
    pt: [`Fundamentos de ${subject}`, `Exercícios de ${subject}`, `Revisão de ${level}`],
  } as const;
  return [...generic[locale]];
}

export function topicCategoryKeys() {
  return [
    "categoryScience",
    "categoryMath",
    "categoryLanguage",
    "categoryHistory",
    "categoryTechnology",
  ] as const;
}

export type TopicCategoryKey = ReturnType<typeof topicCategoryKeys>[number];
