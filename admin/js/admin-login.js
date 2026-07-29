import { auth, ADMIN_UID } from "/js/firebase-config.js?v=2";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const errorMessage = document.getElementById("errorMessage");

// Check if user is already authenticated and authorized
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (user.uid === ADMIN_UID) {
      window.location.href = "/admin/index.html";
    } else {
      await signOut(auth);
      showError("Access Denied: You do not have administrative privileges for KVM Creations.");
    }
  }
});

function showError(msg) {
  if (!errorMessage) return;
  errorMessage.textContent = msg;
  errorMessage.classList.add("visible");
}

function clearError() {
  if (!errorMessage) return;
  errorMessage.textContent = "";
  errorMessage.classList.remove("visible");
}

function setLoading(isLoading) {
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  if (isLoading) {
    if (btnText) btnText.textContent = "Authenticating...";
    if (btnSpinner) btnSpinner.style.display = "inline-block";
  } else {
    if (btnText) btnText.textContent = "Sign In";
    if (btnSpinner) btnSpinner.style.display = "none";
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError("Please enter both email address and password.");
      return;
    }

    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.uid === ADMIN_UID) {
        window.location.href = "/admin/index.html";
      } else {
        await signOut(auth);
        setLoading(false);
        showError("Access Denied: You do not have administrative privileges for KVM Creations.");
      }
    } catch (error) {
      console.warn("[Auth Notice] Login attempt rejected:", error.code);
      setLoading(false);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          showError("Invalid email address or password.");
          break;
        case "auth/invalid-email":
          showError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          showError("Too many failed attempts. Please wait a few moments and try again.");
          break;
        case "auth/network-request-failed":
          showError("Network error. Please check your internet connection.");
          break;
        default:
          showError("Authentication failed. Please verify your credentials.");
          break;
      }
    }
  });
}

