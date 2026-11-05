/* Palevie Live Guide v1. Pure image measurements, NOT personal-color scoring.
 * No identifiers, persistence, network calls, skin-health or undertone inference.
 * Also loadable by Node for deterministic regression tests.
 */
(function(root){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const median=a=>{const s=[...a].sort((a,b)=>a-b);return s.length?s[Math.floor(s.length/2)]:0;};
  function lightness(rgb){
    const linear=rgb.map(v=>{const n=clamp(v/255,0,1);return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4);});
    const y=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];
    return y>216/24389?116*Math.cbrt(y)-16:(24389/27)*y;
  }
  function hexRgb(hex){return /^#[0-9a-f]{6}$/i.test(hex)?[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)):null;}
  function compare(rgb,colors){
    const l=lightness(rgb);
    const gaps=colors.map(c=>{const cRgb=hexRgb(c.hex);return cRgb?Math.abs(l-lightness(cRgb)):null;});
    if(gaps.length!==2||gaps.some(v=>v===null))return null;
    const similar=Math.abs(gaps[0]-gaps[1])<3;
    return {gaps:gaps.map(v=>Math.round(v)),blended:similar?null:(gaps[0]<gaps[1]?0:1)};
  }
  function coverPoint(p,videoWidth,videoHeight,width,height,mirrored=true){
    if(!videoWidth||!videoHeight||!width||!height)return {x:0,y:0,r:0};
    const scale=Math.max(width/videoWidth,height/videoHeight);
    const x=p.x*videoWidth*scale+(width-videoWidth*scale)/2;
    return {x:mirrored?width-x:x,y:p.y*videoHeight*scale+(height-videoHeight*scale)/2,r:p.r*videoWidth*scale};
  }
  function patch(image,p){
    const {width,height,data}=image;
    const cx=p.x*width,cy=p.y*height,rx=Math.max(2,p.r*width),ry=rx;
    if(cx-rx<0||cx+rx>=width||cy-ry<0||cy+ry>=height)return null;
    const channels=[[],[],[]];let low=0,high=0,n=0;
    for(let y=Math.ceil(cy-ry);y<=Math.floor(cy+ry);y++)for(let x=Math.ceil(cx-rx);x<=Math.floor(cx+rx);x++){
      if(((x-cx)/rx)**2+((y-cy)/ry)**2>1)continue;
      const k=(y*width+x)*4,r=data[k],g=data[k+1],b=data[k+2];
      channels[0].push(r);channels[1].push(g);channels[2].push(b);
      low+=Math.max(r,g,b)<6?1:0;high+=Math.max(r,g,b)>252?1:0;n++;
    }
    return n>=8?{rgb:channels.map(median),low:low/n,high:high/n}:null;
  }
  function regions(lm){
    if(!lm||lm.length<455)return null;
    const required=[10,151,152,234,454,33,263,1,50,101,205,187,280,330,425,411];
    if(required.some(i=>!lm[i]||!Number.isFinite(lm[i].x)||!Number.isFinite(lm[i].y)))return null;
    const fw=Math.abs(lm[454].x-lm[234].x),fh=Math.abs(lm[152].y-lm[10].y);
    const avg=ids=>({x:ids.reduce((s,i)=>s+lm[i].x,0)/ids.length,y:ids.reduce((s,i)=>s+lm[i].y,0)/ids.length,r:fw*.07});
    // Landmark 10 is near the hairline and can sit under a hat brim. Sample the
    // lower central forehead at 151, plus both cheeks, rather than the hairline.
    return {points:[avg([151]),avg([50,101,205,187]),avg([280,330,425,411])],fw,fh};
  }
  function inspect(image,faces,previous){
    const fail=(status,points=[])=>({status,points,rgb:null});
    if(faces.length!==1)return fail(faces.length?'multiple':'no-face');
    const lm=faces[0],reg=regions(lm);
    if(!reg)return fail('no-face');
    const {points,fw,fh}=reg;
    if(fw<.20||fh<.28)return fail('too-small',points);
    // Lower forehead may be cropped by bangs, caps or portrait framing. Require
    // both CHEEKS to be fully visible; the forehead is an optional third sample.
    const cheeks=points.slice(1);
    if(fw>.93||cheeks.some(p=>p.x-p.r<.02||p.x+p.r>.98||p.y-p.r<.02||p.y+p.r>.98))return fail('cropped',cheeks);
    const left=lm[33],right=lm[263],nose=lm[1];
    const dx=(right.x-left.x)*image.width,dy=(right.y-left.y)*image.height;
    const roll=Math.abs(Math.atan2(dy,Math.abs(dx))*180/Math.PI);
    const mid=(left.x+right.x)/2,eyeWidth=Math.abs(right.x-left.x);
    const yaw=Math.abs(nose.x-mid)/Math.max(eyeWidth,.001);
    if(roll>12||yaw>.30)return fail('pose',points);
    const cheekPatches=cheeks.map(p=>patch(image,p));
    if(cheekPatches.some(p=>!p))return fail('cropped',cheeks);
    if(cheekPatches.some(p=>p.low>.15||p.high>.18))return fail('clipped',cheeks);
    // Natural skin brightness is not a quality gate. Compare the two CHEEKS
    // for uneven lighting; a shadowed forehead cannot override valid cheeks.
    if(Math.abs(lightness(cheekPatches[0].rgb)-lightness(cheekPatches[1].rgb))>18)return fail('uneven',cheeks);
    const cheekLight=(lightness(cheekPatches[0].rgb)+lightness(cheekPatches[1].rgb))/2;
    const forehead=patch(image,points[0]);
    const usedForehead=Boolean(forehead&&forehead.low<=.15&&forehead.high<=.18&&
      Math.abs(lightness(forehead.rgb)-cheekLight)<=28);
    const patches=usedForehead?[forehead,...cheekPatches]:cheekPatches;
    const usablePoints=usedForehead?points:cheeks;
    // A cheek-only reading is an even two-cheek average; do not substitute
    // hair/hat pixels or invent a forehead value when the top is obstructed.
    const rgb=[0,1,2].map(c=>usedForehead?median(patches.map(p=>p.rgb[c])):
      Math.round((cheekPatches[0].rgb[c]+cheekPatches[1].rgb[c])/2));
    const center={x:(lm[234].x+lm[454].x)/2,y:(lm[10].y+lm[152].y)/2};
    const motion=previous?.center?Math.hypot(center.x-previous.center.x,center.y-previous.center.y):0;
    const shift=previous?.rgb?Math.max(...rgb.map((v,i)=>Math.abs(v-previous.rgb[i]))):0;
    const changed=motion>.018||shift>10||Boolean(previous&&previous.usedForehead!==usedForehead);
    const streak=changed?0:(previous?.streak||0)+1;
    return {status:changed?'changed':streak<5?'settling':'ready',points:usablePoints,rgb:streak>=5&&!changed?rgb:null,
      next:{center,rgb,streak:Math.min(streak,6),usedForehead}};
  }
  const api={lightness,hexRgb,compare,coverPoint,patch,regions,inspect};
  root.PalevieDrapeMeasure=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
