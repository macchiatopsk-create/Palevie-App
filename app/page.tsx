import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

export default function HomePage() {
  return <div className="app-wrap narrow h2-wrap">
    <Suspense fallback={null}><HomeClient/></Suspense>
  </div>;
}
