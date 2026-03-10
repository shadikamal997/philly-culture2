import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate configuration
function validateConfig() {
    const required = {
        'API Key': firebaseConfig.apiKey,
        'Auth Domain': firebaseConfig.authDomain,
        'Project ID': firebaseConfig.projectId,
        'Storage Bucket': firebaseConfig.storageBucket,
        'Messaging Sender ID': firebaseConfig.messagingSenderId,
        'App ID': firebaseConfig.appId,
    };

    const missing = Object.entries(required)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.warn('⚠️  Missing Firebase configuration:', missing.join(', '));
        console.warn('Please check your .env.local file for NEXT_PUBLIC_FIREBASE_* variables');
    }
}

// Only validate in development
if (process.env.NODE_ENV === 'development') {
    validateConfig();
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Set persistence to local storage (persists across page refreshes and browser sessions)
    if (typeof window !== 'undefined') {
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error('Error setting auth persistence:', error);
        });
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
}

export { app, auth, db, storage };
