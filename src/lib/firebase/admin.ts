import admin from "firebase-admin";
import fs from "fs";
import path from "path";

if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountPath && serviceAccountPath.endsWith('.json')) {
      const fullPath = path.isAbsolute(serviceAccountPath) 
        ? serviceAccountPath 
        : path.join(process.cwd(), serviceAccountPath);
      
      if (fs.existsSync(fullPath)) {
        admin.initializeApp({
          credential: admin.credential.cert(fullPath),
        });
      } else {
        console.warn(`Firebase service account file not found at ${fullPath}. Falling back to env vars.`);
        initFromEnv();
      }
    } else {
      initFromEnv();
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

function initFromEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId) missing.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
    
    console.error(`Missing required Firebase Admin environment variables: ${missing.join(", ")}`);
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;