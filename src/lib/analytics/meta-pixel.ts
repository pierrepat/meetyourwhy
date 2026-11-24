declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type AllowedEvent = "landing_view" | "discovery_start" | "interview_complete";

const ALLOWED_EVENTS: Set<string> = new Set([
  "landing_view",
  "discovery_start",
  "interview_complete",
]);

export function trackPixelEvent(event: AllowedEvent) {
  if (!ALLOWED_EVENTS.has(event)) return;
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", event);
}

export function getPixelScript(pixelId: string): string {
  if (!pixelId) return "";
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}
