// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Firebase configuration
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
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
