// static/js/api.js
import { log } from './logger.js'; // Assuming a logger utility exists

// --- Helper Functions ---

// Handles fetch responses (Keep as is)
async function handleResponse(response) {
    log('API:handleResponse', `Received response status: ${response.status}`);
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
            log('API:handleResponse', 'Error response data:', errorData);
        } catch (e) {
            log('API:handleResponse', `HTTP error ${response.status}, no JSON body.`);
            throw new Error(response.statusText || `HTTP error! status: ${response.status}`);
        }
        // Use error message from backend if available, include code if present
        const message = errorData.error || `Server error: ${response.status}`;
        const code = errorData.code || null; // e.g., TOKEN_EXPIRED
        const error = new Error(message);
        error.code = code; // Attach code to error object
        throw error;
    }
    // Handle 204 No Content specifically
    if (response.status === 204) {
        log('API:handleResponse', 'Received 204 No Content.');
        return null; // Return null for No Content responses
    }
    // Try parsing JSON for other successful responses
    try {
        const data = await response.json();
        log('API:handleResponse', 'Parsed JSON response:', data);
        return data;
    } catch (e) {
        log('API:handleResponse', `Error parsing JSON response: ${e.message}`);
        throw new Error("Failed to parse JSON response");
    }
}

// Gets the current user's Firebase ID token
async function getAuthToken() {
    if (!window.firebaseAuth || !window.firebaseAuth.currentUser) {
        log('API:getAuthToken', 'Auth object or current user not available.');
        throw new Error("User not authenticated.");
    }
    try {
        // Force refresh? Set true only if needed, usually false is fine.
        const token = await window.firebaseAuth.currentUser.getIdToken(false);
        log('API:getAuthToken', 'Successfully retrieved auth token.');
        return token;
    } catch (error) {
        log('API:getAuthToken', `Error getting auth token: ${error.message}`, error);
        // Handle specific errors like 'auth/user-token-expired' if needed,
        // though the backend decorator often handles expiration checks.
        throw new Error("Could not retrieve authentication token.");
    }
}

// Helper to create authenticated headers
async function getAuthHeaders() {
    const token = await getAuthToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
}


// --- REMOVED Local Auth Functions ---
// registerUser, loginUser, logoutUser, checkUserStatus are removed.
// Authentication state is now managed via Firebase SDK listener in main.js


// --- Participants ---
// Note: Participants are now usually fetched as part of the main user data sync.
// These individual functions might still be useful for immediate updates after add/delete.
export async function addParticipantApi(name) {
    log('API:addParticipantApi', `Adding participant: ${name}`);
    const headers = await getAuthHeaders();
    return fetch("/api/participants", { // Endpoint remains the same
        method: "POST",
        headers: headers,
        body: JSON.stringify({ name }),
    }).then(handleResponse);
}

export async function deleteParticipantApi(name) {
    log('API:deleteParticipantApi', `Deleting participant: ${name}`);
    const headers = await getAuthHeaders();
    return fetch("/api/participants", { // Endpoint remains the same
        method: "DELETE",
        headers: headers,
        body: JSON.stringify({ name }),
    }).then(handleResponse);
}

// --- REMOVED Transaction Functions ---
// fetchTransactions, addTransactionsApi, fetchAssignmentHistory, updateAssignmentApi,
// deleteTransactionApi, deleteAllTransactionsApi, unassignAllParticipantsApi,
// updateTransactionCurrencyApi, updateTransactionAmountApi are removed.
// Live transaction state is managed client-side.

// --- Data Synchronization ---
export async function fetchUserData(lastKnownTimestamp = null) {
    log('API:fetchUserData', `Fetching user data. Last known timestamp: ${lastKnownTimestamp}`);
    const headers = await getAuthHeaders(); // Need auth token for this request
    let url = "/api/user/data";
    if (lastKnownTimestamp) {
        // Ensure timestamp is URL-encoded
        url += `?lastKnownTimestamp=${encodeURIComponent(lastKnownTimestamp)}`;
    }
    return fetch(url, {
        method: "GET",
        headers: { // Only need Authorization header for GET
            "Authorization": headers.Authorization
        }
    }).then(handleResponse);
    // Note: handleResponse might need adjustment if backend returns 304 directly
    // Currently assumes backend returns JSON like {"status": "current"} or full data
}


// --- Sessions (Interacting with Firestore via Backend) ---

export async function saveSessionApi(sessionData) {
    // Expect sessionData to be an object like:
    // { name: "Optional Name", transactions: [...], participants: [...], currencies: {...} }
    log('API:saveSessionApi', 'Saving new session:', sessionData);
    const headers = await getAuthHeaders();
    return fetch("/api/sessions", { // Use new endpoint
        method: "POST",
        headers: headers,
        body: JSON.stringify(sessionData),
    }).then(handleResponse);
}

export async function overwriteSessionApi(sessionId, sessionData) {
    // Expect sessionData like above, sessionId in URL
    log('API:overwriteSessionApi', `Overwriting session ${sessionId}:`, sessionData);
    const headers = await getAuthHeaders();
    return fetch(`/api/sessions/${sessionId}`, { // Use new endpoint with PUT
        method: "PUT", // Use PUT for overwrite/replace semantics
        headers: headers,
        body: JSON.stringify(sessionData),
    }).then(handleResponse);
}

export async function deleteSessionApi(sessionId) {
    log('API:deleteSessionApi', `Deleting session ${sessionId}`);
    const headers = await getAuthHeaders();
    return fetch(`/api/sessions/${sessionId}`, { // Use new endpoint
        method: "DELETE",
        headers: { // Only need Authorization header for DELETE
            "Authorization": headers.Authorization
        }
        // No body needed for DELETE usually
    }).then(handleResponse);
}

// REMOVED fetchSessions - now part of fetchUserData
// REMOVED loadSessionApi - loading happens client-side from cache


// --- User Info ---
// Optional: Function to get basic user info from backend '/api/user/me'
export async function fetchCurrentUserInfo() {
    log('API:fetchCurrentUserInfo', 'Fetching current user info from backend.');
    const headers = await getAuthHeaders();
    return fetch("/api/user/me", {
        method: "GET",
        headers: { "Authorization": headers.Authorization }
    }).then(handleResponse);
}

/* ---- Frequent participants ---- */
export async function updateFrequentParticipantsApi(list) {
    const headers = await getAuthHeaders();
    return fetch("/api/user/frequentParticipants", {
        method: "PUT",
        headers,
        body: JSON.stringify({ frequent: list })
    }).then(handleResponse);
}
