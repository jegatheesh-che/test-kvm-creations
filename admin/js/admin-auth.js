// ================================================
// KVM Creations — Admin Authentication Logic
// ================================================

import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { auth, ADMIN_UID } from "../../js/firebase-config.js";

// DOM Elements
const loginForm = document.getElementById('adminLoginForm');
const emailInput = document.getElementById('adminEmail');
const passwordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const errorBox = document.getElementById('errorBox');
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');

/**
 * Displays or hides error messages in the login interface
 * @param {string|null} message - Error text to show, or null to clear
 */
function showError(message) {
  if (!errorBox) return;
  if (message) {
    errorBox.textContent = message;
    errorBox.classList.add('show');
  } else {
    errorBox.textContent = '';
    errorBox.classList.remove('show');
  }
}

/**
 * Sets button UI state between normal and loading
 * @param {boolean} isLoading 
 */
function setLoading(isLoading) {
  if (!loginBtn) return;
  loginBtn.disabled = isLoading;
  if (isLoading) {
    loginBtn.classList.add('loading');
    btnText.textContent = 'Verifying Credentials...';
  } else {
    loginBtn.classList.remove('loading');
    btnText.textContent = 'Sign In to Studio Admin';
  }
}

// ------------------------------------------------
// 1. Session State Observer (Auto-redirect if already authorized)
// ------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.uid === ADMIN_UID) {
      // Authorized admin session active — redirect to dashboard
      const path = window.location.pathname.toLowerCase();
      if (path.endsWith('login.html') || path.endsWith('/admin') || path.endsWith('/admin/')) {
        window.location.href = '/admin/index.html';
      }
    } else {
      // Authenticated user lacks authorized admin UID — sign out immediately
      signOut(auth).then(() => {
        showError('Access Denied: Account UID is not authorized for KVM Studio Admin.');
      });
    }
  }
});

// ------------------------------------------------
// 2. Login Form Handler
// ------------------------------------------------
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError(null);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // Execute Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Strict Admin UID Authorization Check
      if (user.uid === ADMIN_UID) {
        // Access Granted
        window.location.href = '/admin/index.html';
      } else {
        // Access Denied: Revoke session immediately
        await signOut(auth);
        showError('Access Denied: You do not have administrative privileges for KVM Creations.');
        setLoading(false);
      }

    } catch (error) {
      setLoading(false);
      console.error('Admin Auth Error:', error.code, error.message);

      let friendlyMessage = 'Failed to sign in. Please verify your credentials.';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          friendlyMessage = 'Invalid email address or password.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          friendlyMessage = 'Access disabled due to multiple failed login attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Network connection error. Please check your internet connection.';
          break;
      }

      showError(friendlyMessage);
    }
  });
}
