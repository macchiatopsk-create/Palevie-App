import { QUIZ_QUESTIONS } from "./quiz";
export const QUICK_INDEXES=[0,1,2,10,17,18,20] as const;
export const QUICK_KEY="palevie-quick-quiz-v3";
/** Completed results are stored separately so /quiz can always open Q1. */
export const QUICK_RESULT_KEY="palevie-quick-quiz-last-result-v1";
export type QuickState={picks:(number|null)[];cursor:number;completed:boolean};
export const initialQuickState=():QuickState=>({picks:Array(QUICK_INDEXES.length).fill(null),cursor:0,completed:false});
export function normalizeQuickState(value:unknown):QuickState{
  if(!value||typeof value!=="object"||Array.isArray(value))return initialQuickState();
  const s=value as QuickState;
  if(!Array.isArray(s.picks)||s.picks.length!==7||!Number.isInteger(s.cursor)||s.cursor<0||s.cursor>6)return initialQuickState();
  const picks=s.picks.map((p,i)=>p===null?null:Number.isInteger(p)&&p!>=-1&&p!<QUIZ_QUESTIONS[QUICK_INDEXES[i]].options.length?p:null);
  const firstMissing=picks.findIndex(x=>x===null);
  if(s.completed===true&&firstMissing===-1)return {picks,cursor:6,completed:true};
  const cursor=Math.min(s.cursor,firstMissing<0?s.cursor:firstMissing);
  return {picks:picks.map((p,i)=>i<cursor?p:null),cursor,completed:false};
}
export function answerQuickState(state:QuickState,choice:number):QuickState{
  if(state.completed||!Number.isInteger(choice)||choice< -1||choice>=QUIZ_QUESTIONS[QUICK_INDEXES[state.cursor]].options.length)return state;
  const picks=state.picks.map((p,i)=>i<state.cursor?p:i===state.cursor?choice:null);
  return {picks,cursor:Math.min(6,state.cursor+1),completed:state.cursor===6};
}
export function previousQuickState(state:QuickState):QuickState{
  const cursor=Math.max(0,state.cursor-1);return {picks:state.picks.map((p,i)=>i<cursor?p:null),cursor,completed:false};
}

/** The main Quiz entry is for questions, NOT a silent redirect to saved results.
 * A previous result is shown only when explicitly requested.
 */
export function quickRouteState(current:QuickState,previous:QuickState,showResult:boolean,retake:boolean):QuickState{
  if(retake)return initialQuickState();
  if(showResult)return current.completed?current:previous.completed?previous:current;
  return current.completed?initialQuickState():current;
}
