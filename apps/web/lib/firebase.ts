import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!projectId || !apiKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_FIREBASE_PROJECT_ID o NEXT_PUBLIC_FIREBASE_API_KEY en apps/web/.env.local",
  );
}

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });

export const auth = getAuth(app);

const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (emulatorHost && !auth.emulatorConfig) {
  connectAuthEmulator(auth, `http://${emulatorHost}`, {
    disableWarnings: true,
  });
}
