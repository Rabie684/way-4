import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
import { User, UserRole } from "./types";
import { authService } from "./services/authService"; // Import authService
// FIX: Import React to resolve TypeScript errors for React.Dispatch and React.SetStateAction types.
import React from 'react';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: For security, consider moving these to environment variables in a production environment.
const firebaseConfig = {
  apiKey: "AIzaSyDmSkA_vtGZgoFbe1GAiKP6sfQSA6nIUS8",
  authDomain: "way-4-bd33c.firebaseapp.com",
  projectId: "way-4-bd33c",
  storageBucket: "way-4-bd33c.firebasestorage.app",
  messagingSenderId: "338095189034",
  appId: "1:338095189034:web:09f435c5112263fbb86753",
  measurementId: "G-FHX7LPST2Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request notification permission and get the device token
export const requestNotificationPermissionAndGetToken = async (
  currentUser: User | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  // Check if Firebase Messaging Service Worker is registered
  // Firebase SDK's getToken often handles this implicitly, but this check is good for debugging.
  if (!navigator.serviceWorker.controller) {
    console.warn("Firebase Messaging Service Worker is not active yet. getToken will attempt to register it.");
    // No explicit return here, let getToken try to register it.
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
    try {
      // VAPID key from Firebase project settings -> Cloud Messaging -> Web configuration
      // IMPORTANT: You MUST replace this placeholder with your actual VAPID key from your Firebase project.
      // This key is unique to your project and origin. Using a placeholder or incorrect key
      // often leads to cross-origin registration errors (e.g., 'https://ai.studio' mismatch).
      // To get your VAPID key: Go to Firebase Console -> Project settings -> Cloud Messaging tab -> Web configuration -> Generate key pair.
      const vapidKey = "BLvK0Lh6K6v5mJ0F4G8h5o9p1q2r3s4t5u6v7w8x9y0z1A2B3C4D5E6F7G8H9I0J"; // Placeholder VAPID key - REPLACE THIS!

      const currentToken = await getToken(messaging, { vapidKey: vapidKey });
      if (currentToken) {
        console.log("FCM device token:", currentToken);
        if (currentUser && currentUser.deviceToken !== currentToken) {
          const updatedUser = { ...currentUser, deviceToken: currentToken };
          await authService.updateUser(updatedUser);
          setCurrentUser(updatedUser); // Update state in App.tsx
          console.log("User device token updated in mock data and localStorage.");
        }
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } catch (error) {
      console.error("Error getting FCM device token:", error);
    }
  } else {
    console.log("Notification permission denied or dismissed.");
  }
};

// Handle foreground messages
onMessage(messaging, (payload: MessagePayload) => {
  console.log("Message received in foreground:", payload);
  // Display notification manually if needed when app is in foreground
  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || "/pwa-icon-uik-192.png",
  };
  if (Notification.permission === "granted") {
    new Notification(notificationTitle, notificationOptions);
  }
});

export { messaging, firebaseConfig };