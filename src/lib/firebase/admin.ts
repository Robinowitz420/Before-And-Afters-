import { cert, getApps, initializeApp } from "firebase-admin/app";
import { createRequire } from "node:module";

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
  const require = createRequire(import.meta.url);
  const { getFirestore } = require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
  return getFirestore();
}
