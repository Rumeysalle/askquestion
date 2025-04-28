// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDLKJi6oFw7R9W1FUGalNKH5-Yljcpew68",
    authDomain: "askquestion-636dd.firebaseapp.com",
    projectId: "askquestion-636dd",
    storageBucket: "askquestion-636dd.firebasestorage.app",
    messagingSenderId: "864230489603",
    appId: "1:864230489603:web:3a42a0961b5883a5c15836",
    measurementId: "G-CYT3P3XQPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);