import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let cachedDb: ReturnType<typeof getFirestore> | null = null;

function initAdmin() {
  if (getApps().length > 0) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.warn('Missing FIREBASE_SERVICE_ACCOUNT_JSON - Firestore features will be unavailable');
    return;
  }

  let svc: any;
  try {
    svc = JSON.parse(raw);
  } catch {
    console.warn('Invalid FIREBASE_SERVICE_ACCOUNT_JSON');
    return;
  }

  initializeApp({
    credential: cert(svc),
  });
}

export function getAdminFirestore() {
  initAdmin();
  if (getApps().length === 0) return null;

  if (cachedDb) return cachedDb;
  cachedDb = getFirestore();
  return cachedDb;
}
