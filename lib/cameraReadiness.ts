/** A previous `playing` event alone is not proof that the preview is usable now. */
export function cameraCanBeRated(video: HTMLVideoElement | null, stream: MediaStream | null): boolean {
  return Boolean(video && stream && video.srcObject === stream && !video.paused && !video.ended
    && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0
    && stream.getVideoTracks().some(track => track.readyState === "live" && !track.muted));
}
