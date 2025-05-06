// static/js/theme.js
import { log, warn } from './logger.js'; // Import logger

function setTheme(themeName) {
    log('Theme:setTheme', `Applying theme: ${themeName}`); // Use logger
    localStorage.setItem('theme', themeName);
    document.body.dataset.theme = themeName;

    const themeLabel = document.querySelector('.theme-label');
    if (themeLabel) {
        themeLabel.textContent = themeName === 'dark' ? 'Light Mode' : 'Dark Mode';
    } else {
        warn("Theme:setTheme", "Theme label element not found."); // Use logger
    }
}

export function toggleTheme() {
    const themeToggle = document.getElementById('theme-checkbox');
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    log('Theme:toggleTheme', `Toggling theme from ${currentTheme} to ${newTheme}`); // Use logger
    setTheme(newTheme);

    if (themeToggle) {
        themeToggle.checked = (newTheme === 'dark');
    } else {
        warn("Theme:toggleTheme", "Theme toggle checkbox not found."); // Use logger
    }
}

export function loadInitialTheme() {
    const themeToggle = document.getElementById('theme-checkbox');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let initialTheme = 'light';

    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (prefersDark) {
        initialTheme = 'dark';
    }

    log('Theme:loadInitialTheme', `Loading initial theme: ${initialTheme}`); // Use logger
    setTheme(initialTheme);

    if (themeToggle) {
        themeToggle.checked = (initialTheme === 'dark');
    } else {
        warn("Theme:loadInitialTheme", "Theme toggle checkbox not found."); // Use logger
    }
}