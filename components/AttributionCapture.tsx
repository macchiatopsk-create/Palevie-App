"use client";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsPath, captureAttributionFromLocation } from "@/lib/attribution";
import { track } from "@/lib/analytics";
function Capture(){
  const pathname=usePathname(),params=useSearchParams();
  const path=analyticsPath(pathname||"/",params.toString());
  const previous=useRef<string|null>(null);
  useEffect(()=>{
    if(previous.current===path)return;
    previous.current=path;
    captureAttributionFromLocation();
    track("page_view",{path});
    window.dispatchEvent(new Event("palevie-client-ready"));
  },[path]);
  return null;
}
export default function AttributionCapture(){return <Suspense fallback={null}><Capture/></Suspense>;}
