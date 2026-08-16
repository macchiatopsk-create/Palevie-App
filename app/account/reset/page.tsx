import ResetPasswordClient from "@/components/ResetPasswordClient";
export const metadata={title:"Reset password — Palevie"};
export default function ResetPage(){
  return <div className="app-wrap narrow"><div className="app-title centered"><div>
    <div className="eyebrow">Account</div><h1>Set a new password.</h1>
  </div></div><ResetPasswordClient/></div>;
}
