// dashboard.js
import { auth, db } from "./firebase.js";
import { doc, getDoc, updateDoc, collection, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

window.onload = function () {
  console.log("✅ Dashboard loaded");

  // DOM Elements
  const fundBtn = document.getElementById("fundBtn");
  const amountInput = document.getElementById("amount");
  const balanceDisplay = document.getElementById("balance");
  const userEmailDisplay = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ Live Paystack public key
  const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492";

  // ⚙️ Pipedream webhook
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

  // --- Load balance from Firestore ---
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

  // --- Paystack payment ---
  function payWithPaystack(amount, userId, email) {
    if (!window.PaystackPop) {
      alert("Paystack not loaded yet.");
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

        // Send to Pipedream webhook for backend verification
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then(() => {
            alert("✅ Payment successful! Balance will update soon.");
            loadBalance(); // refresh balance
          })
          .catch((err) => {
            console.error("❌ Webhook error:", err);
            alert("Failed to contact server.");
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
      return alert("Enter a valid amount (min ₦100).");
    }

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Logout ---
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });

  // --- Monitor auth state ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      userEmailDisplay.textContent = user.email;
      loadBalance();
    } else {
      window.location.href = "login.html";
    }
  });
};
