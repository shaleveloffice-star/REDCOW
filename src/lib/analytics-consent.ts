export const CONSENT_KEY = "sowhat-analytics-consent-v1";
export const CONSENT_EVENT = "sowhat-consent-change";
export function analyticsAllowed(): boolean {
  try { return typeof window !== "undefined" && localStorage.getItem(CONSENT_KEY) === "granted"; }
  catch { return false; }
}
