import { auth } from "./firebase.js";

window.onload = function () {
  console.log("✅ Dashboard loaded successfully");

  // Select elements
  const fundBtn = document.getElementById("fundBtn");
  const amountInput = document.getElementById("amount");
  const balanceDisplay = document.getElementById("balance");
  const userEmailDisplay = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ Use your Paystack test public key for now
  const PAYSTACK_PUBLIC_KEY = "pk_test_11cfaa047a2ef7b89532fab14542e5cdfb28fc90";

  // ✅ Pipedream webhook URL (for now)
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

  // --- Function to handle Paystack payment ---
  function payWithPaystack(amount, userId, email) {
    if (!window.PaystackPop) {
      alert("Paystack not loaded yet. Please refresh.");
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

        // Send reference to backend (for verification)
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then(() => {
            alert("✅ Payment successful! We’ll verify shortly.");
            loadBalance();
          })
          .catch(() => alert("❌ Failed to contact server."));
      },
    });

    handler.openIframe();
  }

  // --- Function to load wallet balance (dummy for now) ---
  function loadBalance() {
    balanceDisplay.textContent = "Loading...";
    setTimeout(() => {
      balanceDisplay.textContent = "₦10,000"; // Placeholder
    }, 1000);
  }

  // --- Fund Button ---
  fundBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in first.");

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 100)
      return alert("Enter a valid amount (min ₦100).");

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Logout Button ---
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      alert("Logged out successfully.");
      window.location.href = "login.html";
    });
  });

  // --- Auth State Monitor ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("👤 Logged in as:", user.email);
      userEmailDisplay.textContent = user.email;
      loadBalance();
    } else {
      console.log("⚠️ No user. Redirecting...");
      window.location.href = "login.html";
    }
  });
};
