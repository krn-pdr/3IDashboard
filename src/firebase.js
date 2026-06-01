// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore SDK

const firebaseConfig = {
    apiKey: "AIzaSyATrWeIfNZdCgSK8IK4-ol_IT16--M-Di4",
    authDomain: "idots-e49b3.firebaseapp.com",
    projectId: "idots-e49b3",
    storageBucket: "idots-e49b3.firebasestorage.app",
    messagingSenderId: "540157000183",
    appId: "1:540157000183:web:736312bae4d310299a16f2",
    measurementId: "G-HHY3H37J6N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it for use across your app
export const db = getFirestore(app);