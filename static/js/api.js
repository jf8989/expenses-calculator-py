// static/js/api.js

// Helper function for handling fetch responses
async function handleResponse(response) {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // If response is not JSON or empty
            throw new Error(response.statusText || `HTTP error! status: ${response.status}`);
        }
        // Use error message from backend if available
        throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    // For 204 No Content or similar, response.json() might fail
    // Check status or content-type if necessary, but for this app, JSON is expected
    try {
        return await response.json();
    } catch (e) {
        // If response is OK but not JSON (e.g., 204), return null or handle as needed
        if (response.status === 204) return null;
        throw new Error("Failed to parse JSON response");
    }
}

// --- Auth ---
export function registerUser(email, password) {
    return fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    }).then(handleResponse);
}

export function loginUser(email, password) {
    return fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    }).then(handleResponse);
}

export function logoutUser() {
    return fetch("/logout").then(handleResponse);
}

export function checkUserStatus() {
    return fetch("/user").then(handleResponse);
}

// --- Participants ---
export function fetchParticipants() {
    return fetch("/api/participants").then(handleResponse);
}

export function addParticipantApi(name) {
    return fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    }).then(handleResponse);
}

export function deleteParticipantApi(name) {
    return fetch("/api/participants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    }).then(handleResponse);
}

// --- Transactions ---
export function fetchTransactions() {
    return fetch("/api/transactions").then(handleResponse);
}

export function addTransactionsApi(transactions) {
    return fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactions),
    }).then(handleResponse);
}

export function fetchAssignmentHistory() {
    return fetch("/api/assignment-history").then(handleResponse);
}

export function updateAssignmentApi(transactionId, assignedTo) {
    return fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: transactionId, assigned_to: assignedTo }),
    }).then(handleResponse);
}

export function deleteTransactionApi(transactionId) {
    return fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
    }).then(handleResponse);
}

export function deleteAllTransactionsApi() {
    return fetch("/api/transactions/all", {
        method: "DELETE",
    }).then(handleResponse);
}

export function unassignAllParticipantsApi() {
    return fetch("/api/transactions/unassign-all", {
        method: "POST",
    }).then(handleResponse);
}

export function updateTransactionCurrencyApi(transactionId, currency) {
    return fetch("/api/update_transaction_currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, currency }),
    }).then(handleResponse);
}

export function updateTransactionAmountApi(transactionId, amount) {
    return fetch(`/api/transactions/${transactionId}/update_amount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
    }).then(handleResponse);
}


// --- Sessions ---
export function fetchSessions() {
    return fetch("/api/sessions").then(handleResponse);
}

export function saveSessionApi(name, description = "") {
    return fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
    }).then(handleResponse);
}

export function loadSessionApi(sessionId) {
    return fetch(`/api/sessions/${sessionId}/load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Empty body often needed for POST
    }).then(handleResponse);
}

export function overwriteSessionApi(sessionId) {
    return fetch(`/api/sessions/${sessionId}/overwrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Empty body
    }).then(handleResponse);
}

export function deleteSessionApi(sessionId) {
    // Note: Original code sent ID in body for DELETE, which is non-standard.
    // Assuming backend expects it this way based on previous JS.
    // A more RESTful way would be DELETE /api/sessions/<sessionId>
    return fetch(`/api/sessions/${sessionId}`, { // Corrected URL based on sessions.py blueprint
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ id: sessionId }), // Body might not be needed if ID is in URL
    }).then(handleResponse);
}