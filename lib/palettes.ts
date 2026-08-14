import { ToneProfile } from "./types";

export const toneProfiles: ToneProfile[] = [
  {id:"spring-light",name:"Light Spring",season:"Spring",temperature:"warm",value:"light",chroma:"soft",description:"Light, fresh and gently warm.",colors:["#F6D6B8","#FFD7A8","#F7B7A3","#C8E0B4","#A8D7D4","#F8E4A7","#D9C3E6","#F3AFAE"],avoid:["#111111","#4A2F45","#30344F"]},
  {id:"spring-warm",name:"Warm Spring",season:"Spring",temperature:"warm",value:"medium",chroma:"medium",description:"Golden, sunny and clear.",colors:["#F2A65A","#F28C6F","#D8B44A","#91B85B","#45A9A2","#F5C15C","#D96C4B","#79A85B"],avoid:["#7D6C84","#A3A7B2","#5C4A66"]},
  {id:"spring-bright",name:"Bright Spring",season:"Spring",temperature:"warm",value:"medium",chroma:"bright",description:"High-energy warm brights.",colors:["#FF6B5E","#FFB000","#F7DC2F","#50C878","#00A7A5","#FF4F91","#3AAED8","#FF8450"],avoid:["#7B6E68","#A89C91","#4A4A49"]},
  {id:"spring-vivid",name:"Vivid Spring",season:"Spring",temperature:"neutral",value:"medium",chroma:"bright",description:"Crisp, lively and highly saturated.",colors:["#FF3E4D","#FF8C00","#FFD000","#1FBF75","#00A1C7","#E94B9D","#476FD8","#F35A2B"],avoid:["#8F8177","#A69D91","#665F5A"]},
  {id:"summer-light",name:"Light Summer",season:"Summer",temperature:"cool",value:"light",chroma:"soft",description:"Airy, cool and delicate.",colors:["#E7C7D7","#C9D9EE","#BFD9D2","#D8CFE8","#F0D6D2","#B8CCD9","#D2DBB8","#E3BFD2"],avoid:["#241A18","#7C3A23","#735600"]},
  {id:"summer-cool",name:"Cool Summer",season:"Summer",temperature:"cool",value:"medium",chroma:"medium",description:"Blue-based, refined and calm.",colors:["#B36B8C","#7189B8","#6FA8A8","#9381B5","#C1879C","#5F799B","#839B78","#A96286"],avoid:["#D3762A","#C49A32","#84512D"]},
  {id:"summer-soft",name:"Soft Summer",season:"Summer",temperature:"neutral",value:"medium",chroma:"soft",description:"Smoky, blended and neutral-cool.",colors:["#A77F8B","#77899C","#78918C","#8D8197","#B08F8A","#6D7B87","#8C9278","#977784"],avoid:["#FF3E2E","#FFB000","#151515"]},
  {id:"summer-muted",name:"Muted Summer",season:"Summer",temperature:"cool",value:"medium",chroma:"soft",description:"Dusty cool colors with low contrast.",colors:["#967987","#738396","#718A88","#8D8292","#A08786","#647684","#818B78","#8F7480"],avoid:["#F05A28","#FFC000","#0B0B0B"]},
  {id:"autumn-soft",name:"Soft Autumn",season:"Autumn",temperature:"neutral",value:"medium",chroma:"soft",description:"Muted, earthy and gently warm.",colors:["#A8896C","#B67A62","#9A945F","#6F8370","#65847D","#B99A61","#8C6C73","#7C7659"],avoid:["#FFFFFF","#090909","#1E4EE8"]},
  {id:"autumn-warm",name:"Warm Autumn",season:"Autumn",temperature:"warm",value:"medium",chroma:"medium",description:"Rich spices, moss and golden earth.",colors:["#B96532","#A84F34","#B3902E","#68753F","#36736B","#C3842C","#8C4D36","#776A35"],avoid:["#D9E7FF","#CEB9E8","#F2A8C8"]},
  {id:"autumn-deep",name:"Deep Autumn",season:"Autumn",temperature:"warm",value:"deep",chroma:"medium",description:"Dark, warm and luxurious.",colors:["#5B3426","#7A2F27","#6D5B22","#354B35","#1F544F","#8A4D20","#60373C","#3F4530"],avoid:["#E2F1FF","#F8D8E7","#C7F0E9"]},
  {id:"autumn-muted",name:"Muted Autumn",season:"Autumn",temperature:"warm",value:"medium",chroma:"soft",description:"Weathered earth and softened warmth.",colors:["#92765F","#9A685C","#85805A","#667568","#5C746E","#9C845C","#80666B","#706D55"],avoid:["#FF2E63","#00C7FF","#FFFFFF"]},
  {id:"winter-deep",name:"Deep Winter",season:"Winter",temperature:"cool",value:"deep",chroma:"medium",description:"Dark, dramatic and cool.",colors:["#201B2B","#5B1737","#1E395B","#174D4D","#3C215D","#822A42","#293C66","#151619"],avoid:["#D8B776","#C69A6B","#B5A06B"]},
  {id:"winter-cool",name:"Cool Winter",season:"Winter",temperature:"cool",value:"medium",chroma:"bright",description:"Icy contrast and jewel tones.",colors:["#C51F5D","#2759B7","#008C9E","#6C3FA0","#D52D4F","#1E4F91","#00816F","#3B2A7A"],avoid:["#C58244","#B29257","#9B7250"]},
  {id:"winter-bright",name:"Bright Winter",season:"Winter",temperature:"neutral",value:"medium",chroma:"bright",description:"Electric contrast and clean brights.",colors:["#EF174C","#0068D7","#00A6A6","#8B38D1","#FF2D72","#004CB8","#00A15A","#4626A8"],avoid:["#9A826F","#A69582","#826D5B"]},
  {id:"winter-vivid",name:"Vivid Winter",season:"Winter",temperature:"cool",value:"deep",chroma:"bright",description:"Maximum saturation with cool depth.",colors:["#D8003F","#0048B5","#007E8A","#721AA3","#E5005C","#003D86","#006D55","#32116D"],avoid:["#C8A16A","#B78B5A","#A98262"]}
];

export function getToneProfile(id: string): ToneProfile {
  return toneProfiles.find((p) => p.id === id) ?? toneProfiles[8];
}
