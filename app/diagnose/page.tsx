import PhotoDiagnosis from "@/components/PhotoDiagnosis";
export const metadata={title:"AI Color Scan — Palevie"};
export default function DiagnosePage(){return <div className="app-wrap narrow"><div className="app-title centered"><div><div className="eyebrow">Optional second opinion</div><h1>AI-assisted color scan.</h1><p>Use this after the quiz if you want a photo-based estimate. The app resizes the photo before sending it and does not intentionally save the selfie in this MVP.</p></div></div><PhotoDiagnosis/></div>}
