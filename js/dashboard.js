// dashboard.js
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

window.onload = function () {
  console.log("✅ Dashboard loaded successfully");

  // --- Elements ---
  const fundBtn = document.getElementById("fundBtn");
  const amountInput = document.getElementById("amount");
  const balanceDisplay = document.getElementById("balance");
  const userEmailDisplay = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- Paystack Live Public Key ---
  const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492";

  // --- Pipedream Webhook ---
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

  // --- Fetch balance from Firestore ---
  async function loadBalance() {
    const user = auth.currentUser;
    if (!user) return;

    balanceDisplay.textContent = "Loading...";

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const balance = userSnap.data().balance || 0;
        balanceDisplay.textContent = `₦${balance.toLocaleString()}`;
      } else {
        balanceDisplay.textContent = "₦0.00";
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      balanceDisplay.textContent = "Error";
    }
  }

  // --- Fund account via Paystack ---
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
        console.log("✅ Paystack Response:", response);

        // Send reference to webhook
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then(() => {
            alert("✅ Payment successful! Balance will update shortly.");
            loadBalance();
          })
          .catch((err) => {
            console.error("❌ Webhook error:", err);
            alert("Failed to notify server.");
          });
      },
    });

    handler.openIframe();
  }

  // --- Fund Button Click ---
  fundBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 100) {
      return alert("Enter a valid amount (min ₦100)");
    }

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Logout ---
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      alert("Logged out successfully");
      window.location.href = "login.html";
    });
  });

  // --- Auth State Monitoring ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("👤 Logged in as:", user.email);
      userEmailDisplay.textContent = user.email;
      loadBalance();
    } else {
      console.log("⚠️ No user logged in. Redirecting...");
      window.location.href = "login.html";
    }
  });
};
