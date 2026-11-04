/**
 * One-time operator diagnostic: sample central opaque pixels from Rare Beauty's
 * official miniature shade-selector images. Does not download or commit images,
 * does not scrape third-party prices, does not claim real-world skin accuracy.
 *
 * Output marker RARE_SWATCH_PIXEL_AUDIT for review, never automatic promotion.
 * Use only for explicitly confirmed official URLs.
 */
const fs=require("node:fs");
const sharp=require("sharp");
const input=fs.readFileSync("data/brandDescribedHues.ts","utf8");
const marker="export const BRAND_DESCRIBED_HUES:Readonly<Record<string,BrandDescribedHue>>=";
const start=input.indexOf(marker);
if(start<0)throw Error("Source records missing");
const entries=JSON.parse(input.slice(start+marker.length).trim().replace(/;\s*$/,""));
const targets=Object.entries(entries).filter(([,e])=>e.officialSwatchAsset);
const median=a=>{const sorted=a.slice().sort((x,y)=>x-y);return sorted[Math.floor(sorted.length/2)];};
function sample(buffer){
 return sharp(buffer).ensureAlpha().raw().toBuffer({resolveWithObject:true}).then(({data,info})=>{
 const {width:w,height:h,channels:c}=info;
 const x1=Math.floor(w*.33),x2=Math.ceil(w*.67),y1=Math.floor(h*.33),y2=Math.ceil(h*.67);
 const rgb=[[],[],[]], alpha=[];
 for(let y=y1;y<y2;y++)for(let x=x1;x<x2;x++){
  const k=(y*w+x)*c,a=data[k+3];alpha.push(a);
  if(a<245)continue;
  for(let j=0;j<3;j++)rgb[j].push(data[k+j]);
 }
 if(!rgb[0].length)return{failure:"central region has no opaque pixels",width:w,height:h};
 const m=rgb.map(median);
 const mad=rgb.map((v,j)=>median(v.map(z=>Math.abs(z-m[j]))));
 const hex="#"+m.map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
 return{hex,width:w,height:h,opaqueFraction:Number((rgb[0].length/alpha.length).toFixed(3)),mad,medianRGB:m,centralPixels:rgb[0].length};
 });
}
async function one([id,entry]){
 const source=entry.officialSwatchAsset;
 // Request a consistent thumbnail width while preserving original image and v.
 const url=source.replace(/width=(?:64|164)/,"width=164");
 const parsed=new URL(url);
 if(parsed.protocol!=="https:"||parsed.hostname!=="www.rarebeauty.com"||!parsed.pathname.startsWith("/cdn/shop/files/swatch-"))throw Error("Untrusted image source");
 try{
  const res=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(14000),headers:{"accept":"image/png,image/*;q=0.8","user-agent":"PalevieShadeResearch/1.0"}});
  if(!res.ok)return{id,shade:entry.shade,status:res.status,failure:"HTTP "+res.status};
  const bytes=Buffer.from(await res.arrayBuffer());
  if(!bytes.length||bytes.length>300000)return{id,shade:entry.shade,failure:"image byte size invalid: "+bytes.length};
  const computed=await sample(bytes);
  return{id,shade:entry.shade,url,bytes:bytes.length,old:entry.illustrativeHex,...computed};
 }catch(err){return{id,shade:entry.shade,failure:String(err?.message||err).slice(0,180)};}
}
(async()=>{
 console.log("RARE_SWATCH_PIXEL_AUDIT_START targets="+targets.length);
 const out=[];
 for(let i=0;i<targets.length;i+=4){
   const batch=await Promise.all(targets.slice(i,i+4).map(one));out.push(...batch);
 }
 for(const r of out)console.log("RARE_SWATCH_PIXEL_AUDIT "+JSON.stringify(r));
 const ok=out.filter(x=>x.hex&&x.opaqueFraction>=.9&&Math.max(...x.mad)<=20);
 console.log("RARE_SWATCH_PIXEL_AUDIT_SUMMARY "+JSON.stringify({downloaded:out.filter(x=>x.hex).length,reliableFlatCentralSamples:ok.length,failed:out.filter(x=>x.failure).length}));
})().catch(e=>{console.error("RARE_SWATCH_PIXEL_AUDIT_FATAL",String(e));process.exitCode=1;});
