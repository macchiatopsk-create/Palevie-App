import Link from "next/link";
import {PASSWORD_SAFETY_NOTICE} from "@/lib/passwordSafety";
export default function PasswordSafetyNotice(){return <p className="microcopy" style={{maxWidth:560,margin:"16px auto",lineHeight:1.6}}>Use at least 12 characters for a new password. {PASSWORD_SAFETY_NOTICE} <Link href="/password-security">How the free check works</Link>.</p>;}
