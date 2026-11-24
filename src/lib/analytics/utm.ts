const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const STORAGE_KEY = "meetyourwhy_utm";

export type UtmData = Partial<Record<(typeof UTM_PARAMS)[number], string>>;

export function captureUtmParams(): UtmData | null {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const data: UtmData = {};
  let found = false;

  for (const param of UTM_PARAMS) {
    const value = url.searchParams.get(param);
    if (value) {
      data[param] = value;
      found = true;
    }
  }

  if (found) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  return null;
}

export function getStoredUtm(): UtmData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
