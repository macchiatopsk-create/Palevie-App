/* Synthetic camera-frame quality tests (not real-device color calibration).
 * Deep skin, fair skin and warm lighting must be assessed by clipping and
 * relative side illumination only, NEVER absolute skin brightness.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {runtime}=require("./free-service-test-runtime.cjs");
const {assessTryOnLighting:assess}=runtime().load("lib/tryOnLighting.ts");
const w=192,h=256;
function points(){
 const a=Array.from({length:478},()=>({x:.5,y:.5}));
 for(const [i,x,y] of [[10,.5,.14],[152,.5,.80],[234,.24,.52],[454,.76,.52],
  [33,.33,.37],[263,.67,.37],[1,.5,.48],
  ...[50,101,205,187].map(i=>[i,.33,.56]),
  ...[280,330,425,411].map(i=>[i,.67,.56])])a[i]={x,y};
 return a;
}
function frame(rgb=[153,110,91]){
 const data=new Uint8ClampedArray(w*h*4);
 for(let k=0;k<data.length;k+=4)data.set([...rgb,255],k);
 return {width:w,height:h,data};
}
function fillRect(img,x0,y0,x1,y1,rgb){
 for(let y=Math.floor(y0*h);y<Math.ceil(y1*h);y++)for(let x=Math.floor(x0*w);x<Math.ceil(x1*w);x++){
  const k=(y*w+x)*4;img.data.set([...rgb,255],k);
 }
 return img;
}
function check(name,expected,f,l=points()){
 const actual=assess(f,l);
 assert.equal(actual,expected,name+" expected "+expected+" but got "+actual);
 console.log("PASS lighting synthetic: "+name+" = "+actual);
}
check("even medium skin", "balanced",frame([153,110,91]));
check("even fair skin", "balanced",frame([231,182,157]));
check("even dark skin", "balanced",frame([49,31,23]));
check("even deeper skin, no absolute brightness gate", "balanced",frame([16,12,10]));
check("very dark but not clipped to black", "balanced",frame([9,9,9]));
check("warm colored lighting is not automatically overexposed", "balanced",frame([255,130,85]));
check("fair skin close to white but textured remains valid", "balanced",frame([249,235,217]));
check("pure white video clips", "clipped",frame([255,255,255]));
check("pure black video clips", "clipped",frame([2,3,2]));
check("both cheeks underexposed on otherwise normal frame", "clipped",
 fillRect(fillRect(frame(),.27,.49,.39,.63,[2,3,2]),.61,.49,.73,.63,[3,3,3]));
check("one cheek strongly overexposed", "clipped",fillRect(frame(),.61,.49,.73,.63,[254,255,254]));
check("strong left/right face shadow", "uneven",fillRect(frame([224,170,144]),.61,.49,.73,.63,[72,45,36]));
check("same side-shadow detected when mirrored", "uneven",fillRect(frame([72,45,36]),.61,.49,.73,.63,[224,170,144]));
check("deep skin with strong one-sided lighting still flagged", "uneven",fillRect(frame([70,44,37]),.61,.49,.73,.63,[15,11,10]));
check("bright background alone is irrelevant to face quality", "balanced",
 fillRect(fillRect(frame([255,255,255]),.27,.49,.39,.63,[140,94,75]),.61,.49,.73,.63,[140,94,75]));
check("small tracked face cannot be scored", "unavailable",frame(),points().map(p=>({x:.5+(p.x-.5)*.15,y:.5+(p.y-.5)*.15})));
const tilted=points();tilted[263]={...tilted[263],y:.6};
check("head roll is not misidentified as uneven lighting", "unavailable",frame(),tilted);
const turned=points();turned[1]={...turned[1],x:.7};
check("head turn does not pretend lighting accuracy", "unavailable",frame(),turned);
check("missing landmarks not scored", "unavailable",frame(),[]);
check("invalid frame data not scored", "unavailable",{width:w,height:h,data:new Uint8ClampedArray(20)});
const studio=fs.readFileSync(path.resolve(__dirname,"../components/VirtualMakeupTryOn.tsx"),"utf8");
const css=fs.readFileSync(path.resolve(__dirname,"../components/VirtualMakeupTryOn.module.css"),"utf8");
assert(studio.includes("assessTryOnLighting(sampleContext.getImageData"),"Lighting must inspect original camera video pixels, not composited makeup");
assert(studio.includes("sampleContext.drawImage(video,0,0,sw,sh)"),"Only local video scratch buffer may be read");
assert(studio.includes("now-lastLightingAtRef.current>=1100"),"A lightweight throttle is required for mobile FPS");
assert(studio.includes("history.length===2&&history[0]===history[1]"),"Single-frame warnings are not stable");
assert(studio.includes("lightingCanvasRef.current.width=0"),"Video pixel scratch buffer must be wiped");
assert(!studio.includes('track("virtual_tryon_lighting'),"Lighting results must never be analytics events");
assert(studio.includes('lighting==="clipped"||lighting==="uneven"'),"Only definite quality issues display warnings");
assert(css.includes(".lightingHint"),"Mobile lighting status must remain readable");
console.log("TRYON_LIGHTING_SIMULATION_PASS synthetic_conditions=20 all_pixel_analysis_on_device=true actual_phone_camera_tested=false");
