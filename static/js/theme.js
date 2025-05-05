// static/js/theme.js

// Function to apply the theme
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.body.dataset.theme = themeName; // Use data attribute

    // Select the label INSIDE the function
    const themeLabel = document.querySelector('.theme-label');
    // Update label text based on theme
    if (themeLabel) {
        themeLabel.textContent = themeName === 'dark' ? 'Light Mode' : 'Dark Mode';
    } else {
        console.warn("Theme label element not found during setTheme.");
    }
}

// Function to toggle between light and dark themes
export function toggleTheme() {
    // Select the toggle INSIDE the function
    const themeToggle = document.getElementById('theme-checkbox');
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    console.log(`Toggling theme from ${currentTheme} to ${newTheme}`); // Debug log
    setTheme(newTheme);

    // Update checkbox state AFTER setting theme
    if (themeToggle) {
        themeToggle.checked = (newTheme === 'dark');
    } else {
        console.warn("Theme toggle checkbox not found during toggleTheme.");
    }
}

// Function to load the initial theme
export function loadInitialTheme() {
    // Select the toggle INSIDE the function
    const themeToggle = document.getElementById('theme-checkbox');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let initialTheme = 'light'; // Default to light

    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (prefersDark) {
        initialTheme = 'dark';
    }

    console.log(`Loading initial theme: ${initialTheme}`); // Debug log
    setTheme(initialTheme);

    // Set initial checkbox state
    if (themeToggle) {
        themeToggle.checked = (initialTheme === 'dark');
    } else {
        console.warn("Theme toggle checkbox not found during loadInitialTheme.");
    }
}