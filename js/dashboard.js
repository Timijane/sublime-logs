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

  // --- Paystack live public key ---
  const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492";

  // --- Pipedream webhook for verification ---
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

  // --- Load real balance from Firestore ---
  async function loadBalance() {
    balanceDisplay.textContent = "Loading...";
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const balance = userSnap.data().balance || 0;
        balanceDisplay.textContent = `₦${balance.toLocaleString()}`;
      } else {
        balanceDisplay.textContent = "₦0"; // New user, no balance yet
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      balanceDisplay.textContent = "Error";
    }
  }

  // --- Paystack payment function ---
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
            alert("✅ Payment successful! Balance will update soon.");
            loadBalance(); // Refresh balance after successful payment
          })
          .catch((err) => {
            console.error("❌ Webhook error:", err);
            alert("Failed to contact verification server.");
          });
      },
    });

    handler.openIframe();
  }

  // --- Fund Button click ---
  fundBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 100) {
      return alert("Enter a valid amount (min ₦100)");
    }

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Logout Button ---
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      alert("Logged out successfully.");
      window.location.href = "login.html";
    });
  });

  // --- Monitor Auth state ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("👤 Logged in as:", user.email);
      userEmailDisplay.textContent = user.email;
      loadBalance();
    } else {
      console.log("⚠️ No user found. Redirecting to login...");
      window.location.href = "login.html";
    }
  });
};
