# 📊 ExpenseSplit Pro: Shared Expense Manager (Firebase Edition)

[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
[![Flask Version](https://img.shields.io/badge/flask-3.x%2B-green.svg)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

An intuitive web application designed to simplify the tracking, management, and splitting of shared expenses among multiple participants. Built with Python/Flask, **Firebase (Authentication & Firestore)**, **IndexedDB (Client-Side Cache)**, and Vanilla JavaScript.

<!-- 📸 Add a screenshot or GIF of the application interface here! -->
<!-- Example: <p align="center"><img src="path/to/screenshot.png" alt="App Screenshot" width="700"></p> -->

---

## ✨ Key Features

*   **👤 Firebase Authentication:** Secure Sign-In using **Google Accounts**.
*   **☁️ Cloud Data Storage:** Expense data stored securely in **Firebase Firestore**.
*   **⚡ Client-Side Caching:** Uses **IndexedDB** to cache data locally, reducing Firestore reads and improving performance. Automatic data synchronization based on timestamps.
*   **👥 Dynamic Participant Management:** Easily add or remove participants involved in expense sharing.
*   **💸 Transaction Input & Parsing:** Paste transactions in a simple text format (`DD/MM/YYYY: Description - Amount`) for quick entry.
*   **📊 Detailed Transaction Analysis:**
    *   View all transactions in a sortable, filterable table.
    *   Assign/unassign expenses to one or multiple participants using checkboxes.
    *   **✏️ In-Place Amount Editing:** Edit transaction amounts directly within the table via a hover-activated button.
    *   **🖱️ Currency Toggling:** Single-click on amount text to switch between primary and secondary display currencies.
*   **🤖 Smart Assignment:** Automatically suggests participant assignments based on historical transaction descriptions.
*   **💲 Multi-Currency Support:** Define primary and secondary currencies for clear display and summary.
*   **📈 Real-time Expense Summary:** Automatically calculates and displays the total amount owed per participant in both selected currencies based on cached data.
*   **💾 Session Management:**
    *   **Save:** Save the current state (transactions, assignments) to Firestore under a specific name.
    *   **Load:** Restore a previously saved session from Firestore, replacing current cached data.
    *   **Overwrite:** Update an existing saved session in Firestore with the current transaction data.
*   **📄 PDF Export (Client-Side):**
    *   Generate a detailed PDF report **in the browser** for any **saved session** (using cached data).
    *   PDF includes session name, transaction list (with assignments), expense summary, and export timestamp.
*   **📱 Responsive Design:** Functional interface across different screen sizes.

---

## 💻 Tech Stack

*   **Backend:** Python 3, Flask
*   **Database:** Firebase Firestore (Cloud NoSQL Database)
*   **Authentication:** Firebase Authentication (Google Sign-In)
*   **Client-Side Cache:** IndexedDB
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **PDF Generation:** jsPDF, jspdf-autotable (Client-Side JavaScript)
*   **Python Libraries:** `firebase-admin`, Werkzeug
*   **JS Libraries:** Firebase SDK

---

## 🔥 Firebase Setup

Before running the application, you need to set up a Firebase project:

1.  **Create Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication:**
    *   Navigate to "Authentication" -> "Get started".
    *   Go to the "Sign-in method" tab.
    *   Enable the "Google" provider and configure the OAuth consent screen details.
3.  **Enable Firestore:**
    *   Navigate to "Firestore Database" -> "Create database".
    *   Start in **Production mode** (recommended) or Test mode (ensure security rules are set later).
    *   Choose a server location.
4.  **Register Web App:**
    *   Go to Project Settings (⚙️) -> General -> Your apps -> Add app -> Web (</>).
    *   Give it a nickname (e.g., "ExpenseSplit Web").
    *   Register the app. **Copy the `firebaseConfig` object** provided. You'll need this for the frontend (`index.html`).
5.  **Generate Service Account Key (Backend):**
    *   Go to Project Settings (⚙️) -> Service accounts.
    *   Click "Generate new private key" and confirm.
    *   **Securely store** the downloaded JSON key file. **Do not commit this file to version control.** The backend (`app.py`) will need the *path* to this file.

---

## ⚙️ Local Setup and Installation

Follow these steps to get the project running locally.

**1. Prerequisites:**
    *   **Python 3.9+:** Verify installation (`python3 --version`). Install from [python.org](https://www.python.org/downloads/) if needed. Ensure `pip` is included.
    *   **Command tip (Ubuntu/WSL):** The `python` alias is not installed by default. Use `python3`/`pip3` for every step (or install the `python-is-python3` package if you want `python` available).
    *   **Git:** Verify installation (`git --version`). Install from [git-scm.com](https://git-scm.com/downloads) if needed.
    *   **Firebase Project:** Complete the Firebase Setup steps above.

**2. Clone the Repository:**
   ```bash
   git clone <your-repository-url> # Replace with your repo URL
   cd <your-repository-directory>
   ```

**3. Create and Activate Virtual Environment:**
   ```bash
   # Linux/WSL prerequisite if you see "ensurepip is not available"
   # sudo apt install python3-venv

   # Create the environment (most Unix systems expose Python 3 as python3)
   python3 -m venv .venv

   # If your system maps `python` to Python 3, this works too:
   # python -m venv .venv

   # Activate it
   # Windows (PowerShell):
   .\.venv\Scripts\Activate.ps1
   # Windows (Command Prompt):
   .\.venv\Scripts\activate.bat
   # macOS/Linux:
   source .venv/bin/activate
   ```
   *(You should see `(.venv)` at the start of your terminal prompt)*

**4. Configure Environment Variables:**
    *   The application needs access to your Firebase Service Account Key. Set an environment variable pointing to the location of the downloaded JSON key file **before running the server**.
      ```bash
      # Example (macOS/Linux - temporary for current session)
      export FIREBASE_SERVICE_ACCOUNT_KEY="/absolute/path/to/serviceAccountKey.json"

      # Example (Windows PowerShell - temporary for current session)
      $env:FIREBASE_SERVICE_ACCOUNT_KEY = "C:\absolute\path\to\serviceAccountKey.json"
      ```
      *(For persistent storage, add this to your `.bashrc`, `.zshrc`, `.profile`, or System Environment Variables)*
    *   Set a Flask Secret Key (optional but recommended for production):
      ```bash
      # Example (macOS/Linux)
      export SECRET_KEY='your-very-strong-secret-key'
      # Example (Windows PowerShell)
      $env:SECRET_KEY = 'your-very-strong-secret-key'
      ```

**5. Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   *(Ensure `requirements.txt` includes `Flask`, `firebase-admin`, `Werkzeug`, etc.)*

**6. Configure Frontend Firebase SDK:**
    *   Open `templates/index.html`.
    *   Find the placeholder for the Firebase configuration.
    *   Paste the `firebaseConfig` object you copied during the "Register Web App" step in the Firebase setup.

**7. Database Initialization:**
    *   No manual database initialization is needed. Firestore is managed in the cloud.

---

## ▶️ Running the Application

1.  Make sure your virtual environment is activated (`(.venv)` should be visible).
2.  Ensure the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is set correctly.
3.  Run the Flask development server:
    ```bash
    python3 app.py
    ```
4.  Open your web browser and navigate to: `http://127.0.0.1:5000` (or the address provided in the terminal).

---

## 🚀 Usage Guide

1.  **Sign In:** Click the "Sign in with Google" button and authenticate using your Google account.
2.  **Add Participants:** Go to "Participants Management" and add the names of people sharing expenses.
3.  **Set Currencies:** Select your primary and secondary currencies under "Currency Selection".
4.  **Input Transactions:** Paste transaction data (format: `DD/MM/YYYY: Description - Amount`) into the "Transaction Input" text area.
5.  **Add Transactions:** Click "Add Transactions". The app will parse them and attempt auto-assignment based on history.
6.  **Assign Participants:** In the "Transaction Analysis" table, check/uncheck boxes to assign each transaction to the correct participants. Changes are saved automatically to the local cache.
7.  **Toggle Currency:** Click directly on the amount text (e.g., "PEN 50.00") in the table to toggle its display between primary and secondary currencies.
8.  **Edit Amount:** Hover over the amount cell; a pencil icon (✎) will appear. Click the pencil to open an input field, change the value, and press Enter or click away to save.
9.  **Filter:** Use the search bar above the transaction table to filter by date, description, or amount.
10. **Save State:** Go to "Session Management", optionally enter a name, and click "Save Current State". This saves the *current* locally cached transactions and assignments to Firestore.
11. **Manage Sessions:** In the "Saved Sessions" table (loaded from Firestore):
    *   Click **Load** to fetch that session's data from Firestore and replace your current local cache.
    *   Click **Save** (Overwrite) to update that saved session in Firestore with the *current* locally cached transaction data.
    *   Click **Export** to download a PDF report (generated in your browser) using the locally cached data for *that specific saved session*.
    *   Click **Delete** to remove the saved session from Firestore.
12. **View Summary:** Check the "Expenses Summary" table for the calculated totals owed per participant based on the current locally cached data.
13. **Sign Out:** Click the "Sign Out" button.

---

## 📁 Project Structure (Updated)

```
.
├── .venv/                  # Virtual environment files (gitignored)
├── flask_session/          # Filesystem session data (gitignored)
├── static/
│   ├── css/
│   │   ├── _base.css
│   │   ├── _buttons.css
│   │   ├── _firebase_auth.css # Styles for Firebase UI elements
│   │   ├── _footer.css
│   │   ├── _forms.css
│   │   ├── _header.css
│   │   ├── _participants.css
│   │   ├── _responsive.css
│   │   ├── _sections.css
│   │   ├── _sessions.css
│   │   ├── _summary.css
│   │   ├── _tables.css
│   │   ├── _transactions.css
│   │   ├── _utilities.css
│   │   ├── _variables.css
│   │   └── styles.css      # Main CSS import file
│   └── js/
│       ├── api.js          # Handles fetch requests to backend API
│       ├── currency.js     # Currency related logic
│       ├── export.js       # Client-side PDF export logic (uses local state)
│       ├── handlers.js     # Event handlers for UI interactions
│       ├── main.js         # Main entry point, initialization, Firebase auth listener
│       ├── state.js        # Manages client-side state & IndexedDB cache
│       ├── theme.js        # Dark/Light theme logic
│       ├── transactions.js # Transaction parsing and utility functions
│       └── ui.js           # DOM manipulation and UI updates
├── templates/
│   └── index.html          # Main application page template
├── .gitignore              # Specifies intentionally untracked files
├── app.log                 # Application log file
├── app.py                  # Main Flask application logic, routes, Firebase Admin init
├── auth.py                 # Blueprint for Firebase authentication verification
├── participants.py         # Blueprint for participant routes (Firestore interaction)
├── sessions.py             # Blueprint for session routes (Firestore interaction)
├── transactions.py         # Blueprint for transaction routes (Firestore interaction)
├── LICENSE                 # License file (e.g., MIT)
├── readme.md               # This file
├── requirements.txt        # Python dependencies (includes firebase-admin)
└── serviceAccountKey.json  # IMPORTANT: Add this to .gitignore! (Example name)
```
*(Removed: `database.py`, `schema.sql`, `expense_sharing.db`)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please feel free to open an issue to discuss major changes before submitting a pull request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 📧 Contact

Author: JF8989
Email: juanfrajf.contacto@gmail.com
LinkedIn: [linkedin.com/in/jfmarcenaroa/](https://www.linkedin.com/in/jfmarcenaroa/)
GitHub: [github.com/jf8989](https://github.com/jf8989?tab=repositories)
