# 📊 ExpenseSplit Pro: Shared Expense Manager (Firebase Edition)

[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
[![Flask Version](https://img.shields.io/badge/flask-3.x%2B-green.svg)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

An intuitive web application designed to simplify the tracking, management, and splitting of shared expenses among multiple participants. Built with Python/Flask, Firebase (Authentication & Firestore), IndexedDB, and Vanilla JavaScript.

<!-- 📸 Add a screenshot or GIF of the application interface here! -->
<!-- Example: <p align="center"><img src="path/to/screenshot.png" alt="App Screenshot" width="700"></p> -->

---

## ✨ Key Features

*   **👤 Google Authentication:** Secure sign-in using Firebase Authentication (Google Provider).
*   **☁️ Cloud Data Storage:** User data (participants, transactions, sessions) stored securely in Firestore.
*   **⚡ Client-Side Caching:** Uses IndexedDB to cache data locally, minimizing Firestore reads and improving performance. Automatic data synchronization based on timestamps.
*   **👥 Dynamic Participant Management:** Easily add or remove participants involved in expense sharing.
*   **💸 Transaction Input & Parsing:** Paste transactions in a simple text format (`DD/MM/YYYY: Description - Amount`) for quick entry.
*   **📊 Detailed Transaction Analysis:**
    *   View all transactions in a sortable, filterable table.
    *   Assign/unassign expenses to one or multiple participants using checkboxes.
    *   **✏️ In-Place Amount Editing:** Edit transaction amounts directly within the table via a hover-activated button.
    *   **🖱️ Currency Toggling:** Single-click on amount text to switch between primary and secondary display currencies.
*   **🤖 Smart Assignment:** Automatically suggests participant assignments based on historical transaction descriptions.
*   **💲 Multi-Currency Support:** Define primary and secondary currencies for clear display and summary.
*   **📈 Real-time Expense Summary:** Automatically calculates and displays the total amount owed per participant in both selected currencies based on locally cached data.
*   **💾 Session Management (Firestore-backed):**
    *   **Save:** Save the current state (transactions, assignments) to Firestore under a specific name.
    *   **Load:** Restore a previously saved session from Firestore, replacing current data (updates local cache).
    *   **Overwrite:** Update an existing saved session in Firestore with the current transaction data.
*   **📄 PDF Export (Client-Side):**
    *   Generate a detailed PDF report **in the browser** for any **saved session** (using locally cached data).
    *   PDF includes session name, transaction list (with assignments), expense summary, and export timestamp.
*   **📱 Responsive Design:** Functional interface across different screen sizes.

---

## 💻 Tech Stack

*   **Backend:** Python 3, Flask
*   **Database:** Google Firestore (NoSQL Cloud Database)
*   **Authentication:** Firebase Authentication (Google Provider)
*   **Client-Side Cache:** Browser IndexedDB (potentially using the `idb` library)
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES Modules)
*   **PDF Generation:** jsPDF, jspdf-autotable (Client-Side JavaScript)
*   **Python Libraries:** `firebase-admin`, Flask, Werkzeug
*   **JavaScript Libraries:** Firebase SDK, jsPDF, jspdf-autotable, (`idb` - optional)

---

## 🔥 Firebase Setup (Required)

1.  **Create Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication:**
    *   Navigate to "Authentication" -> "Sign-in method".
    *   Enable the "Google" provider. Configure OAuth consent screen details if required.
3.  **Enable Firestore:**
    *   Navigate to "Firestore Database" -> "Create database".
    *   Start in **Production mode** (recommended). Choose appropriate security rules (e.g., allow read/write only for authenticated users on their own data: `allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;` - adapt based on your data structure).
    *   Select a server location.
4.  **Register Web App:**
    *   Go to Project Settings (⚙️) -> General -> Your apps -> Add app -> Web (</>).
    *   Give it a nickname (e.g., "ExpenseSplit Pro Web").
    *   Register the app. **Copy the `firebaseConfig` object** provided. You will need this for the frontend (`index.html` or a JS config file).
5.  **Generate Service Account Key (for Backend):**
    *   Go to Project Settings (⚙️) -> Service accounts.
    *   Click "Generate new private key" and confirm.
    *   **Securely store the downloaded JSON key file.** Do NOT commit it to version control. Add its filename to your `.gitignore` file.
    *   The backend will need the *path* to this file, typically set via an environment variable.

---

## ⚙️ Local Setup and Installation

**1. Prerequisites:**
    *   **Python 3.9+:** Verify installation (`python --version`).
    *   **Git:** Verify installation (`git --version`).
    *   **Firebase Project:** Complete the Firebase Setup steps above.

**2. Clone the Repository:**
   ```bash
   git clone https://github.com/jf8989/expenses-calculator.git # Or your repo URL
   cd expenses-calculator
   ```

**3. Configure Environment Variables:**
* Create a .env file in the project root (and add .env to your .gitignore!).
* Add the following variables:
```dotenv
# Flask Secret Key (generate a random one)
SECRET_KEY='your_strong_random_secret_key'

# Path to your Firebase Admin SDK key file
  GOOGLE_APPLICATION_CREDENTIALS='/path/to/your/serviceAccountKey.json'

  # Optional: Set Flask debug mode (True/False)
  FLASK_DEBUG=True
  ```
*   *Note:* When deploying (e.g., to Vercel), set these as environment variables in the deployment platform's settings instead of using a `.env` file.

**4. Install Python Dependencies:**
   ```bash
   python -m venv .venv
# Windows (PowerShell): .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
```

**5.Install Python Dependencies:**
```dotenv
pip install -r requirements.txt
  ```
  *  (Ensure requirements.txt includes Flask, firebase-admin, python-dotenv (for local .env loading), etc. Remove Flask-Session if it was present)
---

## ▶️ Running the Application

1.  Make sure your virtual environment is activated (`(.venv)` should be visible).
2.  Run the Flask development server:
    ```bash
    python app.py
    ```
3.  Open your web browser and navigate to: `http://127.0.0.1:5000` (or the address provided in the terminal).

---

## 🚀 Usage Guide

1.  **Register/Login:** Create an account or log in.
2.  **Add Participants:** Go to "Participants Management" and add the names of people sharing expenses.
3.  **Set Currencies:** Select your primary and secondary currencies under "Currency Selection".
4.  **Input Transactions:** Paste transaction data (format: `DD/MM/YYYY: Description - Amount`) into the "Transaction Input" text area.
5.  **Add Transactions:** Click "Add Transactions". The app will parse them and attempt auto-assignment based on history.
6.  **Assign Participants:** In the "Transaction Analysis" table, check/uncheck boxes to assign each transaction to the correct participants.
7.  **Toggle Currency:** Click directly on the amount text (e.g., "PEN 50.00") in the table to toggle its display between primary and secondary currencies.
8.  **Edit Amount:** Hover over the amount cell; a pencil icon (✎) will appear. Click the pencil to open an input field, change the value, and press Enter or click away to save.
9.  **Filter:** Use the search bar above the transaction table to filter by date, description, or amount.
10. **Save State:** Go to "Session Management", optionally enter a name, and click "Save Current State".
11. **Manage Sessions:** In the "Saved Sessions" table:
    *   Click **Load** to restore a previous state.
    *   Click **Save** (Overwrite) to update that saved session with the *current* transaction data.
    *   Click **Export** to download a PDF report (generated in your browser) for *that specific saved session*.
    *   Click **Delete** to remove the saved session.
12. **View Summary:** Check the "Expenses Summary" table for the calculated totals owed per participant.

---

## 📁 Project Structure

```
.
├── .venv/                  # Virtual environment files (usually gitignored)
├── static/
│   ├── css/
│   │   └── styles.css      # Main application styles (pdf_styles.css removed)
│   └── js/
│       ├── main.js         # Core frontend logic
│       └── export.js       # Client-side PDF export logic
├── templates/
│   └── index.html          # Main application page template (pdf_template.html removed)
├── .gitignore              # Specifies intentionally untracked files
├── app.log                 # Application log file
├── app.py                  # Main Flask application logic, routes
├── auth.py                 # Blueprint for authentication routes
├── database.py             # Database connection and initialization logic
├── expense_sharing.db      # SQLite database file
├── LICENSE                 # License file (e.g., MIT)
├── readme.md               # This file
├── requirements.txt        # Python dependencies
└── schema.sql              # Database table definitions
```

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