// static/js/theme.js
import { log, warn } from './logger.js';

function setTheme(themeName) {
    log('Theme:setTheme', `Applying theme: ${themeName}`);
    localStorage.setItem('theme', themeName);
    document.body.dataset.theme = themeName; // THIS IS THE PRIMARY METHOD as per your _variables.css

    // REMOVE THESE LINES - they are redundant if your CSS relies on body[data-theme]
    // document.documentElement.classList.remove('light-mode', 'dark-mode');
    // document.documentElement.classList.add(`${themeName}-mode`);

    const themeLabel = document.querySelector('.theme-label');
    if (themeLabel) {
        themeLabel.textContent = themeName === 'dark' ? 'Light Mode' : 'Dark Mode';
        themeLabel.setAttribute('aria-label', `Switch to ${themeName === 'dark' ? 'light' : 'dark'} mode`);
    } else {
        warn("Theme:setTheme", "Theme label element not found.");
    }
}

export function toggleTheme() {
    // Determine the current theme from document.body.dataset.theme which is set by inline script or previous setTheme calls
    const currentTheme = document.body.dataset.theme || 'light'; // Fallback to 'light'
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    log('Theme:toggleTheme', `Toggling theme from ${currentTheme} to ${newTheme}`);
    setTheme(newTheme);

    const themeToggleCheckbox = document.getElementById('theme-checkbox');
    if (themeToggleCheckbox) {
        themeToggleCheckbox.checked = (newTheme === 'dark');
    } else {
        warn("Theme:toggleTheme", "Theme toggle checkbox not found.");
    }

    // Dispatch custom event (your existing code, good for extensibility)
    // document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
}

export function loadInitialTheme() {
    // The inline script in index.html has already applied the theme to document.body.dataset.theme.
    // This function now primarily syncs the checkbox and sets up listeners.
    const currentAppliedTheme = document.body.dataset.theme; // Get theme already applied by inline script

    log('Theme:loadInitialTheme (JS Module)', `Theme already applied by inline script: ${currentAppliedTheme}. Syncing UI elements.`);

    // Sync checkbox state based on the theme already set on the body
    const themeToggleCheckbox = document.getElementById('theme-checkbox');
    if (themeToggleCheckbox) {
        themeToggleCheckbox.checked = (currentAppliedTheme === 'dark');

        // Ensure event listener for checkbox is only added once
        if (!themeToggleCheckbox.dataset.listenerAttached) {
            themeToggleCheckbox.addEventListener('change', toggleTheme); // Changed to call toggleTheme directly
            themeToggleCheckbox.dataset.listenerAttached = 'true';
        }
    } else {
        warn("Theme:loadInitialTheme (JS Module)", "Theme toggle checkbox not found.");
    }

    // Update theme label text based on the current theme
    const themeLabel = document.querySelector('.theme-label');
    if (themeLabel) {
        themeLabel.textContent = currentAppliedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        themeLabel.setAttribute('aria-label', `Switch to ${currentAppliedTheme === 'dark' ? 'light' : 'dark'} mode`);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) { // Only auto-switch if user hasn't explicitly set a preference
            const newTheme = e.matches ? 'dark' : 'light';
            log('Theme:mediaQuery', `System preference changed to ${newTheme} mode`);
            setTheme(newTheme); // This will update body dataset and localStorage
            if (themeToggleCheckbox) {
                themeToggleCheckbox.checked = e.matches;
            }
        }
    });
}

// setupThemeToggleEvents can be simplified or its logic merged if checkbox listener is in loadInitialTheme
export function setupThemeToggleEvents() {
    const themeLabel = document.querySelector('.theme-label');
    if (themeLabel && !themeLabel.dataset.listenerAttached) { // Prevent multiple listeners
        themeLabel.addEventListener('click', toggleTheme);
        themeLabel.dataset.listenerAttached = 'true';
    }

    // The checkbox listener is now set up in loadInitialTheme to ensure it happens once.
    // const themeWrapper = document.querySelector('.theme-switch-wrapper');
    // if (themeWrapper && !themeWrapper.dataset.listenerAttached) {
    //     themeWrapper.addEventListener('click', (e) => {
    //         if (e.target === themeWrapper) {
    //             toggleTheme();
    //         }
    //     });
    //     themeWrapper.dataset.listenerAttached = 'true';
    // }
}