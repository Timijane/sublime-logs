// firebase.js
// Firebase initialization for Sublime Logs project

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// --- Your Firebase configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDVu5IQ3Y5bvgAfSKym8kXPpZZWKqMELTM",
  authDomain: "sublime-logs.firebaseapp.com",
  projectId: "sublime-logs",
  storageBucket: "sublime-logs.firebasestorage.app",
  messagingSenderId: "381847722551",
  appId: "1:381847722551:web:8ec68f018291d3927f3db2",
  measurementId: "G-8YHHJC1MP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
export { auth, db };
