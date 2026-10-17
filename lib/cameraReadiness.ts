/** A previous playing event alone is not proof the current preview is usable. */
export function cameraCanBeRated(video: HTMLVideoElement | null, stream: MediaStream | null): boolean {
  return Boolean(video && stream && video.srcObject === stream && !video.paused && !video.ended
    && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0
    && stream.getVideoTracks().some(track => track.readyState === "live" && !track.muted));
}
/** Some browser/wrapper errors come from a different realm, so instanceof can
 * reject a legitimate DOMException. Read only a whitelisted name, never a raw
 * message or arbitrary error data, for the UI and coarse telemetry. */
export function cameraErrorReason(error: unknown): string {
  try {
    const name = error && typeof error === "object" ? (error as { name?: unknown }).name : undefined;
    if (name === "PermissionDeniedError") return "NotAllowedError";
    if (name === "DevicesNotFoundError") return "NotFoundError";
    if (name === "TrackStartError") return "NotReadableError";
    if (typeof name === "string" && ["NotAllowedError", "NotFoundError", "NotReadableError", "OverconstrainedError", "AbortError", "SecurityError", "InvalidStateError", "TypeError"].includes(name)) return name;
  } catch { /* Even an unusual throwing property cannot interrupt fallback. */ }
  return "camera_error";
}
