export const DRAPE_KEY="palevie-drape-session-v2";
export const DRAPE_PAIRS=[
  {title:"Peach or rose?",note:"Compare coral and rose beside your face.",colors:[{label:"Peach coral",hex:"#FF957C"},{label:"Cool rose",hex:"#CA6D9A"}]},
  {title:"Ivory or pure white?",note:"Compare a creamy white with a crisp bright white.",colors:[{label:"Soft ivory",hex:"#F8EBD8"},{label:"Pure white",hex:"#FFFFFF"}]},
  {title:"Soft or vivid pink?",note:"Notice the contrast between dusty and saturated color.",colors:[{label:"Dusty mauve",hex:"#B48FA4"},{label:"Vivid fuchsia",hex:"#E33289"}]},
  {title:"Camel or charcoal?",note:"Compare warm earth and cool dark neutrals.",colors:[{label:"Camel",hex:"#BC8A5E"},{label:"Charcoal",hex:"#494954"}]},
] as const;
export type DrapePick={index:0|1;assessment:"better"|"worse"}|null;
export type DrapeState={step:number;picks:DrapePick[]};
export const initialDrapeState=():DrapeState=>({step:0,picks:[]});
export function normalizeDrapeState(value:unknown):DrapeState{
  if(!value||typeof value!=="object"||Array.isArray(value))return initialDrapeState();
  const s=value as DrapeState;
  if(!Number.isInteger(s.step)||s.step<0||s.step>DRAPE_PAIRS.length||!Array.isArray(s.picks)||s.picks.length!==s.step)return initialDrapeState();
  if(s.picks.some(p=>p!==null&&(!p||![0,1].includes(p.index)||!["better","worse"].includes(p.assessment))))return initialDrapeState();
  return {step:s.step,picks:s.picks.map(p=>p?{index:p.index,assessment:p.assessment}:null)};
}
export function answerDrapeState(state:DrapeState,choice:DrapePick):DrapeState{
  if(state.step>=DRAPE_PAIRS.length)return state;
  return {step:state.step+1,picks:[...state.picks.slice(0,state.step),choice]};
}
export function previousDrapeState(state:DrapeState):DrapeState{const step=Math.max(0,state.step-1);return {step,picks:state.picks.slice(0,step)};}
export function drapeColors(state:DrapeState,assessment:"better"|"worse"){
  return state.picks.slice(0,state.step).flatMap((p,i)=>p?.assessment===assessment?[DRAPE_PAIRS[i].colors[p.index].hex]:[]);
}
