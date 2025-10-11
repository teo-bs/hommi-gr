import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

// Simple debounce implementation instead of external dependency
const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
};

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  bounds: MapBounds | null;
  selectedPinId: string | null;
  hoveredPinId: string | null;
  isMoving: boolean;
  hasUserMoved: boolean;
  userLocation: [number, number] | null;
  isLocating: boolean;
}

export interface MapActions {
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds) => void;
  setSelectedPinId: (id: string | null) => void;
  setHoveredPinId: (id: string | null) => void;
  setIsMoving: (isMoving: boolean) => void;
  setHasUserMoved: (hasUserMoved: boolean) => void;
  updateResultsForBounds: () => void;
  resetUserMoved: () => void;
  locateUser: () => void;
  setUserLocation: (location: [number, number] | null) => void;
}

// Athens, Greece as default center
const DEFAULT_CENTER: [number, number] = [23.7275, 37.9838];
const DEFAULT_ZOOM = 12;

export const useMapState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [mapState, setMapState] = useState<MapState>(() => {
    // Initialize from URL params
    const bboxParam = searchParams.get('bbox');
    const centerParam = searchParams.get('center');
    const zoomParam = searchParams.get('zoom');
    
    let initialCenter = DEFAULT_CENTER;
    let initialZoom = DEFAULT_ZOOM;
    let initialBounds = null;
    
    if (centerParam) {
      const [lng, lat] = centerParam.split(',').map(Number);
      if (!isNaN(lng) && !isNaN(lat)) {
        initialCenter = [lng, lat];
      }
    }
    
    if (zoomParam) {
      const zoom = Number(zoomParam);
      if (!isNaN(zoom)) {
        initialZoom = zoom;
      }
    }
    
    if (bboxParam) {
      const [west, south, east, north] = bboxParam.split(',').map(Number);
      if (!isNaN(west) && !isNaN(south) && !isNaN(east) && !isNaN(north)) {
        initialBounds = { north, south, east, west };
      }
    }
    
    return {
      center: initialCenter,
      zoom: initialZoom,
      bounds: initialBounds,
      selectedPinId: null,
      hoveredPinId: null,
      isMoving: false,
      hasUserMoved: false,
      userLocation: null,
      isLocating: false,
    };
  });

  // Debounced URL update to avoid too many history entries
  const debouncedUpdateUrl = useDebounce((state: MapState) => {
    const params = new URLSearchParams(searchParams);
    
    // Update center
    params.set('center', `${state.center[0]},${state.center[1]}`);
    
    // Update zoom
    params.set('zoom', state.zoom.toString());
    
    // Update bounds if available
    if (state.bounds) {
      const bbox = `${state.bounds.west},${state.bounds.south},${state.bounds.east},${state.bounds.north}`;
      params.set('bbox', bbox);
    }
    
    setSearchParams(params, { replace: true });
  }, 600);

  // Update URL when map state changes
  useEffect(() => {
    if (mapState.hasUserMoved) {
      debouncedUpdateUrl(mapState);
    }
  }, [mapState.center, mapState.zoom, mapState.bounds, mapState.hasUserMoved, debouncedUpdateUrl]);

  const actions: MapActions = {
    setCenter: useCallback((center: [number, number]) => {
      setMapState(prev => ({ ...prev, center }));
    }, []),

    setZoom: useCallback((zoom: number) => {
      setMapState(prev => ({ ...prev, zoom }));
    }, []),

    setBounds: useCallback((bounds: MapBounds) => {
      setMapState(prev => ({ ...prev, bounds }));
    }, []),

    setSelectedPinId: useCallback((id: string | null) => {
      setMapState(prev => ({ ...prev, selectedPinId: id }));
    }, []),

    setHoveredPinId: useCallback((id: string | null) => {
      setMapState(prev => ({ ...prev, hoveredPinId: id }));
    }, []),

    setIsMoving: useCallback((isMoving: boolean) => {
      setMapState(prev => ({ ...prev, isMoving }));
    }, []),

    setHasUserMoved: useCallback((hasUserMoved: boolean) => {
      setMapState(prev => ({ ...prev, hasUserMoved }));
    }, []),

    updateResultsForBounds: useCallback(() => {
      // Trigger a custom event that Search page can listen to
      window.dispatchEvent(new CustomEvent('mapBoundsChanged', { 
        detail: { bounds: mapState.bounds } 
      }));
    }, [mapState.bounds]),

    resetUserMoved: useCallback(() => {
      setMapState(prev => ({ ...prev, hasUserMoved: false }));
    }, []),

    locateUser: useCallback(() => {
      setMapState(prev => ({ ...prev, isLocating: true }));
      
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc: [number, number] = [position.coords.longitude, position.coords.latitude];
            setMapState(prev => ({ 
              ...prev, 
              userLocation: userLoc,
              center: userLoc,
              zoom: 14,
              isLocating: false,
              hasUserMoved: true
            }));
          },
          (error) => {
            console.error('Error getting location:', error);
            setMapState(prev => ({ ...prev, isLocating: false }));
          }
        );
      } else {
        setMapState(prev => ({ ...prev, isLocating: false }));
      }
    }, []),

    setUserLocation: useCallback((location: [number, number] | null) => {
      setMapState(prev => ({ ...prev, userLocation: location }));
    }, []),
  };

  return {
    mapState,
    ...actions,
  };
};