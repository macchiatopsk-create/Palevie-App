export async function extractDominantColor(file: File): Promise<[number,number,number]> {
  const bitmap = await createImageBitmap(file);
  const max = 220;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  const data = ctx.getImageData(0,0,width,height).data;
  const buckets = new Map<string,{count:number,r:number,g:number,b:number}>();
  for(let i=0;i<data.length;i+=16){
    const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
    if(a<180) continue;
    const maxC=Math.max(r,g,b), minC=Math.min(r,g,b);
    if(maxC>242 && minC>235) continue;
    if(maxC<18) continue;
    const qr=Math.round(r/20)*20, qg=Math.round(g/20)*20, qb=Math.round(b/20)*20;
    const key=`${qr},${qg},${qb}`;
    const old=buckets.get(key)??{count:0,r:0,g:0,b:0};
    old.count+=1;old.r+=r;old.g+=g;old.b+=b;buckets.set(key,old);
  }
  const sorted=[...buckets.values()].sort((a,b)=>b.count-a.count);
  if(!sorted.length) return [128,128,128];
  const top=sorted.slice(0,3);
  const total=top.reduce((s,x)=>s+x.count,0);
  return [0,1,2].map(channel=>Math.round(top.reduce((s,x)=>s+(channel===0?x.r:channel===1?x.g:x.b),0)/total)) as [number,number,number];
}

export async function resizeImageForAI(file: File, maxDimension=768, quality=.82): Promise<string> {
  const bitmap=await createImageBitmap(file);
  const scale=Math.min(1,maxDimension/Math.max(bitmap.width,bitmap.height));
  const width=Math.max(1,Math.round(bitmap.width*scale));
  const height=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement("canvas");
  canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext("2d");
  if(!ctx) throw new Error("Canvas is unavailable in this browser.");
  ctx.drawImage(bitmap,0,0,width,height);
  return canvas.toDataURL("image/jpeg",quality);
}
