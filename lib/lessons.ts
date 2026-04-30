export type Lesson = {
  slug: string;
  title: string;
  explanation: string;
  steps: string[];
  practiceQuestions: string[];
};

export const lessons: Lesson[] = [
  {
    slug: "math",
    title: "Fundamentos de Matematicas",
    explanation:
      "Las matematicas te ayudan a dividir problemas complejos en pasos logicos usando patrones y operaciones.",
    steps: [
      "Identifica los valores conocidos y los desconocidos.",
      "Elige una estrategia (ecuacion, diagrama o tabla).",
      "Resuelve paso a paso y verifica el resultado.",
    ],
    practiceQuestions: [
      "Una clase tiene 28 estudiantes y 9 estan ausentes. Cuantos estan presentes?",
      "Resuelve: 3(x + 2) = 21. Explica cada paso.",
      "Como puede la estimacion ayudarte a comprobar tu respuesta rapido?",
    ],
  },
  {
    slug: "science",
    title: "Investigacion Cientifica",
    explanation:
      "La ciencia explora el mundo haciendo preguntas, probando ideas y analizando evidencias.",
    steps: [
      "Escribe una pregunta comprobable.",
      "Crea una hipotesis e identifica variables.",
      "Realiza un experimento y registra observaciones.",
    ],
    practiceQuestions: [
      "Disena un pequeno experimento para comparar el crecimiento de plantas con luz y sombra.",
      "Que variable debe mantenerse constante en tu experimento?",
      "Como explicarias datos inesperados?",
    ],
  },
  {
    slug: "language",
    title: "Habilidades de Lenguaje",
    explanation:
      "El aprendizaje del lenguaje mejora la comunicacion al combinar vocabulario, gramatica y comprension.",
    steps: [
      "Lee un texto corto e identifica ideas clave.",
      "Subraya vocabulario nuevo e infiere su significado por contexto.",
      "Escribe una respuesta con estructura clara y ejemplos de apoyo.",
    ],
    practiceQuestions: [
      "Resume un parrafo en dos oraciones.",
      "Usa la palabra 'analizar' en una oracion con sentido.",
      "Que detalle del texto apoya mejor la idea principal?",
    ],
  },
  {
    slug: "history",
    title: "Historia y Civilizaciones",
    explanation:
      "La historia te ayuda a comprender como los eventos, las ideas y las personas formaron el mundo moderno.",
    steps: [
      "Identifica el periodo historico y el contexto principal.",
      "Analiza causas, consecuencias y diferentes perspectivas.",
      "Conecta patrones del pasado con problemas actuales.",
    ],
    practiceQuestions: [
      "Cuales fueron dos causas principales del evento historico seleccionado?",
      "Como afecto este evento la vida diaria de las personas en esa epoca?",
      "Que lecciones pueden aprender las sociedades actuales?",
    ],
  },
  {
    slug: "technology",
    title: "Fundamentos de Tecnologia",
    explanation:
      "Los temas de tecnologia desarrollan pensamiento computacional y habilidades practicas para resolver problemas digitales.",
    steps: [
      "Define el problema y la necesidad del usuario.",
      "Divide la solucion en componentes mas pequenos.",
      "Prueba y mejora usando retroalimentacion.",
    ],
    practiceQuestions: [
      "Cual es un problema cotidiano que podria resolverse con una app?",
      "Como dividirias esa solucion en tres tareas tecnicas?",
      "Que probarias primero antes del lanzamiento?",
    ],
  },
  {
    slug: "economics",
    title: "Economia y Finanzas",
    explanation:
      "La economia explica como personas y sociedades toman decisiones con recursos limitados.",
    steps: [
      "Define necesidades, deseos y recursos disponibles.",
      "Evalua costo de oportunidad y compensaciones.",
      "Analiza el comportamiento del mercado y los resultados de decision.",
    ],
    practiceQuestions: [
      "Que es un costo de oportunidad en una decision escolar?",
      "Como puede la oferta y la demanda afectar el precio de un producto?",
      "Por que presupuestar es una habilidad economica importante?",
    ],
  },
  {
    slug: "arts",
    title: "Artes y Expresion Creativa",
    explanation:
      "Las artes desarrollan creatividad, interpretacion y comunicacion a traves de diferentes medios.",
    steps: [
      "Observa ejemplos e identifica elementos de estilo.",
      "Planifica un concepto usando composicion e intencion.",
      "Crea, reflexiona e itera tu trabajo.",
    ],
    practiceQuestions: [
      "Que emocion comunica esta obra y como lo hace?",
      "Que elementos de diseno son mas visibles en tu composicion?",
      "Que mejorarias en una segunda version de tu trabajo?",
    ],
  },
  {
    slug: "health",
    title: "Salud y Bienestar",
    explanation:
      "La educacion en salud apoya una vida equilibrada mediante bienestar fisico, emocional y social.",
    steps: [
      "Evalua habitos actuales y decisiones de estilo de vida.",
      "Define metas realistas para el bienestar diario.",
      "Haz seguimiento y ajusta rutinas con el tiempo.",
    ],
    practiceQuestions: [
      "Cual es un habito saludable que puedes empezar esta semana?",
      "Como afecta el sueno al rendimiento en el aprendizaje?",
      "Como puede el manejo del estres mejorar el bienestar?",
    ],
  },
];

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
