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
    title: "Math Foundations",
    explanation:
      "Math helps you break complex problems into logical steps using patterns and operations.",
    steps: [
      "Identify known values and unknown values.",
      "Choose a strategy (equation, diagram, table).",
      "Solve step by step and verify the result.",
    ],
    practiceQuestions: [
      "A class has 28 students and 9 are absent. How many are present?",
      "Solve: 3(x + 2) = 21. Explain each step.",
      "How can estimation help you check your answer quickly?",
    ],
  },
  {
    slug: "science",
    title: "Science Inquiry",
    explanation:
      "Science explores the world by asking questions, testing ideas, and analyzing evidence.",
    steps: [
      "Write a testable question.",
      "Create a hypothesis and identify variables.",
      "Run an experiment and record observations.",
    ],
    practiceQuestions: [
      "Design a small experiment to compare plant growth in light vs. shade.",
      "Which variable should stay constant in your experiment?",
      "How would you explain unexpected data?",
    ],
  },
  {
    slug: "language",
    title: "Language Skills",
    explanation:
      "Language learning improves communication by combining vocabulary, grammar, and comprehension.",
    steps: [
      "Read a short text and find key ideas.",
      "Highlight new vocabulary and infer meaning from context.",
      "Write a response using clear structure and supporting examples.",
    ],
    practiceQuestions: [
      "Summarize a paragraph in two sentences.",
      "Use the word 'analyze' in a meaningful sentence.",
      "What detail from the text best supports the main idea?",
    ],
  },
  {
    slug: "history",
    title: "History & Civilizations",
    explanation:
      "History helps you understand how events, ideas, and people shaped the modern world.",
    steps: [
      "Identify the time period and key context.",
      "Analyze causes, consequences, and different perspectives.",
      "Connect past patterns to present-day issues.",
    ],
    practiceQuestions: [
      "What were two major causes of the selected historical event?",
      "How did this event affect daily life for people at that time?",
      "What lessons can modern societies learn from it?",
    ],
  },
  {
    slug: "technology",
    title: "Technology Fundamentals",
    explanation:
      "Technology topics build computational thinking and practical digital problem-solving skills.",
    steps: [
      "Define the problem and user need.",
      "Break the solution into smaller components.",
      "Test and improve using feedback.",
    ],
    practiceQuestions: [
      "What is one everyday problem that could be solved with an app?",
      "How would you break that solution into three technical tasks?",
      "What would you test first before launch?",
    ],
  },
  {
    slug: "economics",
    title: "Economics & Finance",
    explanation:
      "Economics explains how people and societies make decisions with limited resources.",
    steps: [
      "Define needs, wants, and available resources.",
      "Evaluate opportunity cost and trade-offs.",
      "Analyze market behavior and decision outcomes.",
    ],
    practiceQuestions: [
      "What is an opportunity cost in a school-related decision?",
      "How can supply and demand affect the price of a product?",
      "Why is budgeting an important economic skill?",
    ],
  },
  {
    slug: "arts",
    title: "Arts & Creative Expression",
    explanation:
      "Arts develop creativity, interpretation skills, and communication through different media.",
    steps: [
      "Observe examples and identify style elements.",
      "Plan a concept using composition and intent.",
      "Create, reflect, and iterate your work.",
    ],
    practiceQuestions: [
      "What emotion does this artwork communicate and how?",
      "Which design elements are most visible in your composition?",
      "What would you improve in a second version of your work?",
    ],
  },
  {
    slug: "health",
    title: "Health & Wellbeing",
    explanation:
      "Health education supports balanced living through physical, emotional, and social wellbeing.",
    steps: [
      "Assess current habits and lifestyle choices.",
      "Set realistic goals for daily wellness.",
      "Track progress and adjust routines over time.",
    ],
    practiceQuestions: [
      "What is one healthy habit you can start this week?",
      "How does sleep affect learning performance?",
      "How can stress management improve wellbeing?",
    ],
  },
];

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
