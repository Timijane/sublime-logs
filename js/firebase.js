// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase Configuration
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
const analytics = getAnalytics(app);

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
export { app, analytics, auth, db };
