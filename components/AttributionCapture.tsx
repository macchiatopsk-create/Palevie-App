"use client";
import { useEffect } from "react";
import { captureAttributionFromLocation } from "@/lib/attribution";
import { track } from "@/lib/analytics";
export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionFromLocation();
    track("page_view", { path: `${window.location.pathname}${window.location.search}` });
  }, []);
  return null;
}
