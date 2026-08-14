import PhotoDiagnosis from "@/components/PhotoDiagnosis";

export const metadata = { title: "Private Selfie Color Scan — Palevie" };

export default function DiagnosePage() {
  return (
    <div className="pvx-diagnose-page">
      <PhotoDiagnosis />
    </div>
  );
}
