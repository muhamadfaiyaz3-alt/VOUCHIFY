import admin from "firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import Env from "./env";

type ServiceAccount = admin.ServiceAccount;

let firebaseApp: admin.app.App | null = null;

const hasServiceAccount = (): boolean => {
  return Boolean(
    Env.firebaseServiceAccount ||
      (Env.firebaseProjectId &&
        Env.firebaseClientEmail &&
        Env.firebasePrivateKey)
  );
};

const parseServiceAccount = (): ServiceAccount => {
  if (Env.firebaseServiceAccount) {
    const decoded = Env.firebaseServiceAccount.startsWith("{")
      ? Env.firebaseServiceAccount
      : Buffer.from(Env.firebaseServiceAccount, "base64").toString("utf8");

    return JSON.parse(decoded) as ServiceAccount;
  }

  return {
    projectId: Env.firebaseProjectId,
    clientEmail: Env.firebaseClientEmail,
    privateKey: Env.firebasePrivateKey.replace(/\\n/g, "\n"),
  } as ServiceAccount;
};

export const initFirebase = (): admin.app.App | null => {
  if (Env.firebaseDisabled || !hasServiceAccount()) {
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(parseServiceAccount()),
  });

  return firebaseApp;
};

export const verifyFirebaseToken = async (
  token: string
): Promise<DecodedIdToken> => {
  if (Env.firebaseDisabled || !hasServiceAccount()) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  if (!token) {
    throw new Error("Missing Firebase token");
  }

  const app = initFirebase();

  if (!app) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  return app.auth().verifyIdToken(token);
};
