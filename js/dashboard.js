// dashboard.js
import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

/* ====== Config ======
   - PAYSTACK_PUBLIC_KEY: put your public key (test or live)
   - PIPEDREAM_ENDPOINT: your webhook that verifies the payment and updates Firestore
*/
const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492"; // your live public key
const PIPEDREAM_ENDPOINT = "https://eojegh3ks8gvl0e.m.pipedream.net";
/* ==================== */

const userNameEl = document.getElementById("user-name");
const userEmailEl = document.getElementById("user-email");
const balanceEl = document.getElementById("balance");
const fundBtn = document.getElementById("fundBtn") || document.getElementById("fund-btn") || document.getElementById("fund-btn");
const amountInput = document.getElementById("amount"); // optional if you have an input
const transactionsBody = document.querySelector("#transactions-table tbody");

/* Format money */
function formatNgn(n) {
  return Number(n || 0).toFixed(2);
}

/* Render transactions in table (array of plain objects) */
function renderTransactions(list) {
  if (!transactionsBody) return;
  transactionsBody.innerHTML = "";
  if (!list || list.length === 0) {
    transactionsBody.innerHTML = `<tr><td colspan="4" class="muted">No transactions</td></tr>`;
    return;
  }
  list.forEach((t) => {
    const date = t.date && t.date.seconds ? new Date(t.date.seconds * 1000).toLocaleString() : (t.date || "");
    const amount = Number(t.amount || 0).toFixed(2);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${t.type || "—"}</td><td>₦${amount}</td><td>${date}</td><td>${t.status || "—"}</td>`;
    transactionsBody.appendChild(row);
  });
}

/* Load user doc once and subscribe to realtime updates */
async function startForUser(user) {
  const uid = user.uid;
  const userRef = doc(db, "users", uid);

  // initial fetch + subscribe to changes on user doc
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    userNameEl.textContent = `Welcome, ${data.firstName || ""} ${data.surname || ""}`.trim();
    userEmailEl.textContent = data.email || "";
    balanceEl.textContent = formatNgn(data.balance || 0);
  } else {
    // create minimal doc if missing
    await fetch("/noop", { method: "GET" }).catch(() => {}); // no-op (keeps ui from blocking)
    // but we also set default client-side until server creates the doc
    userNameEl.textContent = `Welcome`;
    userEmailEl.textContent = user.email || "";
    balanceEl.textContent = formatNgn(0);
  }

  // Real-time listener for user doc (updates balance automatically)
  onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    balanceEl.textContent = formatNgn(data.balance || 0);
  });

  // Subscribe to transactions (latest 50)
  try {
    const txCol = collection(db, "users", uid, "transactions");
    const txQuery = query(txCol, orderBy("date", "desc"), limit(50));
    const txSnap = await getDocs(txQuery);
    const txs = [];
    txSnap.forEach((d) => txs.push(d.data()));
    renderTransactions(txs);
    // NOTE: if you want live updates for transactions use onSnapshot(txQuery, ...)
  } catch (err) {
    console.warn("Could not load transactions:", err);
  }
}

/* Paystack payment flow (opens checkout and posts reference to Pipedream) */
function openPaystackAndVerify(amountNgn, user) {
  if (!window.PaystackPop) {
    alert("Paystack library not loaded. Refresh page.");
    return;
  }
  const amountKobo = Math.round(amountNgn * 100);
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: user.email,
    amount: amountKobo,
    metadata: { userId: user.uid },
    callback: async function (response) {
      // Client confirms success — now tell backend (Pipedream) to verify & update Firestore
      try {
        const res = await fetch(PIPEDREAM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: response.reference,
            userId: user.uid,
            amount: amountKobo
          })
        });
        // some Pipedream workflows respond with JSON; handle both
        let result;
        try { result = await res.json(); } catch (e) { result = await res.text(); }
        console.log("Pipedream result:", result);
        // We rely on Firestore listener to update balance. Give a friendly message:
        alert("Payment sent for verification. Your balance will update shortly if verification succeeds.");
      } catch (err) {
        console.error("Failed to notify verification backend:", err);
        alert("Payment succeeded but verification failed. Contact support.");
      }
    },
    onClose: function () {
      console.log("Paystack widget closed");
    }
  });
  handler.openIframe();
}

/* Hook UI */
document.addEventListener("DOMContentLoaded", () => {
  // Auth state monitoring
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      // If not signed in — send to login page (must have login.html)
      window.location.href = "login.html";
      return;
    }
    // start dashboard features for logged in user
    await startForUser(user);

    // Attach fund button behavior (use input value if present, otherwise prompt)
    if (fundBtn) {
      fundBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const userNow = auth.currentUser;
        if (!userNow) return alert("Please log in.");
        let amountNgn = 0;
        if (amountInput && amountInput.value) {
          amountNgn = parseFloat(amountInput.value);
        } else {
          const v = prompt("Enter amount to fund (NGN):", "1000");
          if (!v) return;
          amountNgn = parseFloat(v);
        }
        if (isNaN(amountNgn) || amountNgn <= 0) return alert("Enter a valid amount.");
        openPaystackAndVerify(amountNgn, userNow);
      });
    }
  });
});
