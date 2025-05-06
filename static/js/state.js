// static/js/state.js
import { log, warn, error } from './logger.js'; // Assuming logger utility

const DB_NAME = 'ExpenseSplitDB';
const STORE_NAME = 'userDataStore';
const DATA_KEY = 'currentUserData'; // Key for the single object storing user state
const DB_VERSION = 1; // Increment this if schema changes

let db = null; // Hold the DB connection reference

// --- In-Memory State ---
// Holds the data currently being used/displayed by the application
let appState = {
    isInitialized: false,
    isAuthenticated: false, // Track auth status for DB operations
    userId: null, // Store Firebase User ID for potential multi-user DB (though currently using one key)
    participants: [], // List of all participant names for the user
    sessions: [], // List of saved session objects { id, name, createdAt, lastUpdatedAt, transactions: [...], participants: [...], currencies: {...} }
    activeSessionData: { // Holds the data currently being edited/viewed
        name: '',
        transactions: [],
        participants: [],
        currencies: { main: 'PEN', secondary: 'USD' } // Default currencies
    },
    lastSyncedTimestamp: null // ISO 8601 string timestamp from backend
};

// --- IndexedDB Initialization ---

/**
 * Opens/Creates the IndexedDB database and object store.
 * Should be called once on application startup.
 * @returns {Promise<IDBPDatabase>} A promise that resolves with the DB connection or rejects on error.
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        log('State:initDB', `Initializing IndexedDB: ${DB_NAME} v${DB_VERSION}`);
        if (db) {
            log('State:initDB', 'DB already initialized.');
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            error('State:initDB', 'IndexedDB error:', event.target.error);
            reject(`IndexedDB error: ${event.target.error}`);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            log('State:initDB', 'IndexedDB initialized successfully.');
            resolve(db);
        };

        // This event only executes if the version number changes
        // or the database is created for the first time.
        request.onupgradeneeded = (event) => {
            log('State:initDB', 'Upgrade needed or DB creation.');
            const tempDb = event.target.result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                log('State:initDB', `Creating object store: ${STORE_NAME}`);
                tempDb.createObjectStore(STORE_NAME); // Simple store using explicit key ('currentUserData')
            }
            // Handle future schema upgrades here based on oldVersion
            // const oldVersion = event.oldVersion;
            // if (oldVersion < 2) { /* upgrade logic for v2 */ }
        };
    });
}

// --- IndexedDB State Operations ---

/**
 * Loads the user's state from IndexedDB into the in-memory appState.
 * @returns {Promise<object>} A promise that resolves with the loaded state object.
 */
export async function loadStateFromDB() {
    log('State:loadStateFromDB', 'Attempting to load state from IndexedDB...');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DATA_KEY);

        request.onerror = (event) => {
            error('State:loadStateFromDB', 'Error reading from IndexedDB:', event.target.error);
            reject(`Error reading state: ${event.target.error}`);
        };

        request.onsuccess = (event) => {
            const loadedData = event.target.result;
            // Store current auth state before potentially resetting
            const currentAuthStatus = appState.isAuthenticated;
            const currentUserId = appState.userId;

            if (loadedData) {
                log('State:loadStateFromDB', 'State loaded successfully from DB:', loadedData);
                appState = {
                    ...getDefaultState(), // Start with defaults
                    ...loadedData,      // Overwrite with loaded data
                    isInitialized: appState.isInitialized, // Preserve previous init flag if any
                    isAuthenticated: currentAuthStatus, // <<< PRESERVE AUTH STATUS
                    userId: currentUserId           // <<< PRESERVE USER ID
                };
                resolve(appState);
            } else {
                log('State:loadStateFromDB', 'No state found in DB for key:', DATA_KEY);
                // Reset to default BUT preserve current auth status
                appState = {
                    ...getDefaultState(),
                    isAuthenticated: currentAuthStatus, // <<< PRESERVE AUTH STATUS
                    userId: currentUserId           // <<< PRESERVE USER ID
                };
                resolve(appState); // Resolve with the corrected default state
            }
        };
    });
}

