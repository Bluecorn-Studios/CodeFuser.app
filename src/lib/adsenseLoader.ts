import { ADSENSE_CONFIG, getFormattedClientPublisherId, isRouteEligibleForAds } from '../config/adsenseConfig';

const SCRIPT_ID = 'google-adsense-script';

/**
 * Loads the Google AdSense core script into document head if not already loaded.
 * Ensures singleton loading with async and crossOrigin.
 */
export function ensureAdSenseScriptLoaded(pathname: string = window.location.pathname): boolean {
  // 1. Guard check: only load if route is eligible
  if (!isRouteEligibleForAds(pathname)) {
    return false;
  }

  // 2. Guard check: publisher ID must be valid
  const clientId = getFormattedClientPublisherId(ADSENSE_CONFIG.publisherId);
  if (!clientId || clientId.includes('XXXX')) {
    return false;
  }

  // 3. Singleton check: avoid duplicate script injection
  if (document.getElementById(SCRIPT_ID)) {
    return true;
  }

  try {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = 'anonymous';

    script.onerror = () => {
      // Graceful failover: Ad blocker or network offline should never crash the app
      console.warn('[CodeFuser AdSense] Ad script load was prevented or blocked by client.');
    };

    document.head.appendChild(script);
    return true;
  } catch (error) {
    console.warn('[CodeFuser AdSense] Error injecting AdSense script:', error);
    return false;
  }
}

/**
 * Safely triggers an ad slot push for responsive ad units
 */
export function pushAdSenseSlot(): void {
  try {
    if (typeof window !== 'undefined') {
      const w = window as unknown as { adsbygoogle?: Array<Record<string, unknown>> };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    }
  } catch (e) {
    // Graceful silent swallow: ad blockers commonly cause adsbygoogle.push to throw
    console.debug('[CodeFuser AdSense] Slot push skipped or blocked by client:', e);
  }
}
