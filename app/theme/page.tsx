import ThemePicker from "@/components/ThemePicker";
export const metadata={title:"Look & feel — Palevie"};
export default function ThemePage(){
  return <div className="app-wrap narrow">
    <div className="app-title centered"><div>
      <div className="eyebrow">Preview</div>
      <h1>Look &amp; feel.</h1>
      <p>Try the beach theme. Nothing is permanent — switch back any time.</p>
    </div></div>
    <ThemePicker/>
  </div>;
}