/**
 * Saves the current in-memory appState (relevant parts) to IndexedDB.
 * @returns {Promise<void>} A promise that resolves on success or rejects on error.
 */
async function saveStateToDB() {
    if (!db) {
        error('State:saveStateToDB', 'DB not initialized. Cannot save state.');
        return Promise.reject('DB not initialized');
    }
    if (!appState.isAuthenticated || !appState.userId) {
        log('State:saveStateToDB', 'User not authenticated, skipping save.');
        // Don't save state if user isn't logged in
        return Promise.resolve();
    }

    // Prepare the object to save (only persist relevant parts)
    const stateToSave = {
        userId: appState.userId,
        participants: appState.participants,
        sessions: appState.sessions,
        activeSessionData: appState.activeSessionData, // Persist active editing state
        lastSyncedTimestamp: appState.lastSyncedTimestamp
    };

    log('State:saveStateToDB', 'Saving state to IndexedDB:', stateToSave);

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(stateToSave, DATA_KEY); // Use put to overwrite existing data at key

        request.onerror = (event) => {
            error('State:saveStateToDB', 'Error writing to IndexedDB:', event.target.error);
            reject(`Error saving state: ${event.target.error}`);
        };

        request.onsuccess = () => {
            log('State:saveStateToDB', 'State saved successfully to IndexedDB.');
            resolve();
        };
    });
}

/**
 * Clears user data from IndexedDB (e.g., on logout).
 * @returns {Promise<void>} A promise that resolves on success or rejects on error.
 */
export function clearDBState() {
    log('State:clearDBState', 'Clearing user data from IndexedDB...');
    if (!db) {
        warn('State:clearDBState', 'DB not initialized.');
        return Promise.resolve(); // Nothing to clear
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(DATA_KEY); // Delete the user's data object

        request.onerror = (event) => {
            error('State:clearDBState', 'Error deleting from IndexedDB:', event.target.error);
            reject(`Error clearing state: ${event.target.error}`);
        };

        request.onsuccess = () => {
            log('State:clearDBState', 'User data cleared successfully from IndexedDB.');
            // Also reset in-memory state
            appState = getDefaultState();
            resolve();
        };
    });
}

// --- In-Memory State Management ---

/**
 * Returns a default structure for the application state.
 */
function getDefaultState() {
    return {
        isInitialized: false,
        isAuthenticated: false,
        userId: null,
        participants: [],
        sessions: [],
        activeSessionData: {
            name: '',
            transactions: [],
            participants: [],
            currencies: { main: 'PEN', secondary: 'USD' }
        },
        lastSyncedTimestamp: null
    };
}

/**
 * Resets the in-memory state to defaults. Does not clear DB.
 */
export function resetInMemoryState() {
    log('State:resetInMemoryState', 'Resetting in-memory state.');
    appState = getDefaultState();
}

/**
 * Updates the application state with new data, typically after fetching from backend.
 * @param {object} data - Object containing { participants, sessions, timestamp }
 */
export async function updateStateFromServer(data) {
    log('State:updateStateFromServer', 'Updating state from server data:', data);
    appState.participants = data.participants || [];
    appState.sessions = data.sessions || [];
    appState.lastSyncedTimestamp = data.timestamp || null;
    appState.isInitialized = true; // Mark as initialized after first successful fetch

    // When syncing, should we reset activeSessionData or try to preserve it?
    // Let's reset it to avoid conflicts, user can load a session if needed.
    appState.activeSessionData = getDefaultState().activeSessionData;
    // Set default participants/currencies for new active session based on user's overall settings
    appState.activeSessionData.participants = [...appState.participants]; // Copy current participants
    // TODO: Load user's preferred currencies if stored, otherwise use default

    await saveStateToDB(); // Persist the newly fetched state
}

// --- Getters ---

