# Project Setup Guide

This guide outlines the steps to set up and run the ExpenseSplit Pro application locally after cloning the repository.

## Prerequisites

*   Python 3.9+ installed.
*   Git installed.
*   A Firebase project created with:
    *   Google Sign-In enabled in Firebase Authentication.
    *   Firestore Database enabled.
*   Firebase Service Account Key JSON file downloaded.

## Setup Steps

1.  **Clone Repository (If needed):**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Place Service Account Key:**
    *   Copy your downloaded Firebase Service Account Key JSON file into the root directory of this project.
    *   Rename it to `serviceAccountKey.json` (or update the environment variable in step 5 if you use a different name).
    *   **Crucially:** Ensure this filename (`serviceAccountKey.json` or your chosen name) is listed in your `.gitignore` file to prevent committing it.

3.  **Create Virtual Environment:**
    *   Open your terminal or command shell in the project's root directory.
    *   Run:
        ```bash
        python -m venv .venv
        ```

4.  **Activate Virtual Environment:**
    *   **Windows PowerShell:**
        ```powershell
        .\.venv\Scripts\Activate.ps1
        ```
    *   **Windows Command Prompt (cmd.exe):**
        ```cmd
        .\.venv\Scripts\activate.bat
        ```
    *   **macOS / Linux (bash/zsh):**
        ```bash
        source .venv/bin/activate
        ```
    *   You should see `(.venv)` at the beginning of your terminal prompt.

5.  **Set Environment Variable:**
    *   **In the SAME terminal window where the virtual environment is active**, set the `FIREBASE_SERVICE_ACCOUNT_KEY` variable to the name of your key file.
    *   **Windows PowerShell:**
        ```powershell
        $env:FIREBASE_SERVICE_ACCOUNT_KEY = "serviceAccountKey.json"
        ```
    *   **Windows Command Prompt (cmd.exe):**
        ```cmd
        set FIREBASE_SERVICE_ACCOUNT_KEY="serviceAccountKey.json"
        ```
    *   **macOS / Linux (bash/zsh):**
        ```bash
        export FIREBASE_SERVICE_ACCOUNT_KEY="serviceAccountKey.json"
        ```
    *   *(Note: This variable is set only for the current terminal session. You need to repeat steps 4 & 5 each time you open a new terminal to run the app).*

6.  **Install Dependencies:**
    *   Ensure your virtual environment is active (`(.venv)` is visible).
    *   Run:
        ```bash
        pip install -r requirements.txt
        ```

7.  **Configure Frontend Firebase SDK:**
    *   Open `templates/index.html`.
    *   Locate the `firebaseConfig` object within the `<script type="module">` block near the end of the file.
    *   Replace the placeholder values with the actual configuration values copied from your Firebase project settings (Web App registration).

## Running the Application

1.  Ensure steps 4 (Activate Env) and 5 (Set Env Var) are done in your current terminal.
2.  Run the Flask server:
    ```bash
    python app.py
    ```
3.  Open your web browser to `http://127.0.0.1:5000` (or the address shown in the terminal).

## Running the Migration Script (One-Time Task)

If you need to migrate data from an existing `expense_sharing.db` (this should typically only be done once):

1.  Ensure `expense_sharing.db` is present in the root directory.
2.  Ensure steps 4 (Activate Env) and 5 (Set Env Var) are done.
3.  Run the migration script:
    ```bash
    python migrate_user_data.py
    ```
4.  Verify the data in the Firebase Console (Firestore Database).
5.  Once successful, you can delete `expense_sharing.db`, `database.py`, `schema.sql`, etc.