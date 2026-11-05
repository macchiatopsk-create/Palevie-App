import { Suspense } from "react";
import Link from "next/link";
import styles from "@/components/QuickQuizClient.module.css";
import QuizHub from "@/components/QuizHub";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "7-Question Color Quiz & Camera Draping — Palevie",
  description: "Take a quick seven-question color quiz, then optionally compare colors beside your face using the on-device Live Guide, mirror, or deeper draping comparisons.",
  path: "/quiz",
});
// Render the initial quiz on the server, even before Android / in-app browser JS loads.
// Previously useSearchParams under a null Suspense fallback left the quiz area blank.
export const dynamic="force-dynamic";
export default function QuizPage(){
  return <div className="app-wrap narrow h2-wrap">
    <h1 className="route-heading">Personal color quiz</h1>
    <Suspense fallback={<section className={`${styles.quiz} ${styles.entryScreen}`} aria-label="Loading color check choices">
      <div className={styles.entryChoice}>
        <p className={styles.entryTitle}>YOUR COLOR JOURNEY</p>
        <h2 className={styles.entryHeading}>How would you like to begin?</h2>
        <div className={styles.entryGrid}>
          <div className={`${styles.entryTile} ${styles.entryQuizTile}`}>
            <div className={styles.entryIllustration} aria-hidden="true">✎</div>
            <span className={styles.entryStep}>01 · SELF CHECK</span>
            <h3>Self Quiz</h3><p className={styles.entryDescription}>7 self-guided questions</p><p className={styles.entryExplainer}><strong>Just your preferences</strong><span>Answer at your own pace. No camera or special tools needed.</span></p>
            <Link className={styles.entryQuiz} href="/quiz?start=questions">Start self quiz →</Link>
          </div>
          <div className={`${styles.entryTile} ${styles.entryScanTile}`}>
            <span className={styles.entryCameraIcon} aria-hidden="true">◎</span>
            <span className={styles.entryStep}>02 · CAMERA OR MIRROR</span>
            <h3>Live Draping</h3><p className={styles.entryDescription}>Try colors beside your face</p><p className={styles.entryExplainer}><strong>Camera or real mirror</strong><span>Use live camera colors or full-screen swatches. No picture is taken, saved, or uploaded.</span></p>
            <Link className={styles.entryCamera} href="/quiz?mode=draping&method=camera">Open draping →</Link>
          </div>
        </div>
      </div>
    </section>}><QuizHub/></Suspense>
  </div>;
}
