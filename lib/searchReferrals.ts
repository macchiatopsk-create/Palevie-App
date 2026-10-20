export type SearchReferral = { source: string; medium: "referral" | "organic" };
// Exact hosts only: a URL containing "chatgpt.com" in a path, query, username
// or hostile suffix is NOT ChatGPT. Store no referring conversation/search URL.
const HOSTS: Readonly<Record<string,SearchReferral>> = {
  "chatgpt.com":{source:"chatgpt.com",medium:"referral"},
  "www.chatgpt.com":{source:"chatgpt.com",medium:"referral"},
  "chat.openai.com":{source:"chatgpt.com",medium:"referral"},
  "google.com":{source:"google",medium:"organic"},
  "www.google.com":{source:"google",medium:"organic"},
  "www.google.co.uk":{source:"google",medium:"organic"},
  "www.google.ca":{source:"google",medium:"organic"},
  "www.google.com.au":{source:"google",medium:"organic"},
  "www.google.co.kr":{source:"google",medium:"organic"},
  "www.google.co.jp":{source:"google",medium:"organic"},
  "www.google.de":{source:"google",medium:"organic"},
  "www.google.fr":{source:"google",medium:"organic"},
  "bing.com":{source:"bing",medium:"organic"},
  "www.bing.com":{source:"bing",medium:"organic"},
};
export function observedSearchReferral(referrer:string,origin:string):SearchReferral|null {
  if(!referrer||referrer.length>4096)return null;
  try{
    const ref=new URL(referrer),own=new URL(origin);
    if(!["https:","http:"].includes(ref.protocol)||ref.username||ref.password||ref.port)return null;
    if(ref.hostname===own.hostname||["palevie.com","www.palevie.com"].includes(ref.hostname))return null;
    const host=ref.hostname.toLowerCase();
    if(!Object.prototype.hasOwnProperty.call(HOSTS,host))return null;
    return {...HOSTS[host]};
  }catch{return null;}
}
