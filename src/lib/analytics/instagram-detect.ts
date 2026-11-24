export function isInstagramBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Instagram/i.test(ua);
}

export function getOpenInBrowserUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}
