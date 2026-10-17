import {AuthError,type SupabaseClient} from "@supabase/supabase-js";
import {checkNewPassword} from "./passwordSafety";
const guarded=new WeakSet<object>();
/** Covers the app's signup and password-update callers, but is NOT a replacement
 * for Supabase's server-side paid-plan check. Direct Auth API clients can bypass
 * this app-level guard. Existing sign-ins and metadata updates are unchanged.
 */
export function guardNewPasswords(client:SupabaseClient):void{
  if(guarded.has(client))return;guarded.add(client);
  const signUp=client.auth.signUp.bind(client.auth),updateUser=client.auth.updateUser.bind(client.auth);
  client.auth.signUp=async credentials=>{
    const input={...credentials};
    const safety=await checkNewPassword(input.password);
    if(!safety.ok)return {data:{user:null,session:null},error:new AuthError(safety.message,safety.code==="weak_password"?400:503,safety.code)};
    return signUp(input);
  };
  client.auth.updateUser=async(attributes,options)=>{
    const input={...attributes};
    if(typeof input.password==="string"){
      const safety=await checkNewPassword(input.password);
      if(!safety.ok)return {data:{user:null},error:new AuthError(safety.message,safety.code==="weak_password"?400:503,safety.code)};
    }
    return updateUser(input,options);
  };
}
