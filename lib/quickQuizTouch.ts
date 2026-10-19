/** Touch-only fallback for browsers/WebViews that postpone the first synthetic
 * click while keeping :hover. Mouse and keyboard continue through onClick.
 */
export type QuickTouchPoint = { x: number; y: number };
export type QuickTouchHandled = QuickTouchPoint & { at: number };
export function isShortQuickTap(start: QuickTouchPoint|null, end: QuickTouchPoint|null): boolean {
  return !!start && !!end &&
    Number.isFinite(start.x) && Number.isFinite(start.y) &&
    Number.isFinite(end.x) && Number.isFinite(end.y) &&
    Math.hypot(end.x-start.x,end.y-start.y) <= 14;
}
export function isSyntheticQuickTouchClick(
  handled: QuickTouchHandled|null,
  click: QuickTouchPoint & { at: number; detail: number }
): boolean {
  return !!handled && click.detail>0 &&
    Number.isFinite(click.x) && Number.isFinite(click.y) &&
    click.at>=handled.at && click.at-handled.at<900 &&
    Math.hypot(click.x-handled.x,click.y-handled.y)<25;
}
