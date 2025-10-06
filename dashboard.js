import { auth } from "./firebase.js";

// Select elements
const fundBtn = document.getElementById("fundBtn");
const amountInput = document.getElementById("amount");
const balanceDisplay = document.getElementById("balance");

// Your Paystack public key
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxx"; // Replace with your Paystack public key
const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net"; // Your Pipedream webhook URL

// Function to initialize Paystack payment
function payWithPaystack(amount, userId) {
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: "user@example.com", // Replace with user's real email if available
    amount: amount * 100, // Convert Naira to Kobo
    currency: "NGN",
    ref: "REF_" + Math.floor(Math.random() * 1000000000),
    onClose: function () {
      alert("Transaction cancelled.");
    },
    callback: function (response) {
      // When payment completes successfully, call backend to verify and update balance
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: response.reference,
          userId: userId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.status === "success") {
            alert("Wallet funded successfully!");
            loadBalance(); // Refresh balance
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Error connecting to backend");
        });
    },
  });
  handler.openIframe();
}

// Listen to Fund button
fundBtn.addEventListener("click", async () => {
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

  payWithPaystack(amount, user.uid);
});

// Load user balance (you’ll connect this to Firestore later)
function loadBalance() {
  // Placeholder — later we’ll fetch real balance from Firestore
  balanceDisplay.textContent = "Fetching balance...";
  setTimeout(() => {
    balanceDisplay.textContent = "₦10,000"; // Temporary dummy data
  }, 1000);
}

// Auto-load balance when user logs in
auth.onAuthStateChanged((user) => {
  if (user) {
    loadBalance();
  } else {
    balanceDisplay.textContent = "₦0";
  }
});
