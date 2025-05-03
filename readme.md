
# 📊 ExpenseSplit Pro: Shared Expense Manager

[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
[![Flask Version](https://img.shields.io/badge/flask-2.x%2B-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE) <!-- Replace MIT with your actual license -->

An intuitive web application designed to simplify the tracking, management, and splitting of shared expenses among multiple participants. Built with Python/Flask and SQLite.

---

<!-- 📸 Add a screenshot or GIF of the application interface here! -->
<!-- Example: <p align="center"><img src="path/to/screenshot.png" alt="App Screenshot" width="700"></p> -->

---

## ✨ Key Features

*   **👤 User Authentication:** Secure registration and login system.
*   **👥 Dynamic Participant Management:** Easily add or remove participants involved in expense sharing.
*   **💸 Transaction Input & Parsing:** Paste transactions in a simple text format (`DD/MM/YYYY: Description - Amount`) for quick entry.
*   **📊 Detailed Transaction Analysis:**
    *   View all transactions in a sortable, filterable table.
    *   Assign/unassign expenses to one or multiple participants using checkboxes.
    *   **✏️ In-Place Amount Editing:** Edit transaction amounts directly within the table via a hover-activated button.
    *   **🖱️ Currency Toggling:** Single-click on amount text to switch between primary and secondary display currencies.
*   **🤖 Smart Assignment:** Automatically suggests participant assignments based on historical transaction descriptions.
*   **💲 Multi-Currency Support:** Define primary and secondary currencies for clear display and summary.
*   **📈 Real-time Expense Summary:** Automatically calculates and displays the total amount owed per participant in both selected currencies.
*   **💾 Session Management:**
    *   **Save:** Save the current state (transactions, assignments) under a specific name.
    *   **Load:** Restore a previously saved session, replacing current data.
    *   **Overwrite:** Update an existing saved session with the current transaction data.
*   **📄 PDF Export:**
    *   Generate a detailed PDF report for any **saved session**.
    *   PDF includes session name, transaction list (with assignments), expense summary, and export timestamp.
*   **📱 Responsive Design:** Functional interface across different screen sizes.

---

## 💻 Tech Stack

*   **Backend:** Python 3, Flask
*   **Database:** SQLite
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **PDF Generation:** WeasyPrint
*   **Authentication:** Flask-Session
*   **Other Libraries:** Werkzeug (Security)

---

## ⚙️ Setup and Installation

Follow these steps to get the project running locally.

**1. Prerequisites:**
    *   **Python 3.9+:** Verify installation (`python --version`). Install from [python.org](https://www.python.org/downloads/) if needed. Ensure `pip` is included.
    *   **Git:** Verify installation (`git --version`). Install from [git-scm.com](https://git-scm.com/downloads) if needed.
    *   **WeasyPrint System Dependencies (Crucial!):** WeasyPrint requires GTK+ libraries (Pango, Cairo, GObject, etc.).
        *   **Windows:** Follow the **MSYS2 installation method** detailed in the [official WeasyPrint Windows installation guide](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows). **Remember to add the MSYS2 `mingw64/bin` directory to your system PATH environment variable** after installing Pango via `pacman`.
        *   **macOS:** Use Homebrew: `brew install pango gdk-pixbuf libffi`
        *   **Linux (Debian/Ubuntu):** `sudo apt-get update && sudo apt-get install python3-dev python3-pip python3-setuptools python3-wheel python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info`
        *   **Linux (Fedora):** `sudo dnf install python3-devel python3-pip python3-setuptools python3-wheel python3-cffi cairo pango gdk-pixbuf2 libffi-devel`

**2. Clone the Repository:**
   ```bash
   git clone <your-repository-url>
   cd <repository-folder-name> # e.g., cd expenses-calculator
   ```

**3. Create and Activate Virtual Environment:**
   ```bash
   # Create the environment (using .venv is common)
   python -m venv .venv

   # Activate it
   # Windows (PowerShell):
   .\.venv\Scripts\Activate.ps1
   # Windows (Command Prompt):
   .\.venv\Scripts\activate.bat
   # macOS/Linux:
   source .venv/bin/activate
   ```
   *(You should see `(.venv)` at the start of your terminal prompt)*

**4. Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   # Ensure WeasyPrint is included, or install explicitly:
   pip install Flask Flask-Session WeasyPrint Werkzeug
   ```
   *(Update `requirements.txt` if necessary: `pip freeze > requirements.txt`)*

**5. Database Initialization:**
    *   The database (`expense_sharing.db`) and its schema (`schema.sql`) are initialized automatically the first time you run `app.py` if the database file doesn't exist, thanks to the `init_db(app)` call within the `if __name__ == '__main__':` block. No separate command is needed.

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
    *   Click **Export** to download a PDF report for *that specific saved session*.
    *   Click **Delete** to remove the saved session.
12. **View Summary:** Check the "Expenses Summary" table for the calculated totals owed per participant.

---

## 📁 Project Structure

```
.
├── .venv/                  # Virtual environment files (usually gitignored)
├── static/
│   ├── css/
│   │   ├── styles.css      # Main application styles
│   │   └── pdf_styles.css  # Styles specifically for PDF export
│   └── js/
│       ├── main.js         # Core frontend logic
│       └── export.js       # PDF export trigger logic
├── templates/
│   ├── index.html          # Main application page template
│   └── pdf_template.html   # Template for PDF report generation
├── .gitignore              # Specifies intentionally untracked files
├── app.log                 # Application log file
├── app.py                  # Main Flask application logic, routes
├── auth.py                 # Blueprint for authentication routes
├── database.py             # Database connection and initialization logic
├── expense_sharing.db      # SQLite database file
├── readme.md               # This file
├── requirements.txt        # Python dependencies
└── schema.sql              # Database table definitions
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please feel free to open an issue to discuss major changes before submitting a pull request.

---

## 📜 License

Distributed under the [Your License Name Here] License. See `LICENSE` file for more information (or specify license directly).

---

## 📧 Contact

Author: JF8989
Email: juanfrajf.contacto@gmail.com
LinkedIn: [linkedin.com/in/jfmarcenaroa/](https://www.linkedin.com/in/jfmarcenaroa/)
GitHub: [github.com/jf8989](https://github.com/jf8989?tab=repositories)