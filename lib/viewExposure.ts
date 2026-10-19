/** A viewport exposure, not proof that a person looked at the content.
 * Never invent impressions when IntersectionObserver is unavailable.
 */
export function observeViewExposure(element: Element, onView: () => void, dwellMs = 1000): () => void {
  if (typeof window === "undefined" || typeof document === "undefined" || typeof IntersectionObserver === "undefined") return () => {};
  let inView = false, done = false, disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { if (timer !== undefined) { clearTimeout(timer); timer = undefined; } };
  const update = () => {
    clear();
    if (disposed || done || !inView || document.visibilityState !== "visible") return;
    timer = setTimeout(() => {
      timer = undefined;
      if (disposed || done || !inView || document.visibilityState !== "visible") return;
      done = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange",update);
      onView();
    },dwellMs);
  };
  const observer = new IntersectionObserver(entries => {
    const entry = entries.find(e => e.target === element);
    if (!entry) return;
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    update();
  },{threshold:[0,0.5]});
  document.addEventListener("visibilitychange",update);
  observer.observe(element);
  return () => { disposed = true; clear(); observer.disconnect(); document.removeEventListener("visibilitychange",update); };
}
