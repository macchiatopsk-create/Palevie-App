import { Suspense } from "react";
import ProfileSetup from "@/components/ProfileSetup";

export const metadata = { title: "Finish signing up · Palevie" };

export default function SetupPage() {
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><ProfileSetup/></Suspense>
  </div>;
}
