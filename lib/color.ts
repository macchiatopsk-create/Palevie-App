import { AnalysisResult, ToneProfile, Verdict } from "./types";

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const int = Number.parseInt(clean, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export function rgbToHex([r,g,b]: [number,number,number]): string {
  return `#${[r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("")}`.toUpperCase();
}

function pivotRgb(n: number): number {
  const x = n / 255;
  return x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
}

export function rgbToLab([r,g,b]: [number,number,number]): [number,number,number] {
  const R=pivotRgb(r), G=pivotRgb(g), B=pivotRgb(b);
  let x=(R*.4124+G*.3576+B*.1805)/.95047;
  let y=(R*.2126+G*.7152+B*.0722);
  let z=(R*.0193+G*.1192+B*.9505)/1.08883;
  const f=(t:number)=>t>.008856?Math.cbrt(t):(7.787*t)+(16/116);
  x=f(x); y=f(y); z=f(z);
  return [(116*y)-16,500*(x-y),200*(y-z)];
}

export function deltaE(a: [number,number,number], b: [number,number,number]): number {
  return Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);
}

function classifyColor(rgb:[number,number,number]) {
  const [L,a,b]=rgbToLab(rgb);
  const chroma=Math.sqrt(a*a+b*b);
  const temperature=b + a*.28 > 7 ? "warm" : b + a*.28 < -2 ? "cool" : "neutral";
  const value=L>72?"light":L<38?"deep":"medium";
  const saturation=chroma>52?"bright":chroma<24?"soft":"medium";
  return {temperature,value,chroma:saturation,L};
}

export function scoreColor(rgb:[number,number,number], profile:ToneProfile) {
  const lab=rgbToLab(rgb);
  const distances=profile.colors.map(hex=>deltaE(lab,rgbToLab(hexToRgb(hex))));
  const nearest=Math.min(...distances);
  const base=Math.max(0,Math.min(100,100-nearest*1.55));
  const c=classifyColor(rgb);
  let compatibility=100;
  if(profile.temperature!=="neutral" && c.temperature!=="neutral" && profile.temperature!==c.temperature) compatibility-=25;
  if(profile.value!==c.value) compatibility-=12;
  if(profile.chroma!==c.chroma) compatibility-=12;
  const colorFit=Math.round(base*.72+compatibility*.28);
  return {colorFit, classification:c};
}

function nearestPaletteColors(rgb:[number,number,number], profile:ToneProfile, count=4){
  const source=rgbToLab(rgb);
  return [...profile.colors]
    .sort((a,b)=>deltaE(source,rgbToLab(hexToRgb(a)))-deltaE(source,rgbToLab(hexToRgb(b))))
    .slice(0,count);
}

export function buildAnalysis(params:{rgb:[number,number,number];profile:ToneProfile;productName:string}):AnalysisResult {
  const {rgb,profile,productName}=params;
  const {colorFit,classification}=scoreColor(rgb,profile);
  const score=colorFit;
  const verdict:Verdict=score>=78?"BUY":score>=58?"MAYBE":"SKIP";
  const temperatureText=classification.temperature==="neutral"?"balanced":`${classification.temperature}-leaning`;
  const summary=verdict==="BUY"
    ? `This ${temperatureText} shade is a strong match for your ${profile.name} palette.`
    : verdict==="MAYBE"
    ? `This color can work for ${profile.name}, but a nearby palette shade is likely to be easier to wear.`
    : `This shade sits outside the strongest part of your ${profile.name} palette. Try one of the closer alternatives below.`;
  return {id:crypto.randomUUID(),createdAt:new Date().toISOString(),productName:productName||"Untitled item",profileId:profile.id,profileName:profile.name,dominantHex:rgbToHex(rgb),dominantRgb:rgb,score,colorFit,verdict,summary,alternatives:nearestPaletteColors(rgb,profile)};
}
