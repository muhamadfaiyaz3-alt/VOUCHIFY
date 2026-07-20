// import admin from "firebase-admin";
// import Env from "./env";

// type ServiceAccount = admin.ServiceAccount;

// let firebaseApp: admin.app.App | null = null;

// const hasServiceAccount = () => {
//   return Boolean(
//     Env.firebaseServiceAccount ||
//       (Env.firebaseProjectId &&
//         Env.firebaseClientEmail &&
//         Env.firebasePrivateKey)
//   );
// };

// const parseServiceAccount = (): ServiceAccount => {
//   if (Env.firebaseServiceAccount) {
//     const decoded =
//       Env.firebaseServiceAccount.startsWith("{")
//         ? Env.firebaseServiceAccount
//         : Buffer.from(Env.firebaseServiceAccount, "base64").toString("utf8");
//     return JSON.parse(decoded);
//   }

//   return {
//     projectId: Env.firebaseProjectId,
//     clientEmail: Env.firebaseClientEmail,
//     privateKey: Env.firebasePrivateKey.replace(/\\n/g, "\n"),
//   } as ServiceAccount;
// };

// export const initFirebase = () => {
//   if (Env.firebaseDisabled || !hasServiceAccount()) {
//     return null;
//   }

//   if (firebaseApp) return firebaseApp;
//   firebaseApp = admin.initializeApp({
//     credential: admin.credential.cert(parseServiceAccount()),
//   });
//   return firebaseApp;
// };

// export const verifyFirebaseToken = async (token: string) => {
//   if (Env.firebaseDisabled || !hasServiceAccount()) {
//     throw new Error("FIREBASE_NOT_CONFIGURED");
//   }
//   if (!token) throw new Error("Missing Firebase token");
//   const app = initFirebase();
//   if (!app) throw new Error("FIREBASE_NOT_CONFIGURED");
//   const auth = app.auth();
//   return auth.verifyIdToken(token);
// };



import admin from "firebase-admin";
import Env from "./env";

type ServiceAccount = admin.ServiceAccount;

let firebaseApp: admin.app.App | null = null;

const hasServiceAccount = () => {
  return Boolean(
    Env.firebaseServiceAccount ||
      (Env.firebaseProjectId &&
        Env.firebaseClientEmail &&
        Env.firebasePrivateKey)
  );
};

const parseServiceAccount = (): ServiceAccount => {
  if (Env.firebaseServiceAccount) {
    const decoded =
      Env.firebaseServiceAccount.startsWith("{")
        ? Env.firebaseServiceAccount
        : Buffer.from(Env.firebaseServiceAccount, "base64").toString("utf8");
    return JSON.parse(decoded);
  }

  return {
    projectId: Env.firebaseProjectId,
    clientEmail: Env.firebaseClientEmail,
    privateKey: Env.firebasePrivateKey.replace(/\\n/g, "\n"),
  } as ServiceAccount;
};

export const initFirebase = () => {
  if (Env.firebaseDisabled) {
    console.warn("⚠ Firebase disabled");
    return null;
  }

  if (!hasServiceAccount()) {
    console.warn("⚠ Firebase credentials missing");
    return null;
  }

  if (firebaseApp) return firebaseApp;

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(parseServiceAccount()),
  });

  console.log("🔥 Firebase initialized");
  return firebaseApp;
};

export const verifyFirebaseToken = async (token: string) => {
  if (!token) throw new Error("Missing Firebase token");

  const app = initFirebase();
  if (!app) throw new Error("FIREBASE_NOT_CONFIGURED");

  return app.auth().verifyIdToken(token);
};
