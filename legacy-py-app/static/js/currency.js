// static/js/currency.js
import { populateCurrencyOptions, applyCurrencyPreferences } from './ui.js';
import { log } from './logger.js'; // Import logger

const CURRENCIES = [
    // ... (currency list remains the same)
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
];

export function initializeCurrencySelection() {
    log('Currency:init', 'Initializing currency selection.'); // Log added
    const mainSelect = document.getElementById("main-currency");
    const secondarySelect = document.getElementById("secondary-currency");

    if (!mainSelect || !secondarySelect) {
        error("Currency:init", "Currency select elements not found."); // Use error log
        return;
    }

    populateCurrencyOptions(CURRENCIES, mainSelect, secondarySelect);
    loadCurrencyPreferences(); // Apply saved preferences
}

export function loadCurrencyPreferences() {
    log('Currency:loadPrefs', 'Loading currency preferences.'); // Log added
    const mainSelect = document.getElementById("main-currency");
    const secondarySelect = document.getElementById("secondary-currency");
    // Use state for preferences now? Or keep localStorage for this simple setting?
    // Let's keep localStorage for now for simplicity, but state is better long-term.
    const mainPref = localStorage.getItem("mainCurrency");
    const secondaryPref = localStorage.getItem("secondaryCurrency");
    log('Currency:loadPrefs', `Found prefs: Main=${mainPref}, Secondary=${secondaryPref}`); // Log added

    applyCurrencyPreferences(mainPref, secondaryPref, mainSelect, secondarySelect);
}

// Add a function to get the currency list if needed elsewhere
export function getAvailableCurrencies() {
    return CURRENCIES;
}