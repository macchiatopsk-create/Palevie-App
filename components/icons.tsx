import type { ReactNode } from "react";

/** One stroke language for the whole app — same weight as the bottom nav. */
export const CAT_ICON: Record<string, ReactNode> = {
  lip: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.4 3.2h5.2v3.1H9.4z"/><path d="M8.6 6.3h6.8v4.1a1 1 0 0 1-1 1h-4.8a1 1 0 0 1-1-1z"/><rect x="9.2" y="11.4" width="5.6" height="9.4" rx="1.1"/></svg>,
  cheek: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.1"/></svg>,
  eye: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3.4" y="6.6" width="17.2" height="10.8" rx="1.6"/><path d="M12 6.6v10.8M3.4 12h17.2"/></svg>,
  skin: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10.4 2.9h3.2v2.6h-3.2z"/><path d="M8.9 8.1c0-1.4 1.1-2.6 2.5-2.6h1.2c1.4 0 2.5 1.2 2.5 2.6v11a2 2 0 0 1-2 2h-2.2a2 2 0 0 1-2-2z"/><path d="M8.9 11.6h6.2"/></svg>,
  clothes: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M9 3.4 12 5.6l3-2.2 5 2.6-1.8 3.6-2 -.8V20.6H7.8V8.8l-2 .8L4 6z"/></svg>,
  list: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-6.4-4.1-8.6-8C1.9 9.3 3.3 5.9 6.4 5.3c1.9-.4 3.9.4 5 2 .3.5.6.9.6.9s.3-.4.6-.9c1.1-1.6 3.1-2.4 5-2 3.1.6 4.5 4 3 6.7-2.2 3.9-8.6 8-8.6 8z"/></svg>,
};

/** Header icons, shared with the home top bar. */
export const NAV_ICON = {
  heart: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-6.4-4.1-8.6-8C1.9 9.3 3.3 5.9 6.4 5.3c1.9-.4 3.9.4 5 2 .3.5.6.9.6.9s.3-.4.6-.9c1.1-1.6 3.1-2.4 5-2 3.1.6 4.5 4 3 6.7-2.2 3.9-8.6 8-8.6 8z"/></svg>,
  user: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="8.6" r="3.6"/><path d="M5 20c.8-3.4 3.6-5.2 7-5.2s6.2 1.8 7 5.2"/></svg>,
};

/** Small marks used around headings and buttons. */
export const MARK = {
  flower: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="6.4" r="2.6" opacity=".75"/><circle cx="17.2" cy="9.4" r="2.6" opacity=".75"/><circle cx="15.4" cy="15.8" r="2.6" opacity=".75"/><circle cx="8.6" cy="15.8" r="2.6" opacity=".75"/><circle cx="6.8" cy="9.4" r="2.6" opacity=".75"/></svg>,
  share: <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15.4V4.2M8.4 7.6 12 4l3.6 3.6"/><path d="M5.4 13.2v5.4a1.4 1.4 0 0 0 1.4 1.4h10.4a1.4 1.4 0 0 0 1.4-1.4v-5.4"/></svg>,
  retake: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4.6 12a7.4 7.4 0 1 1 2.3 5.3"/><path d="M4.2 7.4v4.2h4.2"/></svg>,
  chevron: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>,
  expand: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 4.5H4.5v5M14.5 4.5h5v5M14.5 19.5h5v-5M9.5 19.5h-5v-5"/></svg>,
  check: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.6 9.6 17 19 7.4"/></svg>,
  back: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>,
  close: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  block: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="8.2"/><path d="M6.2 17.8 17.8 6.2"/></svg>,
};
