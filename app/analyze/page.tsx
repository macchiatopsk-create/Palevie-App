import Analyzer from "@/components/Analyzer";
export const metadata={title:"Shopping Color Check — Palevie"};
export default function AnalyzePage(){return <div className="app-wrap"><div className="app-title"><div><div className="eyebrow">Before checkout</div><h1>Check this color.</h1><p>The product image stays in the browser for deterministic dominant-color extraction. Generative AI is optional and used only for short explanation copy when configured.</p></div></div><Analyzer/></div>}
