// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDbwQfQ638Bd_jT-6ebbvLfI5Cx5V0z-ic",
    authDomain: "vouchify-ef6a8.firebaseapp.com",
    projectId: "vouchify-ef6a8",
    storageBucket: "vouchify-ef6a8.firebasestorage.app",
    messagingSenderId: "155748606871",
    appId: "1:155748606871:web:645a61d090c5c8534f9ad2",
    measurementId: "G-1JZEPZ35X4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
