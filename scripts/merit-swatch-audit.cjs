/** Human-review diagnostic of licensed-origin hosted MERIT swatch photographs.
 * Do NOT promote to accurate physical product color without reviewing masks.
 * No image files are committed, saved or republished.
 */
const sharp=require("sharp");
const sources=[
  {
    "id": "merit-flush-shade-01",
    "shade": "Beverly Hills",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-BeverlyHills-Swatch.jpg?v=1752587581&width=352"
  },
  {
    "id": "merit-flush-shade-02",
    "shade": "Stockholm",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Stockholm-Swatch.jpg?v=1744400861&width=352"
  },
  {
    "id": "merit-flush-shade-03",
    "shade": "Archival",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Archival-Swatch.jpg?v=1752587584&width=352"
  },
  {
    "id": "merit-flush-shade-04",
    "shade": "Cheeky",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Cheeky-Swatch.jpg?v=1752587584&width=352"
  },
  {
    "id": "merit-flush-shade-05",
    "shade": "Le Bonbon",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-LeBonBon-Swatch.jpg?v=1744400866&width=352"
  },
  {
    "id": "merit-flush-shade-06",
    "shade": "Fox",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Fox-Swatch.jpg?v=1744400858&width=352"
  },
  {
    "id": "merit-flush-shade-07",
    "shade": "Après",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Apres-Swatch.jpg?v=1752587584&width=352"
  },
  {
    "id": "merit-flush-shade-08",
    "shade": "Postmodern",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Postmodern-Swatch.jpg?v=1744400863&width=352"
  },
  {
    "id": "merit-flush-shade-09",
    "shade": "Persimmon",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Persimmon-Swatch.jpg?v=1744400859&width=352"
  },
  {
    "id": "merit-flush-shade-10",
    "shade": "Lusitano",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Lusitano-Swatch.jpg?v=1744400865&width=352"
  },
  {
    "id": "merit-flush-shade-11",
    "shade": "Rouge",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Rouge-Swatch.jpg?v=1744400862&width=352"
  },
  {
    "id": "merit-flush-shade-12",
    "shade": "Terracotta",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Terracotta-Swatch.jpg?v=1744400868&width=352"
  },
  {
    "id": "merit-flush-shade-13",
    "shade": "Bespoke",
    "source": "https://www.meritbeauty.com/cdn/shop/files/MERIT24-FlushBalm-Bespoke-Swatch.jpg?v=1744400867&width=352"
  }
];
function med(xs){if(!xs.length)return null;const a=xs.slice().sort((x,y)=>x-y);return a[Math.floor(a.length/2)];}
function quant(xs,percent){const a=xs.slice().sort((x,y)=>x-y);return a[Math.floor((a.length-1)*percent)];}
async function sample(image){
 const {data,info}=await sharp(image).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h,channels:c}=info;
 const channels=[[],[],[]],centerA=[[],[],[]];
 let total=0,paint=0,edgeTotal=0,edgeWhite=0,centerTotal=0,centerPaint=0;
 const sampleAt=(x,y)=>{const o=(y*w+x)*c;return [data[o],data[o+1],data[o+2]]};
 const px=(x,y)=>{const [r,g,b]=sampleAt(x,y),bright=Math.max(r,g,b),dark=Math.min(r,g,b);
   // Remove white and nearly gray studio backdrops; retain warm/cool pigment.
   const colored=bright-dark>Math.max(17,bright*.065)&&bright<249&&dark<245;
   return {rgb:[r,g,b],colored,white:Math.min(r,g,b)>244};
 };
 const x0=Math.floor(w*.16),x1=Math.ceil(w*.84),y0=Math.floor(h*.16),y1=Math.ceil(h*.84);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const edge=x<w*.08||x>w*.92||y<h*.08||y>h*.92;
   const center=x>=x0&&x<x1&&y>=y0&&y<y1;
   const p=px(x,y);total++;
   if(edge){edgeTotal++;if(p.white)edgeWhite++;}
   if(center){centerTotal++;if(p.colored){centerPaint++;p.rgb.forEach((v,k)=>centerA[k].push(v));}}
   if(p.colored){paint++;p.rgb.forEach((v,k)=>channels[k].push(v));}
 }
 const pick=(a)=>a.map(med),mad=(a,m)=>a.map((v,i)=>med(v.map(x=>Math.abs(x-m[i])))),color=(v)=>v&&"#"+v.map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();
 const m=pick(channels),mc=pick(centerA);
 const rgbAt=(x,y)=>sampleAt(Math.round(w*x),Math.round(h*y));
 const grid=[];
 for(let yy=0;yy<12;yy++){
  let row="";
  for(let xx=0;xx<12;xx++){
    const {colored,white}=px(Math.floor(w*(xx+.5)/12),Math.floor(h*(yy+.5)/12));
    row+=colored?"#":white?"·":"o";
  }grid.push(row);
 }
 return {size:[w,h],pigmentFraction:+(paint/total).toFixed(3),centerPigmentFraction:+(centerPaint/centerTotal).toFixed(3),
   borderWhiteFraction:+(edgeWhite/edgeTotal).toFixed(3),medianColor:color(m),centerMedianColor:color(mc),
   channelMAD:m&&mad(channels,m),centerMAD:mc&&mad(centerA,mc),
   sampleRGB:{middle:rgbAt(.5,.5),quarter:rgbAt(.25,.5),threeQuarter:rgbAt(.75,.5)},
   ascii:grid.join("/"),paintPixels:paint,centerPaintPixels:centerPaint};
}
async function runOne(x){
 const url=new URL(x.source);
 if(url.hostname!=="www.meritbeauty.com"||!url.pathname.startsWith("/cdn/shop/files/MERIT24-FlushBalm-")||!url.pathname.endsWith("-Swatch.jpg"))throw Error("Unexpected source");
 try{
  const res=await fetch(url,{headers:{accept:"image/jpeg,image/*;q=0.7","user-agent":"PalevieSwatchResearch/1.0"},signal:AbortSignal.timeout(18000)});
  if(!res.ok)return{...x,error:"HTTP "+res.status};
  const b=Buffer.from(await res.arrayBuffer());if(b.length>650000||b.length<500)return{...x,error:"Unexpected byte size: "+b.length};
  return{...x,bytes:b.length,...await sample(b)};
 }catch(e){return{...x,error:String(e.message||e).slice(0,140)}}
}
(async()=>{
 console.log("MERIT_SWATCH_AUDIT_START "+sources.length);
 const all=[];for(let i=0;i<sources.length;i+=4)all.push(...await Promise.all(sources.slice(i,i+4).map(runOne)));
 for(const entry of all)console.log("MERIT_SWATCH_AUDIT "+JSON.stringify(entry));
 console.log("MERIT_SWATCH_AUDIT_SUMMARY "+JSON.stringify({total:all.length,analyzed:all.filter(x=>x.centerMedianColor).length,failed:all.filter(x=>x.error).length}));
})();
