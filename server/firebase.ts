import admin from 'firebase-admin';

function getEnvVar(name: string): string | undefined {
  return process.env[name] ? String(process.env[name]) : undefined;
}

export function isFirebaseConfigured(): boolean {
  return !!(
    getEnvVar('FIREBASE_PROJECT_ID') &&
    getEnvVar('FIREBASE_CLIENT_EMAIL') &&
    getEnvVar('FIREBASE_PRIVATE_KEY')
  );
}

export function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to enable Firestore.');
    return null;
  }

  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Private key often contains escaped newlines; convert them back
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  const credential = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  } as any;

  admin.initializeApp({
    credential: admin.credential.cert(credential),
  });

  return admin.app();
}

export function getFirestore() {
  const app = initFirebase();
  if (!app) return null;
  return admin.firestore();
}

export default admin;
