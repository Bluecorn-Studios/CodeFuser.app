import React, { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG, DEFAULT_ADSENSE_IN_ARTICLE_SLOT, getFormattedClientPublisherId, isRouteEligibleForAds } from '../../config/adsenseConfig';
import { ensureAdSenseScriptLoaded, pushAdSenseSlot } from '../../lib/adsenseLoader';

interface AdSenseSlotProps {
  /**
   * AdSense ad unit slot ID (numeric string assigned in AdSense dashboard).
   * Defaults to the in-article slot (6868897302).
   */
  slotId?: string;

  /**
   * Layout format: 'fluid', 'auto', 'rectangle', 'horizontal', etc.
   */
  format?: 'fluid' | 'auto' | 'rectangle' | 'horizontal';

  /**
   * Special AdSense layout mode (e.g. 'in-article')
   */
  layout?: 'in-article' | string;

  /**
   * Full width responsive ad behavior
   */
  responsive?: boolean;

  /**
   * Optional custom CSS class for positioning container
   */
  className?: string;

  /**
   * Optional explicit ad label style
   */
  showDisclaimer?: boolean;

  /**
   * Optional custom styles for the <ins> tag
   */
  style?: React.CSSProperties;
}

/**
 * Standard CodeFuser AdSense Slot Component
 * 
 * Rules:
 * 1. Renders nothing (null) if AdSense is disabled or not configured.
 * 2. Never creates fake ad placeholders, dummy images, or simulated rectangles.
 * 3. Never obscures text, citations, buttons, or navigation.
 * 4. Completely responsive to prevent horizontal layout shift or overflow.
 * 5. Matches official Google AdSense In-Article ad unit markup.
 */
export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slotId,
  format,
  layout = 'in-article',
  responsive = true,
  className = '',
  showDisclaimer = false,
  style,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushedRef = useRef(false);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isEligible = isRouteEligibleForAds(pathname);
  const clientPublisherId = getFormattedClientPublisherId(ADSENSE_CONFIG.publisherId);

  // Normalize slot ID: if numeric use it; if non-numeric or omitted, fall back to valid slot ID
  const isNumericSlot = Boolean(slotId && /^\d+$/.test(slotId.trim()));
  const activeSlotId = isNumericSlot 
    ? (slotId ? slotId.trim() : DEFAULT_ADSENSE_IN_ARTICLE_SLOT)
    : (ADSENSE_CONFIG.inArticleSlotId || DEFAULT_ADSENSE_IN_ARTICLE_SLOT);

  // Derive format: if layout is 'in-article', default format is 'fluid'
  const activeFormat = format || (layout === 'in-article' ? 'fluid' : 'auto');

  useEffect(() => {
    if (!isEligible || !clientPublisherId || !activeSlotId) {
      return;
    }

    // Ensure master AdSense script is present in head
    ensureAdSenseScriptLoaded(pathname);

    // Trigger ad load safely with double-push and StrictMode protection
    if (adRef.current && !isPushedRef.current) {
      const isAlreadyFilled = adRef.current.getAttribute('data-adsbygoogle-status') === 'done' ||
                              adRef.current.children.length > 0;
      if (!isAlreadyFilled) {
        isPushedRef.current = true;
        pushAdSenseSlot();
      }
    }
  }, [isEligible, clientPublisherId, activeSlotId, pathname]);

  // If AdSense is not configured, not enabled, or route is private/excluded: render strictly NULL
  if (!isEligible || !clientPublisherId || !activeSlotId) {
    return null;
  }

  const combinedInsStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    ...style,
  };

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 w-full max-w-full overflow-hidden flex flex-col items-center justify-center clear-both print:hidden ${className}`}
    >
      {showDisclaimer && (
        <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-600 mb-1.5 self-center">
          Advertisement
        </span>
      )}
      <div className="w-full flex justify-center min-h-[50px] overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle w-full"
          style={combinedInsStyle}
          data-ad-layout={layout || undefined}
          data-ad-format={activeFormat}
          data-ad-client={clientPublisherId}
          data-ad-slot={activeSlotId}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </aside>
  );
};
