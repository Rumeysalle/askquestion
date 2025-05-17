import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase'in tekrar başlatılmasını önle
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase servislerini başlat
export const auth = getAuth(app);
export const db = getFirestore(app);

// Hata ayıklama için yapılandırmayı kontrol et
if (!firebaseConfig.apiKey) {
    console.error('Firebase API anahtarı bulunamadı. Lütfen .env.local dosyasını kontrol edin.');
}

// Create composite index for posts collection
// This is a helper function to ensure the index exists
export const ensurePostsIndex = async () => {
    try {
        const indexConfig = {
            collectionGroup: 'posts',
            queryScope: 'COLLECTION',
            fields: [
                { fieldPath: 'uid', order: 'ASCENDING' },
                { fieldPath: 'createdAt', order: 'DESCENDING' }
            ]
        };

        // Note: This is just a helper function to document the required index
        // The actual index needs to be created in the Firebase Console
        console.log('Required index configuration:', indexConfig);
    } catch (error) {
        console.error('Error ensuring posts index:', error);
    }
}; 