// Paste this inside <script type="module"> in dashboard1.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// ... your firebaseConfig here ...
const firebaseConfig = {
    apiKey: "AIzaSyDRnNoRJ4Zgtu-KEZAdOAKtou2LV9rdL5c",
    authDomain: "sublime-log.firebaseapp.com",
    projectId: "sublime-log",
    storageBucket: "sublime-log.firebasestorage.app",
    messagingSenderId: "644554254089",
    appId: "1:644554254089:web:dd3374c9468046a5a015d8",
    measurementId: "G-YMPGVWCK16"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- SECURITY GUARD ---
// This listens for the status. It does not assume user is logged out until Firebase says so.
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User verified:", user.uid);
    // User is safely logged in. You can now load user data.
    // Example: loadUserData(user.uid);
  } else {
    // No user found, redirect to login page immediately
    window.location.href = "index.html"; 
  }
});
