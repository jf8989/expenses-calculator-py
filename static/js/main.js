// static/js/main.js
import { initializeCurrencySelection } from './currency.js';
import { checkLoginStatusHandler, loginHandler, logoutHandler, registerHandler, currencyChangeHandler, addParticipantHandler, addTransactionsHandler, deleteAllTransactionsHandler, unassignAllParticipantsHandler, saveSessionHandler, filterTransactionsHandler, calculateAndUpdateSummary } from './handlers.js';

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed. Initializing app...");

  // --- Get DOM Elements ---
  // Auth
  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  // Transactions
  const addTransactionsBtn = document.getElementById("add-transactions-btn");
  const deleteAllTransactionsBtn = document.getElementById("delete-all-transactions-btn");
  const unassignAllParticipantsBtn = document.getElementById("unassign-all-participants-btn");
  const transactionSearchInput = document.getElementById("transaction-search-input");
  // Participants
  const addParticipantBtn = document.getElementById("add-participant-btn");
  // Currency
  const mainCurrencySelect = document.getElementById("main-currency");
  const secondaryCurrencySelect = document.getElementById("secondary-currency");
  // Sessions
  const saveSessionBtn = document.getElementById("save-session-btn");

  // --- Add Event Listeners ---
  // Auth
  if (registerBtn) registerBtn.addEventListener("click", registerHandler);
  if (loginBtn) loginBtn.addEventListener("click", loginHandler);
  if (logoutBtn) logoutBtn.addEventListener("click", logoutHandler);
  // Transactions
  if (addTransactionsBtn) addTransactionsBtn.addEventListener("click", addTransactionsHandler);
  if (deleteAllTransactionsBtn) deleteAllTransactionsBtn.addEventListener("click", deleteAllTransactionsHandler);
  if (unassignAllParticipantsBtn) unassignAllParticipantsBtn.addEventListener("click", unassignAllParticipantsHandler);
  if (transactionSearchInput) transactionSearchInput.addEventListener("input", filterTransactionsHandler);
  // Participants
  if (addParticipantBtn) addParticipantBtn.addEventListener("click", addParticipantHandler);
  // Currency
  if (mainCurrencySelect) mainCurrencySelect.addEventListener("change", currencyChangeHandler);
  if (secondaryCurrencySelect) secondaryCurrencySelect.addEventListener("change", currencyChangeHandler);
  // Sessions
  if (saveSessionBtn) saveSessionBtn.addEventListener("click", saveSessionHandler);

  // --- Initial Load ---
  initializeCurrencySelection(); // Load currency dropdowns first
  checkLoginStatusHandler(); // Check login and load data if logged in

  // Initial summary calculation (might be redundant if checkLoginStatus loads data)
  // calculateAndUpdateSummary(); // Calculate based on initial (likely empty) DOM state

  console.log("App initialization complete.");
});

// Global error handling (optional)
window.addEventListener('unhandledrejection', function (event) {
  console.error('Unhandled Promise Rejection:', event.reason);
  // alert("An unexpected error occurred. Please check the console.");
});

window.addEventListener('error', function (event) {
  console.error('Uncaught Error:', event.message, event.filename, event.lineno);
  // alert("An unexpected script error occurred. Please check the console.");
});