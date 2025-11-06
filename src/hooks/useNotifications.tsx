import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  isRegistered: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
    isRegistered: false
  });

  // Check if notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setState(prev => ({ 
      ...prev, 
      isSupported,
      permission: isSupported ? Notification.permission : 'denied'
    }));
  }, []);

  // Register service worker when user is authenticated
  useEffect(() => {
    if (!user || !state.isSupported) return;

    const registerServiceWorker = async () => {
      try {
        console.log('[Notifications] Registering service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('[Notifications] Service worker registered:', registration.scope);
        setState(prev => ({ ...prev, isRegistered: true }));

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[Notifications] Message from SW:', event.data);
          
          if (event.data.type === 'NAVIGATE_TO_THREAD') {
            const threadId = event.data.threadId;
            if (threadId) {
              window.location.href = `/inbox?thread=${threadId}`;
            }
          }
        });

      } catch (error) {
        console.error('[Notifications] Service worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [user, state.isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn('[Notifications] Not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[Notifications] Permission result:', permission);
      
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('[Notifications] Permission request failed:', error);
      return false;
    }
  }, [state.isSupported]);

  // Show browser notification
  const showNotification = useCallback(async (
    title: string,
    options: {
      body?: string;
      threadId?: string;
      icon?: string;
      tag?: string;
    } = {}
  ) => {
    if (!state.isSupported) {
      console.warn('[Notifications] Not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return false;
    }

    try {
      // Check if service worker is registered
      const registration = await navigator.serviceWorker.ready;
      
      console.log('[Notifications] Showing notification:', { title, options });
      
      await registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || '/hommi-logo.png',
        badge: '/favicon.png',
        tag: options.tag || options.threadId || 'message',
        data: {
          threadId: options.threadId,
          timestamp: Date.now()
        },
        requireInteraction: false,
        silent: false
      } as NotificationOptions);

      return true;
    } catch (error) {
      console.error('[Notifications] Show notification failed:', error);
      return false;
    }
  }, [state.isSupported]);

  // Check if notifications should be shown (not suppressed by user/system)
  const canShowNotifications = useCallback(() => {
    return state.isSupported && 
           state.isRegistered && 
           Notification.permission === 'granted' &&
           document.visibilityState === 'hidden'; // Only show when tab is not visible
  }, [state.isSupported, state.isRegistered]);

  return {
    permission: state.permission,
    isSupported: state.isSupported,
    isRegistered: state.isRegistered,
    requestPermission,
    showNotification,
    canShowNotifications
  };
};
