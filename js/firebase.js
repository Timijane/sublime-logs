<!-- firebase.js -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "AIzaSyDVu5IQ3Y5bvgAfSKym8kXPpZZWKqMELTM",
    authDomain: "sublime-logs.firebaseapp.com",
    projectId: "sublime-logs",
    storageBucket: "sublime-logs.firebasestorage.app",
    messagingSenderId: "381847722551",
    appId: "1:381847722551:web:8ec68f018291d3927f3db2",
    measurementId: "G-8YHHJC1MP7"
  };

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
</script>
