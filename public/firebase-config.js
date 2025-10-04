// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, GoogleAuthProvider, signInWithPopup  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmXVzDpGC5MCKCUt_7_yitjL01W0ttUlk",
  authDomain: "secrets-57f34.firebaseapp.com",
  projectId: "secrets-57f34",
  storageBucket: "secrets-57f34.firebasestorage.app",
  messagingSenderId: "329218923939",
  appId: "1:329218923939:web:97b6917cb27ea4566dce16",
  measurementId: "G-01XG8NPLQ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app ); // Ahora esto funcionará


// Export the initialized services
export { app, analytics, auth, db, storage, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, doc, setDoc, getDoc, updateDoc, GoogleAuthProvider, signInWithPopup };

