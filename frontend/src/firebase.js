// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2Nu01qExulPUid6p4UiQ9Zis3Y5GcN0A",
  authDomain: "vouchify-3.firebaseapp.com",
  projectId: "vouchify-3",
  storageBucket: "vouchify-3.firebasestorage.app",
  messagingSenderId: "461311605376",
  appId: "1:461311605376:web:4da1f2d12819077c09c465",
  measurementId: "G-4C15SG3D75"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
