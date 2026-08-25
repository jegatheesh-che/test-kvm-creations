// ================================================
// KVM Creations Studio — Firebase Configuration Module
// ================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Project 2 Firebase Configuration (kvm-creation-studio)
const firebaseConfig = {
  apiKey: "AIzaSyCRJUOfEAcKVjaWC132U6OmWcDV7QXHlp4",
  authDomain: "kvm-creation-studio.firebaseapp.com",
  projectId: "kvm-creation-studio",
  storageBucket: "kvm-creation-studio.firebasestorage.app",
  messagingSenderId: "33416322144",
  appId: "1:33416322144:web:2339f1b0b5570b2d627705"
};

// Authorized Studio Admin UID (kvm-creation-studio)
export const ADMIN_UID = "D4Etoi6NL0YUX80wtQgO77YlZ1W2";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
