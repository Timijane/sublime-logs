import { auth } from "./firebase.js";

window.onload = function () {
  console.log("✅ Dashboard page fully loaded.");

  const fundBtn = document.getElementById("fundBtn");
  const amountInput = document.getElementById("amount");
  const balanceDisplay = document.getElementById("balance");
  const userEmailDisplay = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // 🔑 Use your Paystack TEST key first to confirm payment flow
  const PAYSTACK_PUBLIC_KEY = "pk_test_11cfaa047a2ef7b89532fab14542e5cdfb28fc90"; 
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net"; // Pipedream webhook URL

  // --- Function to open Paystack payment ---
  function payWithPaystack(amount, userId, email) {
    if (!window.PaystackPop) {
      alert("Paystack not loaded yet. Please refresh the page.");
      return;
    }

    console.log("💳 Starting Paystack payment:", amount);

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // convert Naira to Kobo
      currency: "NGN",
      ref: "REF_" + Math.floor(Math.random() * 1000000000),
      onClose: function () {
        alert("Transaction cancelled.");
      },
      callback: function (response) {
        console.log("✅ Paystack response:", response);

        // Send to webhook for backend verification
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then(() => {
            alert("✅ Payment successful! Please wait while we verify...");
            loadBalance();
          })
          .catch((err) => {
            console.error("❌ Webhook error:", err);
            alert("Error connecting to verification server.");
          });
      },
    });

    handler.openIframe();
  }

  // --- Load Balance (temporary mock) ---
  function loadBalance() {
    balanceDisplay.textContent = "Loading...";
    setTimeout(() => {
      balanceDisplay.textContent = "₦10,000"; // Later replace with Firestore value
    }, 800);
  }

  // --- Handle Fund Button ---
  fundBtn.addEventListener("click", () => {
    console.log("🖱️ Fund button clicked.");

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first.");
      return;
    }

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 100) {
      alert("Enter a valid amount (min ₦100).");
      return;
    }

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Handle Logout ---
  logoutBtn.addEventListener("click", () => {
    console.log("🚪 Logging out...");
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });

  // --- Monitor Auth ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("👤 Logged in user:", user.email);
      userEmailDisplay.textContent = user.email;
      loadBalance();
    } else {
      console.log("⚠️ No user found. Redirecting to login...");
      window.location.href = "login.html";
    });
  });
};
