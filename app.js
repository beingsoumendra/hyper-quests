// app.js
// Handles saving emails to Firebase Firestore and loading them on admin page

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

/* 🔥 IMPORTANT:
   Replace all the fields below with your actual Firebase config
   from the Firebase console.
*/
const firebaseConfig = {
    apiKey: "AIzaSyAVT5Opn9b0Lf9wDvuM1tCko_Zt7BHHy4w",
    authDomain: "hyper-quests.firebaseapp.com",
    projectId: "hyper-quests",
    storageBucket: "hyper-quests.firebasestorage.app",
    messagingSenderId: "252356971102",
    appId: "1:252356971102:web:abe253b296d59f66b02cf",
    measurementId: "G-3QN804JWBN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------- WAITLIST FORM LOGIC (index.html) ----------
const waitlistForm = document.getElementById("waitlistForm");
const emailInput = document.getElementById("emailInput");
const statusMsg = document.getElementById("statusMsg");

if (waitlistForm && emailInput && statusMsg) {
  waitlistForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
      statusMsg.textContent = "Please enter a valid email.";
      statusMsg.style.color = "#f97373";
      return;
    }

    statusMsg.textContent = "Saving...";
    statusMsg.style.color = "#9ca3af";

    try {
      await addDoc(collection(db, "waitlist"), {
        email: email,
        createdAt: new Date().toISOString()
      });

      statusMsg.textContent = "You're on the waitlist! ⚡";
      statusMsg.style.color = "#4ade80";
      waitlistForm.reset();
    } catch (err) {
      console.error(err);
      statusMsg.textContent = "Something went wrong. Please try again.";
      statusMsg.style.color = "#f97373";
    }
  });
}

// ---------- ADMIN PAGE LOGIC (admin.html) ----------
const emailListDiv = document.getElementById("emailList");
const refreshBtn = document.getElementById("refreshBtn");

async function loadEmails() {
  if (!emailListDiv) return;

  emailListDiv.innerHTML = '<p class="hint">Loading emails...</p>';

  try {
    const qRef = query(collection(db, "waitlist"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(qRef);

    if (snapshot.empty) {
      emailListDiv.innerHTML = '<p class="hint">No emails yet.</p>';
      return;
    }

    emailListDiv.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();
      const email = data.email || "unknown";
      const createdAt = data.createdAt || "";

      const item = document.createElement("div");
      item.className = "email-item";

      const primary = document.createElement("div");
      primary.className = "email-item-primary";
      primary.textContent = email;

      const secondary = document.createElement("div");
      secondary.className = "email-item-secondary";
      secondary.textContent = createdAt;

      item.appendChild(primary);
      item.appendChild(secondary);

      emailListDiv.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    emailListDiv.innerHTML =
      '<p class="hint" style="color:#f97373;">Failed to load emails.</p>';
  }
}

if (emailListDiv) {
  // Load when admin page opens
  loadEmails();
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", loadEmails);
}
