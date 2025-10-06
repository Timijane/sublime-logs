import { auth, db } from "./firebase.js"; // Make sure your firebase.js exports db (Firestore)
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

window.onload = function () {
  console.log("✅ Dashboard loaded successfully");

  // --- Select elements ---
  const fundBtn = document.getElementById("fundBtn");
  const amountInput = document.getElementById("amount");
  const balanceDisplay = document.getElementById("balance");
  const userEmailDisplay = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- LIVE Paystack Public Key ---
  const PAYSTACK_PUBLIC_KEY = "pk_live_20505aa86cec6458bf2cc8cd926ecc06b87ff492";

  // --- Pipedream Webhook URL ---
  const WEBHOOK_URL = "https://eojegh3ks8gvl0e.m.pipedream.net";

  // --- Function to load user's real balance from Firestore ---
  async function loadBalance() {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      balanceDisplay.textContent = `₦${docSnap.data().balance || 0}`;
    } else {
      balanceDisplay.textContent = "₦0.00";
    }
  }

  // --- Paystack Payment Function ---
  function payWithPaystack(amount, userId, email) {
    if (!window.PaystackPop) {
      alert("Paystack not loaded. Refresh the page.");
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

        // Send reference to backend (Pipedream workflow)
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference, userId }),
        })
          .then(() => {
            alert("✅ Payment successful! Balance will update shortly.");
            setTimeout(loadBalance, 2000); // Reload balance after backend updates
          })
          .catch((err) => {
            console.error("❌ Webhook error:", err);
            alert("Failed to contact server.");
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
    if (isNaN(amount) || amount < 100)
      return alert("Enter a valid amount (min ₦100)");

    payWithPaystack(amount, user.uid, user.email);
  });

  // --- Logout Button ---
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      alert("Logged out successfully.");
      window.location.href = "login.html";
    });
  });

  // --- Monitor Auth ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("👤 Logged in as:", user.email);
      userEmailDisplay.textContent = user.email;
      loadBalance();
    } else {
      window.location.href = "login.html";
    }
  });
};
