// dashboard.js
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

window.onload = function () {
  console.log("✅ Dashboard loaded successfully");

  // Select elements
  const fundBtn = document.getElementById("fundBtn");
  const amountInput = document.getElementById("amount");
  const balanceDisplay = document.getElementById("balance");
  const userEmailDisplay = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ Paystack LIVE public key
  const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492";

  // ✅ Pipedream webhook URL for verification
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

  // --- Function to load real balance from Firestore ---
  async function loadBalance(userId) {
    balanceDisplay.textContent = "Loading...";
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const balance = userSnap.data().balance || 0;
        balanceDisplay.textContent = `₦${balance.toLocaleString()}`;
      } else {
        balanceDisplay.textContent = "₦0";
      }
    } catch (err) {
      console.error("Error loading balance:", err);
      balanceDisplay.textContent = "Error";
    }
  }

  // --- Function to handle Paystack payment ---
  function payWithPaystack(amount, userId, email) {
    if (!window.PaystackPop) {
      alert("Paystack not loaded yet. Refresh the page.");
      return;
    }

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Convert Naira to Kobo
      currency: "NGN",
      ref: "REF_" + Math.floor(Math.random() * 1000000000),
      onClose: function () {
        alert("❌ Transaction cancelled.");
      },
      callback: function (response) {
        console.log("✅ Paystack Response:", response);

        // Send reference to Pipedream for backend verification
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then(() => {
            alert("✅ Payment successful! Balance will update shortly.");
            loadBalance(userId); // Refresh balance after verification
          })
          .catch(() => alert("❌ Failed to contact verification server."));
      },
    });

    handler.openIframe();
  }

  // --- Fund Button click ---
  fundBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first.");
      return;
    }

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 100) {
      alert("Enter a valid amount (minimum ₦100).");
      return;
    }

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Logout ---
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      alert("Logged out successfully.");
      window.location.href = "login.html";
    });
  });

  // --- Monitor Auth State ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("👤 Logged in as:", user.email);
      userEmailDisplay.textContent = user.email;
      loadBalance(user.uid); // Load balance
    } else {
      console.log("⚠️ No user logged in. Redirecting...");
      window.location.href = "login.html";
    }
  });
};
