import { auth } from "./firebase.js";

const fundBtn = document.getElementById("fundBtn");
const amountInput = document.getElementById("amount");
const balanceDisplay = document.getElementById("balance");
const userEmailDisplay = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// ✅ Your real Paystack Live Public Key
const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492";

// ⚙️ Your Pipedream webhook URL (for payment verification)
const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

// --- Fund Wallet ---
function payWithPaystack(amount, userId, email) {
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amount * 100, // convert naira to kobo
    currency: "NGN",
    ref: "REF_" + Math.floor(Math.random() * 1000000000),
    onClose: function () {
      alert("Transaction cancelled.");
    },
    callback: function (response) {
      // Notify backend (Pipedream for now)
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: response.reference, userId }),
      })
        .then(() => {
          alert("✅ Payment successful! Please wait while we verify...");
          loadBalance();
        })
        .catch(() => alert("❌ Error connecting to server"));
    },
  });
  handler.openIframe();
}

// --- Fund Button Click ---
fundBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("Please log in first.");

  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount < 100) return alert("Enter a valid amount (min ₦100)");

  payWithPaystack(amount, user.uid, user.email);
});

// --- Load Balance (mock for now) ---
function loadBalance() {
  balanceDisplay.textContent = "Loading...";
  setTimeout(() => {
    balanceDisplay.textContent = "₦10,000"; // Replace with Firestore balance later
  }, 800);
}

// --- Auth State Listener ---
auth.onAuthStateChanged((user) => {
  if (user) {
    userEmailDisplay.textContent = user.email;
    loadBalance();
  } else {
    window.location.href = "login.html";
  }
});

// --- Logout ---
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => (window.location.href = "login.html"));
});