export function getParticipants() { return [...appState.participants]; } // Return copy
export function getSessions() { return [...appState.sessions]; } // Return copy
export function getSessionById(sessionId) { return appState.sessions.find(s => s.id === sessionId); }
export function getLastSyncedTimestamp() { return appState.lastSyncedTimestamp; }
export function getActiveSessionData() { return { ...appState.activeSessionData, transactions: [...appState.activeSessionData.transactions] }; } // Deep copy needed? Shallow for now.
export function getActiveTransactions() { return [...appState.activeSessionData.transactions]; } // Return copy
export function getActiveCurrencies() { return { ...appState.activeSessionData.currencies }; }
export function isInitialized() { return appState.isInitialized; }
export function isAuthenticated() { return appState.isAuthenticated; }
export function getUserId() { return appState.userId; }
export function getActiveParticipants() { return [...appState.activeSessionData.participants]; } // Return copy

// --- Setters / Updaters (Modify in-memory state AND trigger save to DB) ---

export async function setAuthState(isAuthenticated, userId) { // Add async
    log('State:setAuthState', `Setting auth state: ${isAuthenticated}, User ID: ${userId}`);
    const changed = appState.isAuthenticated !== isAuthenticated || appState.userId !== userId;
    appState.isAuthenticated = isAuthenticated;
    appState.userId = userId;
    if (!isAuthenticated) {
        // Clear DB state on logout
        await clearDBState(); // Already awaited, good.
    } else if (changed) {
        // If logging in, try loading state. Await this!
        try {
            await loadStateFromDB(); // <<< AWAIT HERE
        } catch (err) {
            error('State:setAuthState', 'Error loading state from DB during auth change:', err);
            // Reset to default if load fails
            appState = { ...appState, ...getDefaultState(), isAuthenticated: true, userId: userId };
            await saveStateToDB(); // Save the reset state
        }
    }
    // No immediate save needed here, subsequent actions will save.
}

export async function setParticipants(participantsList) {
    log('State:setParticipants', 'Setting participants:', participantsList);
    appState.participants = participantsList || [];
    // Also update active session participants if they should match?
    // Or keep activeSessionData.participants independent? Let's keep independent for now.
    await saveStateToDB();
}

export async function addParticipant(name) {
    log('State:addParticipant', 'Adding participant:', name);
    if (!appState.participants.includes(name)) {
        appState.participants.push(name);
        appState.participants.sort(); // Keep sorted
        // Add to active session participants as well? Yes, makes sense.
        if (!appState.activeSessionData.participants.includes(name)) {
            appState.activeSessionData.participants.push(name);
            appState.activeSessionData.participants.sort();
        }
        await saveStateToDB();
        return true; // Indicate change occurred
    }
    return false;
}

export async function deleteParticipant(name) {
    log('State:deleteParticipant', 'Deleting participant:', name);
    const initialLength = appState.participants.length;
    appState.participants = appState.participants.filter(p => p !== name);
    // Remove from active session participants
    appState.activeSessionData.participants = appState.activeSessionData.participants.filter(p => p !== name);
    if (appState.participants.length !== initialLength) {
        await saveStateToDB();
        return true; // Indicate change occurred
    }
    return false;
}

export async function setSessions(sessionsList) {
    log('State:setSessions', 'Setting sessions:', sessionsList);
    appState.sessions = sessionsList || [];
    await saveStateToDB();
}

export async function setLastSyncedTimestamp(timestamp) {
    log('State:setLastSyncedTimestamp', 'Setting timestamp:', timestamp);
    appState.lastSyncedTimestamp = timestamp;
    await saveStateToDB(); // Persist timestamp change
}

/**
 * Sets the active session data, usually after loading a saved session.
 * @param {object} session - The full session object (including transactions, participants, etc.)
 */
export async function loadSessionIntoActiveState(session) {
    log('State:loadSessionIntoActiveState', 'Loading session into active state:', session);
    if (!session) {
        // Reset to default if null/undefined session provided
        appState.activeSessionData = getDefaultState().activeSessionData;
        // Populate with current global participants
        appState.activeSessionData.participants = [...appState.participants];
    } else {
        // Deep copy might be safer if transactions are complex objects
        appState.activeSessionData = {
            name: session.name || '',
            transactions: session.transactions ? [...session.transactions] : [],
            participants: session.participants ? [...session.participants] : [],
            currencies: session.currencies ? { ...session.currencies } : getDefaultState().activeSessionData.currencies
        };
    }
    await saveStateToDB(); // Save the newly active state
}

