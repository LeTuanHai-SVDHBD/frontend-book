/** Fixed design clock; there is no running auction or background timer in this prototype. */
export const PREVIEW_NOW = Date.parse("2026-10-26T03:00:00.000Z");
export default function useClock() {
  return PREVIEW_NOW;
}
