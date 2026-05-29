import { NestScoreExplanation } from "@/components/nestscore/nestscore-explanation";

export default function NestScorePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <NestScoreExplanation />
    </main>
  );
}