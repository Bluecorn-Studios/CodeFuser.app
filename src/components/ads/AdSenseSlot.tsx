import React, { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG, getFormattedClientPublisherId, isRouteEligibleForAds } from '../../config/adsenseConfig';
import { ensureAdSenseScriptLoaded, pushAdSenseSlot } from '../../lib/adsenseLoader';

interface AdSenseSlotProps {
  /**
   * AdSense ad unit slot ID (numeric string assigned in AdSense dashboard)
   */
  slotId?: string;

  /**
   * Layout format: 'auto', 'horizontal', 'rectangle', etc.
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';

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
}

/**
 * Standard CodeFuser AdSense Slot Component
 * 
 * Rules:
 * 1. Renders nothing (null) if AdSense is disabled or not configured.
 * 2. Never creates fake ad placeholders, dummy images, or simulated rectangles.
 * 3. Never obscures text, citations, buttons, or navigation.
 * 4. Completely responsive to prevent horizontal layout shift or overflow.
 */
export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
  showDisclaimer = false,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushedRef = useRef(false);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isEligible = isRouteEligibleForAds(pathname);
  const clientPublisherId = getFormattedClientPublisherId(ADSENSE_CONFIG.publisherId);

  useEffect(() => {
    if (!isEligible || !clientPublisherId || !slotId) {
      return;
    }

    // Ensure master AdSense script is present in head
    ensureAdSenseScriptLoaded(pathname);

    // Trigger ad load safely
    if (adRef.current && !isPushedRef.current) {
      isPushedRef.current = true;
      pushAdSenseSlot();
    }
  }, [isEligible, clientPublisherId, slotId, pathname]);

  // If AdSense is not configured, not enabled, or route is private/excluded: render strictly NULL
  if (!isEligible || !clientPublisherId || !slotId) {
    return null;
  }

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
          style={{ display: 'block' }}
          data-ad-client={clientPublisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </aside>
  );
};
