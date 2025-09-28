// js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxZVYRQ7xqy0qe8utXlvO9UpVDbH7dM1I",
  authDomain: "sublime-blog.firebaseapp.com",
  projectId: "sublime-blog",
  storageBucket: "sublime-blog.firebasestorage.app",
  messagingSenderId: "642663556339",
  appId: "1:642663556339:web:cfa7891d6c139ffbdc4386",
  measurementId: "G-7NFT0KEMDP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
