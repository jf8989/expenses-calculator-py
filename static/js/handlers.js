// static/js/handlers.js
import * as api from './api.js';
import * as ui from './ui.js';
import * as state from './state.js'; // Import state management functions
import { parseTransactions } from './transactions.js'; // Keep transaction parsing
import { toggleTheme } from './theme.js';
import { log, warn, error } from './logger.js'; // Assuming logger utility

// Firebase imports (needed for auth provider) - Ensure Firebase SDK is loaded first
import { GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// --- Theme Handler ---
export function themeToggleHandler() {
    toggleTheme();
}

// --- Auth Handlers ---

export async function googleSignInHandler() {
    log('Handlers:googleSignInHandler', 'Attempting Google Sign-In.');
    ui.showLoading(true, "Signing in..."); // Show loading indicator
    ui.clearAuthError(); // Clear previous errors
    const provider = new GoogleAuthProvider();
    try {
        // Use window.firebaseAuth initialized in index.html
        const result = await signInWithPopup(window.firebaseAuth, provider);
        // The onAuthStateChanged listener in main.js will handle the successful login state change.
        log('Handlers:googleSignInHandler', 'Sign-in successful via popup:', result.user.email);
        // No need to call ui.showLoggedInState() here, main.js listener does it.
    } catch (err) {
        error('Handlers:googleSignInHandler', 'Google Sign-In error:', err);
        ui.showAuthError(`Sign-in failed: ${err.message}`); // Display error to user
        // Ensure logged out state is reflected if sign-in fails
        await state.setAuthState(false, null); // Update state
        ui.showLoggedOutState(); // Update UI
    } finally {
        ui.showLoading(false);
    }
}

export async function logoutHandler() {
    log('Handlers:logoutHandler', 'Attempting Sign-Out.');
    try {
        await signOut(window.firebaseAuth);
        // The onAuthStateChanged listener in main.js will handle the state change.
        log('Handlers:logoutHandler', 'Sign-out successful.');
        // Clear state explicitly as listener might take time or fail in edge cases
        await state.setAuthState(false, null);
        ui.showLoggedOutState(); // Ensure UI updates immediately
        ui.clearAllDataUI(); // Clear tables etc.
    } catch (err) {
        error('Handlers:logoutHandler', 'Sign-Out error:', err);
        // Optionally show an error message to the user
        alert(`Logout failed: ${err.message}`);
    }
}

// REMOVED registerHandler, loginHandler, checkLoginStatusHandler


// --- Currency Handlers ---
export async function currencyChangeHandler() {
    const mainCurrency = document.getElementById("main-currency").value;
    const secondaryCurrency = document.getElementById("secondary-currency").value;
    log('Handlers:currencyChangeHandler', `Currencies changed: Main=${mainCurrency}, Secondary=${secondaryCurrency}`);
    await state.setActiveCurrencies(mainCurrency, secondaryCurrency);
    // Re-render transactions and summary to reflect potential currency display changes
    ui.refreshTransactionsTableUI(); // Assumes UI has a function to re-render based on state
    calculateAndUpdateSummary();
}

// --- Participant Handlers ---
export async function addParticipantHandler() {
    const input = document.getElementById("new-participant");
    const newParticipantName = input.value.trim();
    if (newParticipantName) {
        log('Handlers:addParticipantHandler', `Attempting to add participant: ${newParticipantName}`);
        ui.showLoading(true, "Adding participant...");
        try {
            // 1. Call API (updates backend)
            await api.addParticipantApi(newParticipantName);
            log('Handlers:addParticipantHandler', 'API call successful.');

            // 2. Update local state (triggers save to IndexedDB)
            const added = await state.addParticipant(newParticipantName);
            log('Handlers:addParticipantHandler', `State updated: ${added}`);

            // 3. Update UI
            input.value = ""; // Clear input
            ui.updateParticipantsListUI(state.getParticipants()); // Update list from state
            ui.addParticipantToTransactionCheckboxes(newParticipantName); // Add checkbox to existing rows
            calculateAndUpdateSummary(); // Recalculate summary
        } catch (error) {
            error('Handlers:addParticipantHandler', 'Error adding participant:', error);
            alert(`Error adding participant: ${error.message}`);
        } finally {
            ui.showLoading(false);
        }
    }
}

export async function deleteParticipantHandler(participantName) {
    log('Handlers:deleteParticipantHandler', `Attempting to delete participant: ${participantName}`);
    if (!confirm(`Are you sure you want to delete participant "${participantName}"? This will also remove them from any current assignments.`)) {
        return;
    }
    ui.showLoading(true, "Deleting participant...");
    try {
        // 1. Call API (updates backend)
        await api.deleteParticipantApi(participantName);
        log('Handlers:deleteParticipantHandler', 'API call successful.');

        // 2. Update local state (triggers save to IndexedDB)
        const deleted = await state.deleteParticipant(participantName);
        log('Handlers:deleteParticipantHandler', `State updated: ${deleted}`);

        // 3. Update UI
        ui.updateParticipantsListUI(state.getParticipants()); // Update list from state
        ui.removeParticipantFromTransactionCheckboxes(participantName); // Remove checkbox from rows
        calculateAndUpdateSummary(); // Recalculate summary
    } catch (error) {
        error('Handlers:deleteParticipantHandler', 'Error deleting participant:', error);
        alert(`Error deleting participant: ${error.message}`);
    } finally {
        ui.showLoading(false);
    }
}

// REMOVED loadParticipantsHandler


// --- Transaction Handlers (Operating on Active Session in State) ---
export async function addTransactionsHandler() {
    const transactionsText = document.getElementById("transactions-text").value;
    const newTransactions = parseTransactions(transactionsText);

    if (newTransactions.length === 0) {
        log('Handlers:addTransactionsHandler', 'No valid transactions parsed.');
        alert("No valid transactions found in the input text.");
        return;
    }
    log('Handlers:addTransactionsHandler', `Parsed ${newTransactions.length} transactions`);

    // REMOVED: Auto-assignment based on history (can be re-implemented client-side using state.getSessions())

    try {
        // 1. Update local state (triggers save to IndexedDB)
        await state.addMultipleActiveTransactions(newTransactions);
        log('Handlers:addTransactionsHandler', 'Active transactions added to state.');

        // 2. Update UI
        ui.clearTransactionInput(); // Clear textarea
        ui.refreshTransactionsTableUI(); // Re-render table from state
        calculateAndUpdateSummary(); // Update summary

    } catch (error) {
        error('Handlers:addTransactionsHandler', 'Error adding transactions to state:', error);
        alert(`Error adding transactions: ${error.message}`);
    }
}

// REMOVED loadTransactionsHandler

// Called by event listeners setup in ui.js
export async function updateTransactionAssignmentHandler(transactionIndex, assigned_to) {
    log('Handlers:updateTransactionAssignmentHandler', `Updating assignment for index ${transactionIndex} to:`, assigned_to);
    try {
        await state.updateActiveTransactionAssignment(transactionIndex, assigned_to);
        calculateAndUpdateSummary(); // Recalculate summary
    } catch (error) {
        error('Handlers:updateTransactionAssignmentHandler', 'Error updating assignment in state:', error);
        // Optionally revert UI or show error
    }
}

// Called by event listeners setup in ui.js
export async function deleteTransactionHandler(transactionIndex) {
    log('Handlers:deleteTransactionHandler', `Attempting to delete transaction at index: ${transactionIndex}`);
    // Confirmation might be better placed in the UI event listener setup
    // if (!confirm(`Delete transaction?`)) { return; }
    try {
        await state.deleteActiveTransaction(transactionIndex);
        ui.refreshTransactionsTableUI(); // Re-render table
        calculateAndUpdateSummary(); // Update summary
    } catch (error) {
        error('Handlers:deleteTransactionHandler', 'Error deleting transaction from state:', error);
    }
}

export async function deleteAllTransactionsHandler() {
    if (confirm("Are you sure you want to delete ALL current transactions in this active session?")) {
        log('Handlers:deleteAllTransactionsHandler', 'Deleting all active transactions.');
        try {
            await state.deleteAllActiveTransactions();
            ui.refreshTransactionsTableUI(); // Re-render table (will be empty)
            calculateAndUpdateSummary(); // Update summary
        } catch (error) {
            error('Handlers:deleteAllTransactionsHandler', 'Error deleting all active transactions from state:', error);
        }
    }
}

export async function unassignAllParticipantsHandler() {
    if (confirm("Are you sure you want to unassign all participants from ALL current transactions in this active session?")) {
        log('Handlers:unassignAllParticipantsHandler', 'Unassigning all active transactions.');
        try {
            await state.unassignAllActiveTransactions();
            ui.refreshTransactionsTableUI(); // Re-render table
            calculateAndUpdateSummary(); // Update summary
        } catch (error) {
            error('Handlers:unassignAllParticipantsHandler', 'Error unassigning all active transactions in state:', error);
        }
    }
}

// Called by event listeners setup in ui.js
export async function toggleCurrencyHandler(transactionIndex, newCurrency) {
    log('Handlers:toggleCurrencyHandler', `Toggling currency for index ${transactionIndex} to ${newCurrency}`);
    try {
        await state.updateActiveTransactionCurrency(transactionIndex, newCurrency);
        // UI span update should happen in ui.js after state update confirmation if needed
        calculateAndUpdateSummary(); // Recalculate summary
    } catch (error) {
        error('Handlers:toggleCurrencyHandler', 'Error updating currency in state:', error);
    }
}

// Called from within the UI module's edit handler (ui.js)
// It should return true/false or throw error to signal success/failure to UI
export async function handleTransactionAmountUpdate(transactionIndex, newAmount) {
    log('Handlers:handleTransactionAmountUpdate', `Handling amount update for index ${transactionIndex} to ${newAmount}`);
    try {
        await state.updateActiveTransactionAmount(transactionIndex, newAmount);
        calculateAndUpdateSummary(); // Recalculate summary
        return true; // Signal success to UI
    } catch (error) {
        error('Handlers:handleTransactionAmountUpdate', 'Error updating amount in state:', error);
        // Re-throw or return false to signal failure to UI
        throw error; // Re-throwing allows ui.js catch block to handle it
    }
}

export function filterTransactionsHandler() {
    const searchTerm = document.getElementById("transaction-search-input").value.toLowerCase();
    log('Handlers:filterTransactionsHandler', `Filtering transactions with term: "${searchTerm}"`);
    ui.filterTransactionsUI(searchTerm); // UI function handles filtering based on current DOM/state
}

// --- Summary Handler ---
export function calculateAndUpdateSummary() {
    log('Handlers:calculateAndUpdateSummary', 'Calculating and updating summary.');
    try {
        // Get data directly from state
        const transactions = state.getActiveTransactions();
        const participants = state.getActiveParticipants(); // Need this getter in state.js
        const currencies = state.getActiveCurrencies();

        // Call the UI function to update the table
        ui.updateSummaryTableUI(transactions, participants, currencies.main, currencies.secondary);
    } catch (error) {
        error('Handlers:calculateAndUpdateSummary', 'Error calculating summary:', error);
    }
}

// --- Session Handlers ---

// Helper function to refresh state and UI after session CUD operations
async function refreshStateAndSessionsUI(operation) {
    log('Handlers:refreshStateAndSessionsUI', `Refreshing state after ${operation}.`);
    ui.showLoading(true, "Syncing data...");
    try {
        // Fetch latest data from backend (includes new/updated/deleted session list and timestamp)
        const latestData = await api.fetchUserData(); // Fetch without timestamp to get latest
        // Update local state and IndexedDB
        await state.updateStateFromServer(latestData);
        // Update the sessions table UI
        ui.updateSessionsTableUI(state.getSessions());
        log('Handlers:refreshStateAndSessionsUI', `State and UI refreshed successfully after ${operation}.`);
    } catch (err) {
        error('Handlers:refreshStateAndSessionsUI', `Failed to refresh state after ${operation}:`, err);
        alert(`Failed to sync data after ${operation}. Please refresh the page.`);
    } finally {
        ui.showLoading(false);
    }
}


export async function saveSessionHandler() {
    const sessionNameInput = document.getElementById("session-name");
    let sessionName = sessionNameInput.value.trim();
    // Use default name if input is empty
    if (!sessionName) {
        sessionName = `Session ${new Date().toLocaleString()}`;
    }

    log('Handlers:saveSessionHandler', `Attempting to save current state as session: "${sessionName}"`);
    ui.showLoading(true, "Saving session...");

    try {
        // 1. Get current active state data
        const activeData = state.getActiveSessionData();
        const sessionDataPayload = {
            name: sessionName,
            description: "", // Add description field if needed
            transactions: activeData.transactions,
            participants: activeData.participants,
            currencies: activeData.currencies
        };

        // 2. Call API to save
        const savedSession = await api.saveSessionApi(sessionDataPayload);
        log('Handlers:saveSessionHandler', 'Session saved via API:', savedSession);
        alert(`Session "${savedSession.name}" saved successfully.`);

        // 3. Refresh state from server & update UI
        await refreshStateAndSessionsUI('save');
        ui.clearSessionNameInput();

    } catch (error) {
        error('Handlers:saveSessionHandler', 'Error saving session:', error);
        alert(`Error saving session: ${error.message}`);
        ui.showLoading(false); // Ensure loading is hidden on error
    }
    // Loading is hidden by refreshStateAndSessionsUI on success
}

// REMOVED loadSessionsHandler

export async function loadSessionHandler(sessionId) {
    log('Handlers:loadSessionHandler', `Attempting to load session ${sessionId} into active state.`);
    if (confirm("Loading this session will replace your current unsaved transactions. Continue?")) {
        try {
            // 1. Get session data from local state
            const sessionToLoad = state.getSessionById(sessionId);
            if (!sessionToLoad) {
                throw new Error("Session not found in local state.");
            }

            // 2. Load it into the active state (triggers save to IndexedDB)
            await state.loadSessionIntoActiveState(sessionToLoad);
            log('Handlers:loadSessionHandler', 'Session loaded into active state.');

            // 3. Update UI to reflect the newly active data
            ui.refreshTransactionsTableUI();
            calculateAndUpdateSummary();
            alert(`Session "${sessionToLoad.name}" loaded.`);

        } catch (error) {
            error('Handlers:loadSessionHandler', 'Error loading session:', error);
            alert(`Error loading session: ${error.message}`);
        }
    }
}

export async function overwriteSessionHandler(sessionId, sessionName) {
    log('Handlers:overwriteSessionHandler', `Attempting to overwrite session: ${sessionId} (${sessionName})`);
    if (confirm(`Are you sure you want to overwrite the session "${sessionName}" with your current transactions? This cannot be undone.`)) {
        ui.showLoading(true, "Overwriting session...");
        try {
            // 1. Get current active state data
            const activeData = state.getActiveSessionData();
            const sessionDataPayload = {
                name: sessionName, // Use existing name unless UI allows changing it here
                description: activeData.description || "", // Include description if available
                transactions: activeData.transactions,
                participants: activeData.participants,
                currencies: activeData.currencies
            };

            // 2. Call API to overwrite
            const overwriteResult = await api.overwriteSessionApi(sessionId, sessionDataPayload);
            log('Handlers:overwriteSessionHandler', 'Overwrite successful via API:', overwriteResult);
            alert(overwriteResult.message || "Session overwritten successfully!");

            // 3. Refresh state from server & update UI
            await refreshStateAndSessionsUI('overwrite');

        } catch (error) {
            error('Handlers:overwriteSessionHandler', 'Error overwriting session:', error);
            alert(`Error overwriting session: ${error.message}`);
            ui.showLoading(false); // Ensure loading is hidden on error
        }
        // Loading is hidden by refreshStateAndSessionsUI on success
    }
}

export async function deleteSessionHandler(sessionId, sessionName) {
    log('Handlers:deleteSessionHandler', `Attempting to delete session: ${sessionId} (${sessionName})`);
    if (confirm(`Are you sure you want to delete the session "${sessionName}" permanently?`)) {
        ui.showLoading(true, "Deleting session...");
        try {
            // 1. Call API to delete
            await api.deleteSessionApi(sessionId);
            log('Handlers:deleteSessionHandler', 'Delete successful via API.');

            // 2. Refresh state from server & update UI
            await refreshStateAndSessionsUI('delete');
            alert(`Session "${sessionName}" deleted.`);

        } catch (error) {
            error('Handlers:deleteSessionHandler', 'Error deleting session:', error);
            alert(`Error deleting session: ${error.message}`);
            ui.showLoading(false); // Ensure loading is hidden on error
        }
        // Loading is hidden by refreshStateAndSessionsUI on success
    }
}