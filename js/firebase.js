// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, updateDoc, 
  collection, query, orderBy, limit, getDocs, addDoc 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRnNoRJ4Zgtu-KEZAdOAKtou2LV9rdL5c",
  authDomain: "sublime-log.firebaseapp.com",
  projectId: "sublime-log",
  storageBucket: "sublime-log.firebasestorage.app",   // ✔ MATCHES SIGNUP PAGE
  messagingSenderId: "644554254089",
  appId: "1:644554254089:web:dd3374c9468046a5a015d8",
  measurementId: "G-YMPGVWCK16"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Get user wallet balance
export async function getUserBalance(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? Number(userSnap.data().balance || 0) : 0;
}

// Update wallet balance + record transaction
export async function updateUserBalance(uid, amount) {
  const userRef = doc(db, "users", uid);
  const currentBalance = await getUserBalance(uid);

  await updateDoc(userRef, { balance: currentBalance + amount });

  // Add transaction record
  const txRef = collection(db, "users", uid, "transactions");
  await addDoc(txRef, {
    amount,
    type: amount >= 0 ? "credit" : "debit",
    date: new Date().toISOString()
  });
}

// Get last 10 transactions
export async function getRecentTransactions(uid) {
  const txRef = collection(db, "users", uid, "transactions");
  const q = query(txRef, orderBy("date", "desc"), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

// Logout user
export function logout() {
  signOut(auth).then(() => window.location.href = "login.html");
}
