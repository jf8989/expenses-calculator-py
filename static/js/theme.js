// static/js/theme.js
import { log, warn } from './logger.js';

function setTheme(themeName) {
    log('Theme:setTheme', `Applying theme: ${themeName}`);
    localStorage.setItem('theme', themeName);
    document.body.dataset.theme = themeName;
}

export function toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    log('Theme:toggleTheme', `Toggling theme from ${currentTheme} to ${newTheme}`);
    setTheme(newTheme);
}

export function loadInitialTheme() {
    const currentAppliedTheme = document.body.dataset.theme;
    log('Theme:loadInitialTheme', `Theme already applied: ${currentAppliedTheme}`);

    // Setup theme toggle button click handler
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn && !themeToggleBtn.dataset.listenerAttached) {
        themeToggleBtn.addEventListener('click', toggleTheme);
        themeToggleBtn.dataset.listenerAttached = 'true';
        log('Theme:loadInitialTheme', 'Theme toggle button listener attached');
    } else if (!themeToggleBtn) {
        warn("Theme:loadInitialTheme", "Theme toggle button not found");
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            log('Theme:mediaQuery', `System preference changed to ${newTheme} mode`);
            setTheme(newTheme);
        }
    });
}

export function setupThemeToggleEvents() {
    // This function is kept for backwards compatibility
    // Main setup is now in loadInitialTheme
    log('Theme:setupThemeToggleEvents', 'Called (setup already done in loadInitialTheme)');
}
