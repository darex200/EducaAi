import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "EducaAI — Aprendizaje guiado con inteligencia artificial",
  description:
    "Plataforma educativa con tutor de IA adaptativo, seguimiento de progreso y herramientas para estudiar con método y responsabilidad.",
};

export default function Home() {
  return <LandingPage />;
}
