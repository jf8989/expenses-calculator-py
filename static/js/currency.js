// static/js/currency.js
import { populateCurrencyOptions, applyCurrencyPreferences } from './ui.js';

const CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
    // Add more currencies as needed
];

export function initializeCurrencySelection() {
    const mainSelect = document.getElementById("main-currency");
    const secondarySelect = document.getElementById("secondary-currency");

    if (!mainSelect || !secondarySelect) {
        console.error("Currency select elements not found.");
        return;
    }

    populateCurrencyOptions(CURRENCIES, mainSelect, secondarySelect);
    loadCurrencyPreferences(); // Apply saved preferences
}

export function loadCurrencyPreferences() {
    const mainSelect = document.getElementById("main-currency");
    const secondarySelect = document.getElementById("secondary-currency");
    const mainPref = localStorage.getItem("mainCurrency");
    const secondaryPref = localStorage.getItem("secondaryCurrency");

    applyCurrencyPreferences(mainPref, secondaryPref, mainSelect, secondarySelect);
}