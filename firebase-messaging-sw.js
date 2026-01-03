// This is the Firebase Messaging Service Worker file.
// It needs to be placed at the root of your domain.

// Import the Firebase SDK for Firebase products you want to use in your SW.
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Your web app's Firebase configuration
// IMPORTANT: Ensure this config matches the one in firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDmSkA_vtGZgoFbe1GAiKP6sfQSA6nIUS8",
  authDomain: "way-4-bd33c.firebaseapp.com",
  projectId: "way-4-bd33c",
  storageBucket: "way-4-bd33c.firebasestorage.app",
  messagingSenderId: "338095189034",
  appId: "1:338095189034:web:09f435c5112263fbb86753",
  measurementId: "G-FHX7LPST2Z"
};

// Initialize the Firebase app in the service worker
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || "إشعار جديد من Way";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || '/pwa-icon-uik-192.png',
    data: {
      url: payload.data?.url || '/', // Open a specific URL on click
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Handle notification clicks (if not handled by default behavior of `data.url`)
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data.url;
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

// Add a simple fetch handler to make sure the SW is always active for Firebase Messaging
self.addEventListener('fetch', (event) => {
  // This service worker is primarily for Firebase messaging,
  // let the main service worker handle other fetch requests.
  // Or, if this is the only SW, implement caching strategies here.
  // For now, it just ensures the SW is active.
});
