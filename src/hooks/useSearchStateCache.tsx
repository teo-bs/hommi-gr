import { useCallback } from 'react';

interface SearchCacheData {
  listings: any[];
  scrollY: number;
  filters: any;
  timestamp: number;
}

const CACHE_KEY = 'hommi-search-cache';
const CACHE_MAX_AGE = 300000; // 5 minutes

export const useSearchStateCache = () => {
  const saveState = useCallback((listings: any[], scrollY: number, filters: any) => {
    try {
      const cacheData: SearchCacheData = {
        listings,
        scrollY,
        filters,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save search state:', error);
    }
  }, []);

  const restoreState = useCallback((maxAge: number = CACHE_MAX_AGE): SearchCacheData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: SearchCacheData = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - data.timestamp > maxAge) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to restore search state:', error);
      return null;
    }
  }, []);

  const clearState = useCallback(() => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear search state:', error);
    }
  }, []);

  return { saveState, restoreState, clearState };
};
