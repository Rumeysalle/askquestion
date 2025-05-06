

import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDLKJi6oFw7R9W1FUGalNKH5-Yljcpew68",
    authDomain: "askquestion-636dd.firebaseapp.com",
    projectId: "askquestion-636dd",
    storageBucket: "askquestion-636dd.firebasestorage.app",
    messagingSenderId: "864230489603",
    appId: "1:864230489603:web:3a42a0961b5883a5c15836",
    measurementId: "G-CYT3P3XQPT"
};

// Firebase tekrar başlatılmasın diye kontrol ediyoruz
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase servislerini dışa aktar
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };