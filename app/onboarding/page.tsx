import { Navbar } from "@/components/navbar";
import { OnboardingSurvey } from "@/components/onboarding/onboarding-survey";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <OnboardingSurvey />
      </main>
    </div>
  );
}
