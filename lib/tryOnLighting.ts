/**
 * Private, on-device scene-quality checks for the live makeup mirror.
 *
 * Uses only the camera-frame pixels at two cheek ROIs to warn about clipped
 * lighting or severe left/right illumination imbalance. It does NOT estimate
 * skin color, undertone, personal color, makeup shade match, or pigmentation.
 * No pixels, image or RGB statistics are returned, stored, tracked or sent.
 */
export type LightingState="balanced"|"clipped"|"uneven"|"unavailable";
export type FramePixels=Pick<ImageData,"width"|"height"|"data">;
export type FacePoint={x:number;y:number};
const REQUIRED=[10,152,234,454,33,263,1,50,101,205,187,280,330,425,411];
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
function median(samples:number[]):number{
  if(!samples.length)return 0;
  const sorted=samples.sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
}
function perceptualLightness(rgb:readonly number[]):number{
  const x=rgb.map(value=>{
    const p=clamp(value/255,0,1);
    return p<=.04045?p/12.92:((p+.055)/1.055)**2.4;
  });
  const y=.2126*x[0]+.7152*x[1]+.0722*x[2];
  return y>216/24389?116*Math.cbrt(y)-16:24389/27*y;
}
function sampleCheek(frame:FramePixels,x:number,y:number,radius:number){
  const {width:w,height:h,data}=frame;
  const px=x*w,py=y*h,r=Math.max(2.7,radius*w);
  if(px-r<1||px+r>=w-1||py-r<1||py+r>=h-1)return null;
  const ch:number[][]=[[],[],[]];
  let dark=0,bright=0,count=0;
  const x0=Math.max(0,Math.ceil(px-r)),x1=Math.min(w-1,Math.floor(px+r));
  const y0=Math.max(0,Math.ceil(py-r)),y1=Math.min(h-1,Math.floor(py+r));
  for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){
    if(((xx-px)/r)**2+((yy-py)/r)**2>1)continue;
    const k=(yy*w+xx)*4;
    const red=data[k],green=data[k+1],blue=data[k+2];
    if(!Number.isFinite(red)||!Number.isFinite(green)||!Number.isFinite(blue))return null;
    ch[0].push(red);ch[1].push(green);ch[2].push(blue);
    const maximum=Math.max(red,green,blue),minimum=Math.min(red,green,blue);
    dark+=maximum<=7?1:0;
    // A strong red/pink shade isn't necessarily overexposure.
    // Only near-white clipping, not naturally fair/bright skin.
    bright+=minimum>=252?1:0;
    count++;
  }
  if(count<20)return null;
  return{lightness:perceptualLightness(ch.map(median)),nearBlack:dark/count,nearWhite:bright/count};
}
export function assessTryOnLighting(frame:FramePixels,landmarks:readonly FacePoint[]):LightingState{
  const {width:w,height:h,data}=frame;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<64||h<64
    ||!data||data.length<w*h*4||landmarks.length<455)return"unavailable";
  if(REQUIRED.some(i=>!landmarks[i]||!Number.isFinite(landmarks[i].x)||!Number.isFinite(landmarks[i].y)))return"unavailable";
  const fw=Math.abs(landmarks[454].x-landmarks[234].x),fh=Math.abs(landmarks[152].y-landmarks[10].y);
  if(fw<.18||fh<.25||fw>.9||fh>.92)return"unavailable";
  const eyeL=landmarks[33],eyeR=landmarks[263],nose=landmarks[1];
  const dx=(eyeR.x-eyeL.x)*w,dy=(eyeR.y-eyeL.y)*h;
  const roll=Math.abs(Math.atan2(dy,Math.abs(dx))*180/Math.PI);
  const yaw=Math.abs(nose.x-(eyeL.x+eyeR.x)/2)/Math.max(Math.abs(eyeR.x-eyeL.x),.001);
  if(roll>16||yaw>.33)return"unavailable";
  const cheekCenter=(indices:number[])=>({
    x:indices.reduce((v,i)=>v+landmarks[i].x,0)/indices.length,
    y:indices.reduce((v,i)=>v+landmarks[i].y,0)/indices.length
  });
  const l=cheekCenter([50,101,205,187]),r=cheekCenter([280,330,425,411]);
  const radius=fw*.068;
  const left=sampleCheek(frame,l.x,l.y,radius),right=sampleCheek(frame,r.x,r.y,radius);
  if(!left||!right)return"unavailable";
  if([left,right].some(p=>p.nearBlack>.22||p.nearWhite>.22))return"clipped";
  // Relative lighting across cheeks ONLY; never penalize dark skin brightness.
  if(Math.abs(left.lightness-right.lightness)>20)return"uneven";
  return"balanced";
}
