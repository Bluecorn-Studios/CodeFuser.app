/**
 * CodeFuser Centralized Google AdSense Configuration
 * 
 * Single source of truth for all Google AdSense & monetization settings.
 * Designed to strictly adhere to CodeFuser research journal publishing standards:
 * - Zero fake/placeholder publisher IDs
 * - Zero fake ad boxes or layout shifts
 * - Complete isolation from private/admin routes
 * - Respects article content integrity and reader focus
 */

export interface AdSenseConfig {
  /**
   * Google AdSense Publisher ID (e.g., 'pub-1234567890123456' or 'ca-pub-1234567890123456')
   * Loaded securely from environment or runtime configuration.
   */
  publisherId: string;

  /**
   * Master kill-switch for all advertisements across CodeFuser.
   */
  enabled: boolean;

  /**
   * Whether Google AdSense Auto Ads are enabled for eligible public pages.
   */
  autoAdsEnabled: boolean;

  /**
   * Routes that must NEVER contain Google AdSense scripts, ads, or tracking.
   */
  excludedRoutePrefixes: string[];

  /**
   * Primary route prefixes where Journal research ads are authorized.
   */
  authorizedAdRoutes: string[];
}

// Universal env accessor (Vite import.meta.env on client, process.env in SSR/Node scripts)
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    return String(import.meta.env[key]);
  }
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return String(process.env[key]);
  }
  return '';
};

const rawPublisherId = getEnvVar('VITE_ADSENSE_PUBLISHER_ID');
const rawEnabled = getEnvVar('VITE_ADSENSE_ENABLED');
const rawAutoAds = getEnvVar('VITE_ADSENSE_AUTO_ADS');

export const ADSENSE_CONFIG: AdSenseConfig = {
  // Read from Vite environment variable (or empty string if not configured yet)
  publisherId: rawPublisherId,
  
  // Master toggle - strictly false if no publisher ID or if explicitly disabled
  enabled: (rawEnabled.toLowerCase() === 'true') &&
           Boolean(rawPublisherId && !rawPublisherId.includes('XXXX')),

  autoAdsEnabled: rawAutoAds !== ''
    ? rawAutoAds.toLowerCase() === 'true'
    : true,

  // Strict Exclusions (Private workspaces, authentication, transactions)
  excludedRoutePrefixes: [
    '/dashboard',
    '/mission-control',
    '/payments',
    '/start-project',
    '/login',
    '/logo',
    '/admin'
  ],

  // Monetization target
  authorizedAdRoutes: [
    '/blog',
    '/blog/'
  ]
};

/**
 * Normalizes publisher ID to include 'ca-pub-' prefix for client scripts
 */
export function getFormattedClientPublisherId(rawId: string = ADSENSE_CONFIG.publisherId): string {
  if (!rawId) return '';
  const cleaned = rawId.trim();
  if (cleaned.startsWith('ca-pub-')) return cleaned;
  if (cleaned.startsWith('pub-')) return `ca-${cleaned}`;
  return `ca-pub-${cleaned}`;
}

/**
 * Normalizes publisher ID to 'pub-XXXXXXXXXXXXXXXX' format for ads.txt
 */
export function getFormattedAdsTxtPublisherId(rawId: string = ADSENSE_CONFIG.publisherId): string {
  if (!rawId) return '';
  const cleaned = rawId.trim();
  if (cleaned.startsWith('ca-pub-')) return cleaned.replace('ca-pub-', 'pub-');
  if (cleaned.startsWith('pub-')) return cleaned;
  return `pub-${cleaned}`;
}

/**
 * Validates if the given route is eligible for AdSense advertising.
 */
export function isRouteEligibleForAds(pathname: string): boolean {
  if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.publisherId) {
    return false;
  }

  const cleanPath = pathname.split('?')[0].split('#')[0];

  // 1. Check if route matches any excluded prefix
  const isExcluded = ADSENSE_CONFIG.excludedRoutePrefixes.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
  );

  if (isExcluded) {
    return false;
  }

  // 2. Check if route matches authorized ad routes (public Journal & blog)
  const isAuthorized = ADSENSE_CONFIG.authorizedAdRoutes.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(prefix)
  );

  return isAuthorized;
}

/**
 * Returns a masked representation of the Publisher ID to prevent accidental public disclosure.
 * E.g., 'ca-pub-1234567890123456' -> 'ca-pub-••••••••••••3456'
 */
export function getMaskedPublisherId(rawId: string = ADSENSE_CONFIG.publisherId): string {
  if (!rawId || rawId.trim() === '') {
    return 'Not Configured';
  }
  const clean = rawId.trim();
  if (clean.length <= 8) {
    return 'ca-pub-••••';
  }
  const prefix = clean.startsWith('ca-pub-') ? 'ca-pub-' : clean.startsWith('pub-') ? 'pub-' : '';
  const digits = clean.replace(/^(ca-)?pub-/, '');
  const visible = digits.slice(-4);
  return `${prefix}••••••••••••${visible}`;
}

export type AdSenseStatusType = 'NOT CONFIGURED' | 'CONFIGURED' | 'ENABLED';

export interface AdSenseStatusInfo {
  status: AdSenseStatusType;
  maskedId: string;
  adsEnabled: boolean;
  journalMonetization: boolean;
  autoAdsEnabled: boolean;
  isReadyForProduction: boolean;
}

/**
 * Computes live AdSense status for Mission Control & internal telemetry.
 */
export function getAdSenseStatus(): AdSenseStatusInfo {
  const hasId = Boolean(
    ADSENSE_CONFIG.publisherId &&
    ADSENSE_CONFIG.publisherId.trim() !== '' &&
    !ADSENSE_CONFIG.publisherId.includes('XXXX')
  );

  let status: AdSenseStatusType = 'NOT CONFIGURED';
  if (hasId) {
    status = ADSENSE_CONFIG.enabled ? 'ENABLED' : 'CONFIGURED';
  }

  return {
    status,
    maskedId: getMaskedPublisherId(ADSENSE_CONFIG.publisherId),
    adsEnabled: ADSENSE_CONFIG.enabled,
    journalMonetization: ADSENSE_CONFIG.enabled && hasId,
    autoAdsEnabled: ADSENSE_CONFIG.autoAdsEnabled && ADSENSE_CONFIG.enabled,
    isReadyForProduction: hasId,
  };
}
