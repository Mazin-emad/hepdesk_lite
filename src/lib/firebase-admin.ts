import { readFileSync } from "fs";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount() {
  const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonString) {
    return JSON.parse(jsonString);
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    return JSON.parse(readFileSync(filePath, "utf8"));
  }

  return null;
}

let adminApp: App | undefined;

if (!getApps().length) {
  const serviceAccount = getServiceAccount();

  adminApp = initializeApp(
    serviceAccount
      ? { credential: cert(serviceAccount) }
      : {
          projectId:
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
            process.env.FIREBASE_PROJECT_ID ||
            "helpdesk-lite-e7ceb",
        }
  );
} else {
  adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
