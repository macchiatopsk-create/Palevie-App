/** Presentation timing only. Does not change measurement gates or quiz scoring. */
export type GuideComparison = {gaps:number[];blended:number|null};
export type GuidePoint = {x:number;y:number;r:number};
export type GuideLayout = {width:number;height:number;vw:number;vh:number;clothTop:number};
export type GuideView = {
 pair:string;status:string;pending:string;pendingSince:number;badSince:number|null;
 held:{comparison:GuideComparison;measuredAt:number}|null;
};
export const GUIDE_NOTICE_MS=1200;
export const GUIDE_MOTION_GRACE_MS=3000;
export function emptyGuideView(pair:string):GuideView {
 return {pair,status:"settling",pending:"",pendingSince:0,badSince:null,held:null};
}
/** Coordinates MUST match the actual camera CSS:
 * .camera-drape-video {object-fit:cover;object-position:50% 44%;transform:scaleX(-1)}
 * The old "contain" mapping incorrectly drew cheek readings on eyebrows/hat
 * and could falsely gate a clear face as covered by the color band.
 */
export function mapGuidePoint(p:GuidePoint,l:GuideLayout):GuidePoint {
 if(!l.vw||!l.vh||!l.width||!l.height)return {x:0,y:0,r:0};
 const scale=Math.max(l.width/l.vw,l.height/l.vh);
 const xOffset=(l.width-l.vw*scale)*0.5;
 const yOffset=(l.height-l.vh*scale)*0.44;
 return {x:l.width-(p.x*l.vw*scale+xOffset),y:p.y*l.vh*scale+yOffset,r:p.r*l.vw*scale};
}
export function patchObstructed(points:GuidePoint[],l:GuideLayout):boolean {
 return points.some(p=>p.x-p.r<0||p.x+p.r>l.width||p.y-p.r<0||p.y+p.r>=l.clothTop-4);
}
export function advanceGuideView(previous:GuideView,input:{pair:string;status:string;comparison:GuideComparison|null;now:number}):GuideView {
 const s=previous.pair===input.pair?previous:emptyGuideView(input.pair);
 const {status,now}=input;
 if(status==="ready"&&input.comparison){
  // Hold the first reliable comparison. Tiny ongoing changes do not rewrite it.
  // The UI explicitly labels it as held, not a continuously current reading.
  return {...s,status:"held",pending:"",pendingSince:0,badSince:null,
   held:s.held||{comparison:{gaps:[...input.comparison.gaps],blended:input.comparison.blended},measuredAt:now}};
 }
 if(["no-face","multiple","cropped","clipped","obstructed","expired"].includes(status)){
  return {...emptyGuideView(input.pair),status:status==="expired"?"settling":status};
 }
 const pending=s.pending===status?s.pending:status;
 const pendingSince=s.pending===status?s.pendingSince:now;
 const badSince=s.badSince??now;
 const grace=status==="changed"||status==="settling"?GUIDE_MOTION_GRACE_MS:GUIDE_NOTICE_MS;
 const held=now-badSince<grace?s.held:null;
 const shown=held?"held":now-pendingSince>=GUIDE_NOTICE_MS?status:s.status==="held"?"settling":s.status;
 return {...s,status:shown,pending,pendingSince,badSince,held};
}
