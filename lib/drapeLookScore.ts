import type {GuideComparison} from "./drapeGuideView";
export type DrapeLookGoal="soft"|"bold";
export type DrapeLookScore={scores:[number,number];preferred:0|1|null;goal:DrapeLookGoal};
/** An explicit LOOK-GOAL index, not personal-color suitability or confidence.
 * Soft = 100 minus measured lightness gap; Bold = measured gap.
 * Rounded to 5-point steps; close results never force a winner. Camera/gate
 * code supplies only a valid held comparison. No new face analysis or storage.
 */
export function scoreDrapeLook(comparison:GuideComparison|null|undefined,goal:DrapeLookGoal):DrapeLookScore|null{
 if(!comparison||!Array.isArray(comparison.gaps)||comparison.gaps.length!==2||
  comparison.gaps.some(g=>!Number.isFinite(g)||g<0||g>100)||(goal!=="soft"&&goal!=="bold"))return null;
 const scores=comparison.gaps.map(g=>Math.round((goal==="soft"?100-g:g)/5)*5) as [number,number];
 const close=Math.abs(comparison.gaps[0]-comparison.gaps[1])<5||scores[0]===scores[1];
 return {scores,preferred:close?null:scores[0]>scores[1]?0:1,goal};
}

/** A descriptive relative contrast comparison, never an attractiveness or
 * personal-color compatibility grade. A low numeric index is not a failure. */
export function describeDrapeLook(look:DrapeLookScore|null|undefined,index:number):string {
 if(!look)return "Checking…";
 if(look.preferred===null)return "Similar contrast";
 const stronger=look.goal==="bold"?look.preferred===index:look.preferred!==index;
 return stronger?"Stronger contrast":"Softer contrast";
}
