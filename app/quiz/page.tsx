import QuizClient from "@/components/QuizClient";

export const metadata = { title: "Free Personal Color Quiz — Palevie" };

export default function QuizPage() {
  return (
    <div className="pvx-quiz-page">
      <div className="pvx-page-ambient pvx-ambient-left" />
      <div className="pvx-page-ambient pvx-ambient-right" />
      <QuizClient />
    </div>
  );
}
