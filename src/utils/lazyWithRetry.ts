import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Robust lazy import with automatic retry and stale-chunk recovery.
 * When a deployment replaces chunk files, browsers requesting old chunks get an error.
 * This wrapper automatically handles stale chunk failures by performing a single
 * clean reload to fetch the latest index and bundle manifest.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName?: string
): LazyExoticComponent<T> {
  return lazy(async () => {
    const storageKey = `retry-lazy-refreshed-${componentName || 'module'}`;
    const hasRefreshed = window.sessionStorage.getItem(storageKey);

    try {
      const component = await componentImport();
      // On success, clear the refresh flag
      window.sessionStorage.removeItem(storageKey);
      return component;
    } catch (error: any) {
      console.warn(`[lazyWithRetry] Error loading chunk for ${componentName || 'component'}:`, error);

      const errorMessage = (error?.message || error?.toString() || '').toLowerCase();
      const isChunkOrMimeError =
        error?.name === 'ChunkLoadError' ||
        errorMessage.includes('dynamically imported module') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('importing a module script failed') ||
        errorMessage.includes('mime type') ||
        errorMessage.includes('loading chunk');

      if (!hasRefreshed && isChunkOrMimeError) {
        window.sessionStorage.setItem(storageKey, 'true');
        console.log(`[lazyWithRetry] Stale chunk detected for ${componentName || 'component'}. Refreshing page for latest assets...`);
        window.location.reload();
        // Return a pending promise while page reloads
        return new Promise<{ default: T }>(() => {});
      }

      // If already refreshed or other error, throw so ErrorBoundary can catch
      throw error;
    }
  });
}
