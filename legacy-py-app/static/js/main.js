// static/js/main.js
import { initializeCurrencySelection } from "./currency.js";
import { loadInitialTheme, setupThemeToggleEvents } from './theme.js';
import * as handlers from './handlers.js'; // Import all handlers
import * as state from './state.js'; // Import state functions
import * as api from './api.js'; // Import API functions
import * as ui from './ui.js'; // Import UI functions
import { log, warn, error } from './logger.js'; // Assuming logger utility

document.addEventListener("DOMContentLoaded", async function () {
  log("Main:DOMContentLoaded", "DOM fully loaded and parsed. Initializing app...");

  // --- Initial Setup ---
  loadInitialTheme(); // Load theme first
  setupThemeToggleEvents(); // Call this to make the label clickable
  initializeCurrencySelection(); // Setup currency dropdowns

  try {
    await state.initDB(); // Initialize IndexedDB connection early
    log("Main:DOMContentLoaded", "IndexedDB initialized.");
  } catch (err) {
    error("Main:DOMContentLoaded", "FATAL: Failed to initialize IndexedDB. App may not function correctly.", err);
    alert("Error initializing local database. Please refresh the page or contact support.");
    // Maybe disable parts of the UI?
    return; // Stop further initialization if DB fails
  }

  // --- Get DOM Elements (Auth related mostly) ---
  const googleSignInBtn = document.getElementById("google-signin-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const themeCheckbox = document.getElementById("theme-checkbox");
  // Other elements needed for listeners
  const addTransactionsBtn = document.getElementById("add-transactions-btn");
  const deleteAllTransactionsBtn = document.getElementById("delete-all-transactions-btn");
  const unassignAllParticipantsBtn = document.getElementById("unassign-all-participants-btn");
  const transactionSearchInput = document.getElementById("transaction-search-input");
  const addParticipantBtn = document.getElementById("add-participant-btn");
  const mainCurrencySelect = document.getElementById("main-currency");
  const secondaryCurrencySelect = document.getElementById("secondary-currency");
  const saveSessionBtn = document.getElementById("save-session-btn");
  const newSessionBtn = document.getElementById("new-session-btn");

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const tgt = document.querySelector(e.currentTarget.dataset.target);
      if (tgt) tgt.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // --- Add Event Listeners ---
  // Auth
  if (googleSignInBtn) googleSignInBtn.addEventListener("click", handlers.googleSignInHandler);
  if (logoutBtn) logoutBtn.addEventListener("click", handlers.logoutHandler);
  // Theme
  if (themeCheckbox) themeCheckbox.addEventListener("change", handlers.themeToggleHandler);
  // Transactions (Active Session)
  if (addTransactionsBtn) addTransactionsBtn.addEventListener("click", handlers.addTransactionsHandler);
  if (deleteAllTransactionsBtn) deleteAllTransactionsBtn.addEventListener("click", handlers.deleteAllTransactionsHandler);
  if (unassignAllParticipantsBtn) unassignAllParticipantsBtn.addEventListener("click", handlers.unassignAllParticipantsHandler);
  if (transactionSearchInput) transactionSearchInput.addEventListener("input", handlers.filterTransactionsHandler);
  // Participants
  if (addParticipantBtn) addParticipantBtn.addEventListener("click", handlers.addParticipantHandler);
  // Currency
  if (mainCurrencySelect) mainCurrencySelect.addEventListener("change", handlers.currencyChangeHandler);
  if (secondaryCurrencySelect) secondaryCurrencySelect.addEventListener("change", handlers.currencyChangeHandler);
  // Sessions
  if (newSessionBtn) newSessionBtn.addEventListener("click", handlers.newSessionHandler);
  if (saveSessionBtn) saveSessionBtn.addEventListener("click", handlers.saveSessionHandler);

  // --- Firebase Auth State Listener ---
  // This is the core driver for handling login/logout and initial data load
  if (window.firebaseAuth) {
    log("Main:AuthListener", "Setting up Firebase Auth listener...");
    // Add async here
    window.firebaseAuth.onAuthStateChanged(async (user) => {
      log("Main:onAuthStateChanged", `Auth state changed. User: ${user ? user.email : 'null'}`);
      if (user) {
        // --- User is signed in ---
        ui.showLoading(true, "Loading user data...");
        // Rename catch variable here
        try {
          // 1. Update auth state (NOW AWAITED)
          await state.setAuthState(true, user.uid); // <<< AWAIT HERE

          // 2. Check for data updates from server
          const lastKnownTs = state.getLastSyncedTimestamp();
          log("Main:onAuthStateChanged", `Fetching user data from server. Last known TS: ${lastKnownTs}`);
          const serverData = await api.fetchUserData(lastKnownTs);

          // 3. Update local state if server sent new data
          if (serverData && serverData.status === 'updated') {
            log("Main:onAuthStateChanged", "Server returned updated data. Updating local state.");
            await state.updateStateFromServer(serverData);
          } else if (serverData && serverData.status === 'current') {
            log("Main:onAuthStateChanged", "Local state is current according to server.");
            // Ensure state is marked as initialized even if no new data fetched
            // state.appState.isInitialized = true; // <<< REMOVE THIS LINE
            state.setInitialized(true);
          } else {
            warn("Main:onAuthStateChanged", "Received unexpected data status from server:", serverData);
            // Assume state loaded from DB is the best we have for now
            // state.appState.isInitialized = true; // <<< REMOVE THIS LINE
            state.setInitialized(true);
          }

          // 4. Update UI
          ui.showLoggedInState(user.email); // Show user email, hide auth section
          ui.renderInitialUI(); // Render all components based on state
          handlers.calculateAndUpdateSummary();
          log("Main:onAuthStateChanged", "User logged in, initial UI rendered and summary calculated.");

        } catch (err) { // <<< RENAMED error to err
          // Use the imported logger function 'error'
          error("Main:onAuthStateChanged", "Error during logged-in state processing:", err); // <<< Use imported error logger and err variable
          if (err.code === 'TOKEN_EXPIRED' || err.code === 'TOKEN_INVALID') { // <<< Use err variable
            alert("Your session has expired or is invalid. Please sign out and sign back in.");
            await handlers.logoutHandler(); // Force logout
          } else {
            alert("An error occurred while loading your data. Please try refreshing the page.");
            // Show logged-out state as a fallback?
            ui.showLoggedOutState();
            ui.clearAllDataUI();
          }
        } finally {
          ui.showLoading(false);
        }
      } else {
        // --- User is signed out ---
        log("Main:onAuthStateChanged", "User is signed out.");
        await state.setAuthState(false, null); // Clears state & DB
        ui.showLoggedOutState(); // Hide app content, show auth section
        ui.clearAllDataUI(); // Clear any lingering UI data
      }
    }); // End onAuthStateChanged
  } else {
    error("Main:DOMContentLoaded", "Firebase Auth instance (window.firebaseAuth) not found. Firebase might not have initialized correctly in index.html.");
    alert("Error initializing application authentication. Please check the console and refresh.");
  }

  // REMOVED: Initial checkLoginStatusHandler() call
  // REMOVED: Initial calculateAndUpdateSummary() call

  log("Main:DOMContentLoaded", "App initialization sequence complete.");
});

// Global error handling (optional but good practice)
window.addEventListener("unhandledrejection", function (event) {
  error("Global:UnhandledRejection", "Unhandled Promise Rejection:", event.reason);
  // Avoid alerting for every minor issue, but log it.
  // Consider a more robust error reporting mechanism for production.
});

window.addEventListener("error", function (event) {
  error("Global:Error", "Uncaught Error:", event.message, event.filename, event.lineno, event.error);
});