# Firebase Client SDK Configuration (publicly accessible)
# Find these in your Firebase project settings -> General -> Your apps -> Firebase SDK snippet -> Config
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"

# Firebase Admin SDK Configuration (server-side only, KEEP SECRET)
# 1. Go to Firebase Console > Project Settings > Service accounts
# 2. Click "Generate new private key"
# 3. Open the downloaded JSON file and copy the values
# 4. It's recommended to store the entire private_key string in a single line within quotes
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-....@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"