// static/js/theme.js
import { log, warn } from './logger.js';

function setTheme(themeName) {
    log('Theme:setTheme', `Applying theme: ${themeName}`);
    localStorage.setItem('theme', themeName);
    document.body.dataset.theme = themeName; // Applies theme via data attribute
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(`${themeName}-mode`);

    // Update theme label text to show what will happen on click
    const themeLabel = document.querySelector('.theme-label');
    if (themeLabel) {
        themeLabel.textContent = themeName === 'dark' ? 'Light Mode' : 'Dark Mode';
        themeLabel.setAttribute('aria-label', `Switch to ${themeName === 'dark' ? 'light' : 'dark'} mode`);
    } else {
        warn("Theme:setTheme", "Theme label element not found.");
    }

    // No need for manual style updates since we're using CSS variables
    // that automatically change when data-theme attribute changes
}

export function toggleTheme() {
    // Determine the current theme
    const currentTheme = document.body.dataset.theme || localStorage.getItem('theme') ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    log('Theme:toggleTheme', `Toggling theme from ${currentTheme} to ${newTheme}`);
    setTheme(newTheme); // Apply the new theme

    // Sync checkbox state
    const themeToggleCheckbox = document.getElementById('theme-checkbox');
    if (themeToggleCheckbox) {
        themeToggleCheckbox.checked = (newTheme === 'dark');
    } else {
        warn("Theme:toggleTheme", "Theme toggle checkbox not found.");
    }

    // Dispatch a custom event that other components can listen for
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
}

export function loadInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let initialTheme = 'light'; // Default to light

    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (prefersDark) {
        initialTheme = 'dark';
    }

    log('Theme:loadInitialTheme', `Loading initial theme: ${initialTheme}`);
    setTheme(initialTheme); // Apply the determined initial theme

    // Sync checkbox state
    const themeToggleCheckbox = document.getElementById('theme-checkbox');
    if (themeToggleCheckbox) {
        themeToggleCheckbox.checked = (initialTheme === 'dark');

        // Add event listener to checkbox
        themeToggleCheckbox.addEventListener('change', () => {
            toggleTheme();
        });
    } else {
        warn("Theme:loadInitialTheme", "Theme toggle checkbox not found.");
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't explicitly set a preference
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            log('Theme:mediaQuery', `System preference changed to ${newTheme} mode`);
            setTheme(newTheme);

            // Sync checkbox
            if (themeToggleCheckbox) {
                themeToggleCheckbox.checked = e.matches;
            }
        }
    });
}

// Add this function to allow direct toggling via label click
export function setupThemeToggleEvents() {
    const themeLabel = document.querySelector('.theme-label');
    if (themeLabel) {
        themeLabel.addEventListener('click', toggleTheme);
    }

    // Optional: allow clicking the entire wrapper to toggle theme
    const themeWrapper = document.querySelector('.theme-switch-wrapper');
    if (themeWrapper) {
        themeWrapper.addEventListener('click', (e) => {
            // Only trigger if the wrapper itself was clicked (not the checkbox or label)
            if (e.target === themeWrapper) {
                toggleTheme();
            }
        });
    }
}