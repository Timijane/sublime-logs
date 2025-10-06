// dashboard.js
import { auth, db } from "./firebase.js"; // make sure firebase.js exports db (Firestore) and auth

window.onload = function () {
  console.log("✅ Dashboard loaded");

  // Elements
  const fundBtn = document.getElementById("fundBtn");
  const amountInput = document.getElementById("amount");
  const balanceDisplay = document.getElementById("balance");
  const userEmailDisplay = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // Live Paystack public key
  const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492";

  // Pipedream webhook URL
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

  // --- Load balance from Firestore ---
  async function loadBalance(userId) {
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      const data = userDoc.data();
      const balance = data?.balance || 0;
      balanceDisplay.textContent = `₦${balance.toLocaleString()}`;
    } catch (err) {
      console.error("Error loading balance:", err);
      balanceDisplay.textContent = "Error";
    }
  }

  // --- Paystack payment ---
  function payWithPaystack(amount, userId, email) {
    if (!window.PaystackPop) {
      alert("Paystack not loaded yet. Refresh the page.");
      return;
    }

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Naira to Kobo
      currency: "NGN",
      ref: "REF_" + Math.floor(Math.random() * 1000000000),
      onClose: function () {
        alert("❌ Transaction cancelled.");
      },
      callback: function (response) {
        console.log("✅ Paystack response:", response);

        // Send reference to Pipedream for verification
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then(() => {
            alert("✅ Payment successful! Balance will update shortly.");
            setTimeout(() => loadBalance(userId), 2000); // reload balance after verification
          })
          .catch((err) => {
            console.error("Error contacting server:", err);
            alert("❌ Could not verify payment.");
          });
      },
    });

    handler.openIframe();
  }

  // --- Fund button click ---
  fundBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 100) {
      alert("Enter a valid amount (min ₦100).");
      return;
    }

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Logout ---
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });

  // --- Monitor Auth State ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      userEmailDisplay.textContent = user.email;
      loadBalance(user.uid);
    } else {
      window.location.href = "login.html";
    }
  });
};
