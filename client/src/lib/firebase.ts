import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!isFirebaseConfigured) {
  console.warn("Firebase configuration is missing required values.");
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore with proper error handling
export const firestore = getFirestore(app);

// Enable offline persistence for better reliability
if (isFirebaseConfigured && typeof window !== "undefined") {
  import("firebase/firestore").then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === "failed-precondition") {
        console.debug("Multiple tabs open, Firestore persistence disabled");
      } else if (err.code === "unimplemented") {
        console.debug("Browser doesn't support Firestore persistence");
      }
    });
  });
}

export default app;
