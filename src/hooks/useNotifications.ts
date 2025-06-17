import { useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/auth';

interface NotificationHook {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  subscribeToUpdates: () => Promise<boolean>;
}

export const useNotifications = (): NotificationHook => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported] = useState('Notification' in window && 'serviceWorker' in navigator);

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('❌ Notifications: Not supported');
      return false;
    }

    try {
      console.log('🔔 Notifications: Requesting permission');
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('✅ Notifications: Permission granted');
        return true;
      } else {
        console.log('❌ Notifications: Permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Notifications: Permission request failed', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.log('❌ Notifications: Permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'localloop',
      requireInteraction: false,
      ...options
    };

    try {
      console.log('📱 Notifications: Sending notification', title);
      new Notification(title, defaultOptions);
    } catch (error) {
      console.error('❌ Notifications: Failed to send', error);
    }
  };

  const subscribeToUpdates = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      console.log('❌ Notifications: Cannot subscribe - not supported or no permission');
      return false;
    }

    try {
      console.log('📡 Notifications: Subscribing to push updates');
      
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('✅ Notifications: Already subscribed');
        return true;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // You'll need to replace this with your actual VAPID public key
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LUhbKSKLWCu0q_-LXJn0_obIeUXaEiQO7EiQOEiQOEiQOEiQOEiQO'
        )
      });

      console.log('✅ Notifications: Subscribed successfully');
      
      // Send subscription to your server
      await sendSubscriptionToServer(subscription);
      
      return true;
    } catch (error) {
      console.error('❌ Notifications: Subscription failed', error);
      return false;
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    subscribeToUpdates
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to send subscription to server
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const user = await getCurrentUser();
    
    // You would send this to your backend to store the subscription
    console.log('📤 Notifications: Sending subscription to server', {
      subscription,
      userId: user?.id
    });
    
    // Example API call (you'll need to implement the backend endpoint)
    /*
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        userId: user?.id
      })
    });
    */
  } catch (error) {
    console.error('❌ Notifications: Failed to send subscription to server', error);
  }
}