// --- Active Transaction Modifiers ---

export async function addActiveTransaction(transaction) {
    log('State:addActiveTransaction', 'Adding active transaction:', transaction);
    // Assign a temporary ID for client-side use if needed? Or rely on index?
    // Let's assume transactions don't need a persistent ID until saved in a session.
    appState.activeSessionData.transactions.push(transaction);
    // Sort transactions? Maybe by date?
    // appState.activeSessionData.transactions.sort((a, b) => /* date comparison */);
    await saveStateToDB();
}
export async function addMultipleActiveTransactions(transactions) {
    log('State:addMultipleActiveTransactions', `Adding ${transactions.length} active transactions.`);
    appState.activeSessionData.transactions.push(...transactions);
    await saveStateToDB();
}


export async function updateActiveTransaction(index, updatedTxData) {
    log('State:updateActiveTransaction', `Updating active transaction at index ${index}:`, updatedTxData);
    if (index >= 0 && index < appState.activeSessionData.transactions.length) {
        // Merge updates carefully
        appState.activeSessionData.transactions[index] = {
            ...appState.activeSessionData.transactions[index], // Keep existing fields
            ...updatedTxData // Overwrite with new data
        };
        await saveStateToDB();
    } else {
        warn('State:updateActiveTransaction', `Invalid index ${index}`);
    }
}
export async function updateActiveTransactionAssignment(index, assigned_to) {
    log('State:updateActiveTransactionAssignment', `Updating assignment at index ${index}:`, assigned_to);
    if (index >= 0 && index < appState.activeSessionData.transactions.length) {
        appState.activeSessionData.transactions[index].assigned_to = assigned_to;
        await saveStateToDB();
    } else {
        warn('State:updateActiveTransactionAssignment', `Invalid index ${index}`);
    }
}
export async function updateActiveTransactionAmount(index, amount) {
    log('State:updateActiveTransactionAmount', `Updating amount at index ${index}:`, amount);
    if (index >= 0 && index < appState.activeSessionData.transactions.length) {
        appState.activeSessionData.transactions[index].amount = amount;
        await saveStateToDB();
    } else {
        warn('State:updateActiveTransactionAmount', `Invalid index ${index}`);
    }
}
export async function updateActiveTransactionCurrency(index, currency) {
    log('State:updateActiveTransactionCurrency', `Updating currency at index ${index}:`, currency);
    if (index >= 0 && index < appState.activeSessionData.transactions.length) {
        appState.activeSessionData.transactions[index].currency = currency;
        await saveStateToDB();
    } else {
        warn('State:updateActiveTransactionCurrency', `Invalid index ${index}`);
    }
}


export async function deleteActiveTransaction(index) {
    log('State:deleteActiveTransaction', `Deleting active transaction at index ${index}`);
    if (index >= 0 && index < appState.activeSessionData.transactions.length) {
        appState.activeSessionData.transactions.splice(index, 1);
        await saveStateToDB();
    } else {
        warn('State:deleteActiveTransaction', `Invalid index ${index}`);
    }
}

export async function deleteAllActiveTransactions() {
    log('State:deleteAllActiveTransactions', 'Deleting all active transactions.');
    appState.activeSessionData.transactions = [];
    await saveStateToDB();
}

export async function unassignAllActiveTransactions() {
    log('State:unassignAllActiveTransactions', 'Unassigning all active transactions.');
    appState.activeSessionData.transactions.forEach(tx => tx.assigned_to = []);
    await saveStateToDB();
}

export async function setActiveCurrencies(mainCurrency, secondaryCurrency) {
    log('State:setActiveCurrencies', `Setting active currencies: Main=${mainCurrency}, Secondary=${secondaryCurrency}`);
    appState.activeSessionData.currencies = { main: mainCurrency, secondary: secondaryCurrency };
    // Do we need to save this immediately? Yes, persist preference.
    await saveStateToDB();
}

export function setInitialized(value) {
    log('State:setInitialized', `Setting initialized status to: ${value}`);
    appState.isInitialized = !!value; // Ensure boolean value
    // No need to save state to DB just for this flag, it's transient session info
}