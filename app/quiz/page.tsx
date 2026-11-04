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
            <span className={styles.entryStep}>01 · WITHOUT CAMERA</span>
            <h3>Quick quiz</h3><p className={styles.entryDescription}>7 simple questions</p>
            <Link className={styles.entryQuiz} href="/quiz?start=questions">Start quiz →</Link>
          </div>
          <div className={`${styles.entryTile} ${styles.entryScanTile}`}>
            <span className={styles.entryCameraIcon} aria-hidden="true">◎</span>
            <span className={styles.entryStep}>02 · LIVE CAMERA</span>
            <h3>Face scan</h3><p className={styles.entryDescription}>See colors beside your face</p>
            <Link className={styles.entryCamera} href="/quiz?mode=draping&method=camera">Start scan →</Link>
          </div>
        </div>
      </div>
    </section>}><QuizHub/></Suspense>
  </div>;
}
