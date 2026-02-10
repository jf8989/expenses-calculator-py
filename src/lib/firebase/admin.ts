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
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;