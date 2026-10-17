/** Seven at-home face-side draping observations, adapted from the common
 * consultant axes: temperature, value, chroma. This is NOT a proprietary or
 * validated professional protocol, and a phone screen is not calibrated fabric.
 */
export type Axis = "temperature" | "value" | "chroma";
export type EvidenceChoice = 0 | 1 | -1 | null; // -1 = cannot tell, null = not yet answered
export type EvidenceState = { answers: EvidenceChoice[]; step: number; completed: boolean };
export const EVIDENCE_KEY = "palevie-face-drape-evidence-v1";
export const DRAPE_QUESTIONS = [
  {id:"temp_rose",axis:"temperature",title:"Peach-rose or cool rose?",
   note:"Compare the face, not which pink you like. Which reduces shadows and unevenness around the eyes and mouth?",
   colors:[{label:"Peach rose (warm)",hex:"#C77872"},{label:"Rosy mauve (cool)",hex:"#BA78A0"}]},
  {id:"value_rose",axis:"value",title:"Light or deep rose?",
   note:"Same pink family, different depth. Which supports your features without washing them out or overpowering them?",
   colors:[{label:"Light rose",hex:"#E0C0C5"},{label:"Deep rose",hex:"#734955"}]},
  {id:"chroma_rose",axis:"chroma",title:"Clear or softened rose?",
   note:"Try equal-sized colors in the same light. Does a vivid rose make your face clearer, or does a muted rose look more balanced?",
   colors:[{label:"Clear rose",hex:"#C06784"},{label:"Muted rose",hex:"#A47D88"}]},
  {id:"temp_red",axis:"temperature",title:"Tomato red or berry red?",
   note:"A second warm/cool check in a different red family. Focus on the skin's evenness, not favorite lipstick shades.",
   colors:[{label:"Tomato red (warm)",hex:"#C45241"},{label:"Berry red (cool)",hex:"#C04C70"}]},
  {id:"value_blue",axis:"value",title:"Light or deep blue?",
   note:"Try both below the chin at the same distance. Which keeps your face distinct from the drape?",
   colors:[{label:"Light mist blue",hex:"#BDD3DF"},{label:"Deep muted blue",hex:"#405C77"}]},
  {id:"chroma_teal",axis:"chroma",title:"Clear or softened teal?",
   note:"A second brightness test in a different color family. Watch for the cloth stealing attention from your face.",
   colors:[{label:"Clear teal",hex:"#167F7B"},{label:"Softened teal",hex:"#738E88"}]},
  {id:"temp_green",axis:"temperature",title:"Yellow-green or blue-green?",
   note:"Final undertone check in the green family. If both make the face look similarly even, choose Can't tell.",
   colors:[{label:"Yellow-green (warm)",hex:"#79A45C"},{label:"Blue-green (cool)",hex:"#4AAB9A"}]},
] as const satisfies ReadonlyArray<{id:string;axis:Axis;title:string;note:string;colors:readonly[{label:string;hex:string},{label:string;hex:string}]}>;
export const EVIDENCE_COUNT=DRAPE_QUESTIONS.length;
export const initialEvidence = ():EvidenceState=>({answers:Array(EVIDENCE_COUNT).fill(null),step:0,completed:false});
export function normalizeEvidence(raw:unknown):EvidenceState{
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return initialEvidence();
  const value=raw as EvidenceState;
  if(!Array.isArray(value.answers)||value.answers.length!==EVIDENCE_COUNT)return initialEvidence();
  const answers:EvidenceChoice[]=value.answers.map(a=>a===0||a===1||a===-1?a:null);
  const firstEmpty=answers.indexOf(null);
  if(value.completed===true&&firstEmpty<0)return {answers,step:EVIDENCE_COUNT-1,completed:true};
  if(!Number.isInteger(value.step)||value.step<0||value.step>=EVIDENCE_COUNT)return initialEvidence();
  const step=firstEmpty>=0?Math.min(firstEmpty,value.step):value.step;
  return {answers:answers.map((a,i)=>i<step?a:null),step,completed:false};
}
export function recordEvidence(state:EvidenceState,choice:0|1|-1):EvidenceState{
  if(state.completed||![0,1,-1].includes(choice)||state.step<0||state.step>=EVIDENCE_COUNT)return state;
  const answers=state.answers.map((a,i)=>i===state.step?choice:i<state.step?a:null);
  return {answers,step:Math.min(EVIDENCE_COUNT-1,state.step+1),completed:state.step===EVIDENCE_COUNT-1};
}
export function backEvidence(state:EvidenceState):EvidenceState{
  const step=Math.max(0,state.step-1);
  return {step,answers:state.answers.map((a,i)=>i<step?a:null),completed:false};
}
export type AxisRead={axis:Axis;first:number;second:number;unknown:number;state:"first"|"second"|"mixed"|"insufficient";observations:number};
export type EvidenceResult={axes:Record<Axis,AxisRead>;candidate:"spring"|"summer"|"autumn"|"winter"|null;likedColors:string[];answered:number;uncertain:number;};
export function assessEvidence(answers:readonly EvidenceChoice[]):EvidenceResult{
  const axes={} as Record<Axis,AxisRead>;
  for(const axis of ["temperature","value","chroma"] as const){
    const items=DRAPE_QUESTIONS.map((q,i)=>q.axis===axis?answers[i]:null).filter((_,i)=>DRAPE_QUESTIONS[i].axis===axis);
    const first=items.filter(a=>a===0).length,second=items.filter(a=>a===1).length;
    const observations=first+second,unknown=items.length-observations;
    // A single observation or contradictory responses cannot establish a direction.
    const state=observations<2?"insufficient":first&&second?"mixed":first>=2?"first":second>=2?"second":"insufficient";
    axes[axis]={axis,first,second,unknown,state,observations};
  }
  const t=axes.temperature.state,v=axes.value.state,c=axes.chroma.state;
  let candidate:EvidenceResult["candidate"]=null;
  if((t==="first"||t==="second")&&(v==="first"||v==="second")&&(c==="first"||c==="second")){
    candidate=t==="first"?(c==="first"?"spring":"autumn"):(c==="first"?"winter":"summer");
  }
  const likedColors=DRAPE_QUESTIONS.flatMap((q,i)=>answers[i]===0||answers[i]===1?[q.colors[answers[i]].hex]:[]);
  return {axes,candidate,likedColors,answered:answers.filter(a=>a===0||a===1).length,uncertain:answers.filter(a=>a===-1).length};
}
