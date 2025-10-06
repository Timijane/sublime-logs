// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// --- 1️⃣ Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDVu5IQ3Y5bvgAfSKym8kXPpZZWKqMELTM",
  authDomain: "sublime-logs.firebaseapp.com",
  projectId: "sublime-logs",
  storageBucket: "sublime-logs.appspot.com",
  messagingSenderId: "381847722551",
  appId: "1:381847722551:web:8ec68f018291d3927f3db2",
  measurementId: "G-8YHHJC1MP7"
};

// --- 2️⃣ Initialize Firebase ---
const app = initializeApp(firebaseConfig);

// --- 3️⃣ Export Auth and Firestore ---
export const auth = getAuth(app);
export const db = getFirestore(app);
