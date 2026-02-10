# Legacy Python App: ExpenseSplit Pro - Detailed Feature Report

**Application Name:** ExpenseSplit Pro  
**Version:** Firebase Edition (Legacy Python)  
**Tech Stack:** Python 3.9+ / Flask 3.x / Firebase (Authentication & Firestore)  
**Author:** JF8989  
**Last Updated:** February 2026

> **Migration Purpose:** This document serves as the comprehensive reference for migrating ExpenseSplit Pro from the legacy Python/Flask architecture to Next.js. Every feature, interaction flow, and calculation mechanic is documented to ensure feature parity in the new implementation.

---

## 📋 Executive Summary

ExpenseSplit Pro is a sophisticated web-based expense sharing and tracking application originally built with Python/Flask backend and Vanilla JavaScript frontend. The application provides comprehensive tools for managing shared expenses among multiple participants, with cloud-based data storage via Firebase Firestore, secure Google authentication, and intelligent client-side caching using IndexedDB.

This legacy Python version represents a feature-complete expense management system with multi-currency support, smart auto-assignment, real-time synchronization, and client-side PDF generation capabilities.

---

## 🎯 Next.js Migration Overview

### Migration Goals

**Primary Objective:** Migrate ExpenseSplit Pro to Next.js while maintaining 100% feature parity and improving performance, developer experience, and scalability.

**Key Benefits of Migration:**
- **Modern React Architecture**: Component-based UI with hooks and state management
- **Server-Side Rendering**: Improved SEO and initial load performance
- **API Routes**: Unified codebase for backend and frontend
- **TypeScript Support**: Enhanced type safety and developer productivity
- **Built-in Optimization**: Image optimization, code splitting, automatic bundling
- **Vercel Deployment**: Seamless deployment and edge functions

### Architecture Comparison

| Component | Legacy Python/Flask | Next.js Target |
|-----------|-------------------|---------------|
| **Backend** | Flask + Blueprints | Next.js API Routes |
| **Frontend** | Vanilla JavaScript ES6 Modules | React with TypeScript |
| **State Management** | IndexedDB + in-memory JS objects | React Context/Zustand + IndexedDB |
| **Routing** | Flask routes + client hash navigation | Next.js App Router |
| **Authentication** | Firebase Auth (client) + Admin SDK (server) | Firebase Auth + Next.js middleware |
| **Styling** | Modular CSS files | CSS Modules / Tailwind CSS |
| **API Communication** | Fetch API with manual token management | SWR/React Query with automatic caching |
| **Deployment** | Manual server deployment | Vercel/Edge deployment |

### Migration Approach

**Phase 1: Setup & Infrastructure**
1. Initialize Next.js 14+ project with App Router
2. Set up TypeScript configuration
3. Configure Firebase client SDK
4. Set up Firebase Admin SDK for API routes
5. Configure environment variables

**Phase 2: Backend Migration**
1. Convert Flask blueprints to Next.js API routes
2. Implement authentication middleware
3. Migrate Firestore operations
4. Add API error handling

**Phase 3: Frontend Migration**
1. Create React component hierarchy
2. Implement state management (React Context or Zustand)
3. Migrate UI components from vanilla JS to React
4. Implement IndexedDB hooks
5. Add form handling with React Hook Form

**Phase 4: Feature Parity**
1. Migrate all features documented in this report
2. Implement UI interaction flows
3. Replicate calculation mechanics
4. Add PDF export functionality

**Phase 5: Testing & Optimization**
1. Unit tests for API routes
2. Component testing with React Testing Library
3. E2E tests with Playwright/Cypress
4. Performance optimization
5. Accessibility audit

**Phase 6: Deployment & Migration**
1. Deploy to Vercel
2. Data migration verification
3. User migration support
4. Legacy app sunset

---

## 🔄 Component Migration Mapping

### Backend Routes: Flask → Next.js API Routes

#### Authentication Routes

**Legacy Flask:**
```python
# auth.py
@auth_bp.route('/api/user/me', methods=['GET'])
@login_required
def get_current_user_info():
    return jsonify({"id": g.user_id, "email": g.user_email}), 200
```

**Next.js Equivalent:**
```typescript
// app/api/user/me/route.ts
import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  return Response.json({ 
    id: user.uid, 
    email: user.email 
  });
}
```

**Migration Notes:**
- Replace Flask `@login_required` decorator with Next.js middleware or route-level auth check
- Use `NextRequest` instead of Flask's `request` object
- Return `Response.json()` instead of `jsonify()`
- Firebase Admin SDK usage remains the same

---

#### Participant Routes

**Legacy Flask:**
```python
# participants.py
@participants_bp.route('', methods=['GET', 'POST', 'DELETE'])
@login_required
def handle_participants():
    user_id = g.user_id
    db = firestore.client()
    # ...
```

**Next.js Equivalent:**
```typescript
// app/api/participants/route.ts
import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const db = getFirestore();
  const userDoc = await db.collection('users').doc(user.uid).get();
  const participants = userDoc.data()?.participants || [];
  
  return Response.json(participants);
}

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { name } = await request.json();
  const db = getFirestore();
  // ... implementation
}

export async function DELETE(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { name } = await request.json();
  const db = getFirestore();
  // ... implementation
}
```

**Migration Notes:**
- Single file with multiple HTTP method handlers
- No need for Flask blueprints - Next.js uses file-based routing
- Firestore operations identical to Flask version

---

#### Session Routes

**Legacy Flask:**
```python
# sessions.py
@sessions_bp.route('/api/sessions', methods=['POST'])
@login_required
def save_new_session():
    session_data = request.json
    # ...
```

**Next.js Equivalent:**
```typescript
// app/api/sessions/route.ts
export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const sessionData = await request.json();
  const db = getFirestore();
  
  const sessionRef = await db
    .collection('users')
    .doc(user.uid)
    .collection('sessions')
    .add({
      ...sessionData,
      savedAt: FieldValue.serverTimestamp(),
      lastUpdatedAt: FieldValue.serverTimestamp()
    });
  
  return Response.json({ id: sessionRef.id }, { status: 201 });
}

// app/api/sessions/[sessionId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const user = await verifyAuth(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const db = getFirestore();
  const sessionDoc = await db
    .collection('users')
    .doc(user.uid)
    .collection('sessions')
    .doc(params.sessionId)
    .get();
  
  if (!sessionDoc.exists) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }
  
  return Response.json({ id: sessionDoc.id, ...sessionDoc.data() });
}
```

**Migration Notes:**
- Dynamic routes use `[sessionId]` folder convention
- Access route params via `params` object
- All Firestore operations remain identical

---

### Frontend Migration: Vanilla JS → React

#### State Management Migration

**Legacy Vanilla JS:**
```javascript
// state.js - In-memory state
const appState = {
    isAuthenticated: false,
    userId: null,
    frequentParticipants: [],
    sessions: [],
    activeSession: {
        name: '',
        transactions: [],
        participants: [],
        currencies: { main: 'PEN', secondary: 'USD' }
    },
    lastSyncedTimestamp: null
};

export function getActiveTransactions() {
    return appState.activeSession.transactions;
}

export function addActiveTransaction(transaction) {
    appState.activeSession.transactions.push(transaction);
    saveStateToDB();
}
```

**Next.js React Equivalent (using Zustand):**
```typescript
// store/useAppStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  assigned_to: string[];
  currency: string;
}

interface AppState {
  isAuthenticated: boolean;
  userId: string | null;
  frequentParticipants: string[];
  sessions: Session[];
  activeSession: {
    name: string;
    transactions: Transaction[];
    participants: string[];
    currencies: { main: string; secondary: string };
  };
  lastSyncedTimestamp: number | null;
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (index: number) => void;
  updateTransaction: (index: number, updates: Partial<Transaction>) => void;
  setParticipants: (participants: string[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userId: null,
      frequentParticipants: [],
      sessions: [],
      activeSession: {
        name: '',
        transactions: [],
        participants: [],
        currencies: { main: 'PEN', secondary: 'USD' }
      },
      lastSyncedTimestamp: null,
      
      addTransaction: (transaction) => 
        set(state => ({
          activeSession: {
            ...state.activeSession,
            transactions: [...state.activeSession.transactions, transaction]
          }
        })),
      
      removeTransaction: (index) =>
        set(state => ({
          activeSession: {
            ...state.activeSession,
            transactions: state.activeSession.transactions.filter((_, i) => i !== index)
          }
        })),
      
      updateTransaction: (index, updates) =>
        set(state => ({
          activeSession: {
            ...state.activeSession,
            transactions: state.activeSession.transactions.map((t, i) => 
              i === index ? { ...t, ...updates } : t
            )
          }
        })),
      
      setParticipants: (participants) =>
        set(state => ({
          activeSession: {
            ...state.activeSession,
            participants
          }
        }))
    }),
    {
      name: 'expense-split-storage',
      // Will use IndexedDB automatically for large state
    }
  )
);
```

**Migration Notes:**
- Zustand provides similar global state to vanilla JS modules
- Built-in persistence replaces manual IndexedDB operations
- TypeScript adds type safety
- Immutable updates replace direct mutations
- Can still use IndexedDB directly if needed for advanced caching

---

#### Component Structure

**Legacy Vanilla JS:**
```javascript
// ui.js
export function refreshTransactionsTableUI() {
    const transactions = state.getActiveTransactions();
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    
    transactions.forEach((transaction, index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = transaction.date;
        // ...
    });
}
```

**Next.js React Equivalent:**
```typescript
// components/TransactionsTable.tsx
import { useAppStore } from '@/store/useAppStore';

export function TransactionsTable() {
  const transactions = useAppStore(state => state.activeSession.transactions);
  const participants = useAppStore(state => state.activeSession.participants);
  
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Assigned To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <TransactionRow 
              key={transaction.id}
              transaction={transaction}
              index={index}
              participants={participants}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  index: number;
  participants: string[];
}

function TransactionRow({ transaction, index, participants }: TransactionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateTransaction = useAppStore(state => state.updateTransaction);
  const removeTransaction = useAppStore(state => state.removeTransaction);
  
  const handleAmountEdit = (newAmount: number) => {
    updateTransaction(index, { amount: newAmount });
    setIsEditing(false);
  };
  
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{transaction.date}</td>
      <td>{transaction.description}</td>
      <td>
        <AmountCell 
          transaction={transaction}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleAmountEdit}
        />
      </td>
      <td>
        <ParticipantCheckboxes 
          transaction={transaction}
          participants={participants}
          onUpdate={(assignedTo) => updateTransaction(index, { assigned_to: assignedTo })}
        />
      </td>
      <td>
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => {
            if (confirm(`Delete transaction: ${transaction.date} - ${transaction.description}?`)) {
              removeTransaction(index);
            }
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
```

**Migration Notes:**
- DOM manipulation replaced with declarative React components
- Event listeners replaced with React event handlers
- Component composition for better reusability
- Props for data flow instead of direct state access
- Hooks for local component state (e.g., `isEditing`)

---

### Authentication Migration

**Legacy Flask Decorator:**
```python
# auth_decorator.py
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        token = auth_header.split('Bearer ')[1] if auth_header else None
        
        if not token:
            return jsonify({"error": "Authorization token required"}), 401
        
        try:
            decoded_token = auth.verify_id_token(token)
            g.user_id = decoded_token['uid']
            g.user_email = decoded_token.get('email')
        except Exception as e:
            return jsonify({"error": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    return decorated_function
```

**Next.js Middleware:**
```typescript
// lib/auth.ts
import { auth } from 'firebase-admin/auth';
import { NextRequest } from 'next/server';

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decodedToken = await auth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
```

**Migration Notes:**
- Same Firebase Admin SDK functionality
- Replace Flask's `g` object with return values
- Use in each API route instead of decorator
- Can create custom middleware for route protection

---

### IndexedDB Migration

**Legacy Vanilla JS:**
```javascript
// state.js
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

export async function saveStateToDB() {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(appState, DATA_KEY);
}
```

**Next.js React Hook:**
```typescript
// hooks/useIndexedDB.ts
import { useEffect, useState } from 'react';

export function useIndexedDB<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initDB = async () => {
      const db = await openDB('ExpenseSplitDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('userDataStore')) {
            db.createObjectStore('userDataStore');
          }
        },
      });
      
      const storedValue = await db.get('userDataStore', key);
      if (storedValue !== undefined) {
        setValue(storedValue);
      }
      setIsLoading(false);
    };
    
    initDB();
  }, [key]);
  
  const updateValue = async (newValue: T) => {
    setValue(newValue);
    const db = await openDB('ExpenseSplitDB', 1);
    await db.put('userDataStore', newValue, key);
  };
  
  return [value, updateValue, isLoading] as const;
}
```

**Migration Notes:**
- Use `idb` library for promise-based IndexedDB
- React hooks for reactive updates
- Zustand persist middleware can handle most caching needs
- Keep direct IndexedDB for advanced caching scenarios

---

## 📊 Feature-by-Feature Migration Checklist

### ✅ Authentication & User Management
- [ ] Google Sign-In with Firebase Auth
- [ ] Token-based API authentication
- [ ] User context management
- [ ] Sign out functionality
- [ ] Auth state persistence

### ✅ Participant Management
- [ ] Add participant
- [ ] Delete participant
- [ ] Mark as frequent
- [ ] Autocomplete suggestions
- [ ] Per-user participant storage
- [ ] Real-time UI updates

### ✅ Transaction Management
- [ ] Bulk transaction paste & parse
- [ ] Individual transaction add
- [ ] Transaction deletion
- [ ] Amount in-place editing
- [ ] Currency toggle per transaction
- [ ] Transaction filtering/search
- [ ] Auto-assignment based on history
- [ ] Participant checkbox assignment

### ✅ Currency Support
- [ ] Primary/secondary currency selection
- [ ] Per-transaction currency display
- [ ] Multiple currency calculations
- [ ] Currency formatting

### ✅ Session Management
- [ ] Save current state as session
- [ ] Load saved session
- [ ] Overwrite existing session
- [ ] Delete session
- [ ] Session list display
- [ ] Session metadata (date, transaction count)
- [ ] New session (reset active state)

### ✅ Expense Calculations
- [ ] Equal split calculation
- [ ] Multi-currency totals
- [ ] Real-time summary updates
- [ ] Grand total calculation
- [ ] Participant-specific totals

### ✅ PDF Export
- [ ] Client-side PDF generation
- [ ] Session report format
- [ ] Transaction table in PDF
- [ ] Summary table in PDF
- [ ] Proper formatting and styling

### ✅ UI/UX Features
- [ ] Dark/light theme toggle
- [ ] Theme persistence
- [ ] Anti-FOUC implementation
- [ ] Responsive design
- [ ] Loading states
- [ ] Error messages
- [ ] Confirmation dialogs
- [ ] Smooth animations

### ✅ Data Synchronization
- [ ] IndexedDB caching
- [ ] Timestamp-based sync
- [ ] Optimistic UI updates
- [ ] Background sync
- [ ] Conflict resolution

### ✅ Performance
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Image optimization
- [ ] Bundle optimization

---

## 🔑 Critical Migration Considerations

### 1. State Management Strategy
**Decision Point:** Choose between:
- **Zustand**: Lightweight, similar to current vanilla JS approach
- **Redux Toolkit**: More structured, better for complex apps
- **React Context**: Built-in, good for simpler state
- **Jotai/Recoil**: Atomic state management

**Recommendation**: Start with Zustand + persist middleware for IndexedDB caching. Most similar to current architecture.

### 2. API Strategy
**Options:**
- **Next.js API Routes**: Simplest migration path
- **tRPC**: Type-safe APIs with better DX
- **GraphQL**: If planning to expand API significantly

**Recommendation**: Next.js API Routes for direct 1:1 Flask migration.

### 3. Styling Approach
**Options:**
- **Migrate existing CSS**: Low risk, keeps current design
- **Tailwind CSS**: Modern utility-first approach
- **CSS Modules**: Scoped styles, good middle ground
- **Styled Components**: CSS-in-JS

**Recommendation**: CSS Modules for initial migration, consider Tailwind for new features.

### 4. Form Handling
**Options:**
- **React Hook Form**: Performant, less re-renders
- **Formik**: Popular, more features
- **Native React**: Simple forms

**Recommendation**: React Hook Form for transaction input and participant forms.

### 5. Data Fetching
**Options:**
- **SWR**: Stale-while-revalidate, good for real-time
- **React Query**: More features, complex caching
- **Native fetch**: Simple, no dependencies

**Recommendation**: SWR for automatic background sync and caching.

---

## 🚀 Quick Start Next.js Template

```bash
# Create Next.js project
npx create-next-app@latest expenses-calculator-nextjs --typescript --tailwind --app

# Install dependencies
cd expenses-calculator-nextjs
npm install firebase firebase-admin zustand idb jspdf jspdf-autotable date-fns

# Install dev dependencies
npm install -D @types/node @types/react @types/react-dom

# Create directory structure
mkdir -p app/api/{user,participants,sessions}
mkdir -p components/{ui,features}
mkdir -p lib/{firebase,auth,utils}
mkdir -p hooks
mkdir -p store
mkdir -p types
```

**Repository Structure:**
```
expenses-calculator-nextjs/
├── app/
│   ├── api/
│   │   ├── user/
│   │   │   └── me/
│   │   │       └── route.ts
│   │   ├── participants/
│   │   │   └── route.ts
│   │   └── sessions/
│   │       ├── route.ts
│   │       └── [sessionId]/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   └── features/
│       ├── TransactionsTable.tsx
│       ├── ParticipantsList.tsx
│       ├── SessionsList.tsx
│       ├── SummaryTable.tsx
│       └── AuthSection.tsx
├── lib/
│   ├── firebase/
│   │   ├── clientApp.ts
│   │   └── adminApp.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useIndexedDB.ts
│   └── useTransactions.ts
├── store/
│   └── useAppStore.ts
├── types/
│   └── index.ts
└── public/
```

---



## 🏗️ Architecture Overview

### Backend Architecture

The backend follows a **modular Flask blueprint pattern** with clear separation of concerns:

```
Flask Application (app.py)
├── Firebase Admin SDK Integration
├── Authentication Decorator (@login_required)
├── Blueprint Registration
│   ├── auth_bp (Firebase authentication)
│   ├── participants_bp (Participant CRUD)
│   └── sessions_bp (Session & transaction management)
└── Error Handlers (404, 500, 401, 400)
```

#### Core Backend Components

##### 1. **Main Application** ([app.py](file:///c:/00%20Development/expenses-calculator-py/app.py))
- **Firebase Initialization**: Initializes Firebase Admin SDK using service account credentials
- **Authentication Middleware**: Custom `@login_required` decorator that verifies Firebase ID tokens
- **Blueprint Registration**: Modular route organization
- **Comprehensive Logging**: File and console logging with detailed contextual information
- **Environment Variable Configuration**: Flexible deployment via environment variables

##### 2. **Authentication Module** ([auth.py](file:///c:/00%20Development/expenses-calculator-py/auth.py))
- Provides `/api/user/me` endpoint for retrieving authenticated user information
- Relies entirely on Firebase client-side SDK for Google Sign-In
- Server validates Firebase ID tokens passed via `Authorization: Bearer <token>` headers

##### 3. **Authentication Decorator** ([auth_decorator.py](file:///c:/00%20Development/expenses-calculator-py/auth_decorator.py))
- **Token Verification**: Validates Firebase ID tokens on every protected request
- **User Context**: Populates Flask's `g` object with `user_id` and `user_email`
- **Error Handling**: Differentiated responses for expired, invalid, and missing tokens
- **Security**: All protected endpoints require valid authentication

##### 4. **Participants Module** ([participants.py](file:///c:/00%20Development/expenses-calculator-py/participants.py))
- **CRUD Operations**: GET, POST, DELETE for participant management
- **Per-User Storage**: Participants stored in Firestore under `users/{userId}/participants`
- **Validation**: Name sanitization using Werkzeug's escape utility
- **Duplicate Prevention**: Server-side checks to prevent duplicate participants
- **Metadata Updates**: Triggers timestamp updates on user metadata for sync

##### 5. **Sessions Module** ([sessions.py](file:///c:/00%20Development/expenses-calculator-py/sessions.py))
- **Session Management**: Create, read, update, delete saved expense sessions
- **Transaction Storage**: Full transaction data with assignments and metadata
- **Data Synchronization**: Timestamp-based sync for efficient client-side caching
- **User Data Endpoint**: `/api/user/data` fetches all user data with timestamp comparison
- **Frequent Participants**: Manages user's frequently used participant list

##### 6. **Migration Script** ([migrate_user_data.py](file:///c:/00%20Development/expenses-calculator-py/migrate_user_data.py))
- One-time data migration tool from SQLite database to Firestore
- Preserves transaction history, participants, and session data
- 8,349 bytes of migration logic for database transition

---

### Frontend Architecture

The frontend uses a **modular ES6 module pattern** with clear separation of concerns:

```
Frontend Application
├── State Management (state.js - IndexedDB)
├── API Communication (api.js)
├── UI Rendering (ui.js)
├── Event Handlers (handlers.js)
├── Transaction Logic (transactions.js)
├── Currency Management (currency.js)
├── Theme System (theme.js)
├── PDF Export (export.js)
└── Main Orchestrator (main.js)
```

#### Core Frontend Modules

##### 1. **State Management** ([state.js](file:///c:/00%20Development/expenses-calculator-py/static/js/state.js) - 480 lines)
- **IndexedDB Integration**: Local persistent storage using `ExpenseSplitDB`
- **In-Memory State**: Fast access to current application state
- **Sync Management**: Timestamp-based synchronization with Firestore
- **State Operations**:
  - Load/save state to IndexedDB
  - Manage active session (transactions, participants, currencies)
  - Track frequent participants
  - Handle authentication state
  - Manage saved sessions list

##### 2. **API Communication** ([api.js](file:///c:/00%20Development/expenses-calculator-py/static/js/api.js) - 7,499 bytes)
- **Authenticated Requests**: Automatic Firebase ID token injection
- **Token Refresh**: Handles token expiration and refresh
- **Error Handling**: Comprehensive error responses with user-friendly messages
- **Endpoints**:
  - User data sync
  - Participant CRUD
  - Session CRUD
  - Frequent participants management

##### 3. **UI Rendering** ([ui.js](file:///c:/00%20Development/expenses-calculator-py/static/js/ui.js) - 27,256 bytes)
- **Dynamic DOM Manipulation**: Renders all UI components
- **Transaction Table**: Complex table with inline editing, currency toggle, assignments
- **Session Management UI**: Saved sessions list with action buttons
- **Participant Management**: Dynamic participant grid with delete functionality
- **Summary Calculations**: Real-time expense summary display
- **Loading States**: Spinner and status messages
- **Authentication UI**: Login/logout state management

##### 4. **Event Handlers** ([handlers.js](file:///c:/00%20Development/expenses-calculator-py/static/js/handlers.js) - 22,157 bytes)
- **Transaction Operations**:
  - Add transactions with auto-parsing
  - Delete individual/all transactions
  - Edit transaction amounts in-place
  - Toggle currency display
  - Assign/unassign participants
  - Filter/search transactions
- **Participant Operations**:
  - Add/delete participants
  - Auto-complete suggestions
- **Session Operations**:
  - Save new sessions
  - Load saved sessions
  - Overwrite existing sessions
  - Delete sessions
  - Export to PDF
- **Currency Operations**: Primary/secondary currency selection
- **Summary Calculations**: Real-time expense distribution calculations

##### 5. **Transaction Logic** ([transactions.js](file:///c:/00%20Development/expenses-calculator-py/static/js/transactions.js) - 1,878 bytes)
- **Text Parsing**: Converts `DD/MM/YYYY: Description - Amount` format to structured data
- **Data Validation**: Ensures transaction data integrity
- **Utility Functions**: Transaction manipulation helpers

##### 6. **Currency Management** ([currency.js](file:///c:/00%20Development/expenses-calculator-py/static/js/currency.js) - 2,031 bytes)
- **Currency Initialization**: Populates currency dropdowns
- **Supported Currencies**: PEN, USD, EUR, GBP, and more
- **Currency Conversion**: Display amounts in primary or secondary currency
- **Format Utilities**: Proper currency symbol and decimal formatting

##### 7. **Theme System** ([theme.js](file:///c:/00%20Development/expenses-calculator-py/static/js/theme.js) - 4,850 bytes)
- **Light/Dark Mode**: Toggle between themes
- **Persistent Preference**: Saves theme choice to localStorage
- **System Preference Detection**: Respects OS dark mode preference
- **Anti-FOUC**: Prevents flash of unstyled content on page load
- **Smooth Transitions**: CSS-based theme transitions

##### 8. **PDF Export** ([export.js](file:///c:/00%20Development/expenses-calculator-py/static/js/export.js) - 10,655 bytes)
- **Client-Side Generation**: Uses jsPDF and jspdf-autotable
- **Session Reports**: Generates detailed PDF for saved sessions
- **Content Includes**:
  - Session name and export timestamp
  - Complete transaction list with assignments
  - Expense summary per participant
  - Currency information
- **Professional Formatting**: Clean, printable layout

##### 9. **Main Orchestrator** ([main.js](file:///c:/00%20Development/expenses-calculator-py/static/js/main.js) - 155 lines)
- **Initialization**: Sets up all event listeners on DOMContentLoaded
- **Firebase Auth Listener**: Drives the entire authentication flow
- **State Synchronization**: Fetches server data on login
- **UI Updates**: Renders appropriate UI based on auth state
- **Error Handling**: Global error and unhandled rejection handlers

##### 10. **Logger Utility** ([logger.js](file:///c:/00%20Development/expenses-calculator-py/static/js/logger.js) - 728 bytes)
- **Structured Logging**: Consistent log format with module/context
- **Log Levels**: log, warn, error functions
- **Production Ready**: Easy to disable in production

---

### Styling Architecture

The CSS follows a **modular component-based structure**:

```
styles.css (Main Import File)
├── _variables.css (Design tokens, colors, fonts)
├── _base.css (HTML reset, body styles)
├── _buttons.css (Button styles and states)
├── _forms.css (Input, textarea, select styles)
├── _tables.css (Transaction and session tables)
├── _header.css (Header, nav, branding)
├── _footer.css (Footer layout and styles)
├── _sections.css (Content section containers)
├── _participants.css (Participant grid and cards)
├── _transactions.css (Transaction-specific UI)
├── _sessions.css (Session management UI)
├── _summary.css (Expense summary table)
├── _firebase_auth.css (Google Sign-In styling)
├── _auth.css (General auth styles)
├── _utilities.css (Helper classes)
└── _responsive.css (Mobile/tablet breakpoints)
```

**Design Features:**
- **CSS Variables**: Extensive use of custom properties for theming
- **Dark Mode**: Full dark theme support throughout
- **Responsive Design**: Mobile-first approach with breakpoints
- **Modern UI**: Glassmorphism, shadows, smooth transitions
- **Accessibility**: Proper focus states, ARIA labels
- **Professional Typography**: Roboto and Roboto Mono fonts

---

## ✨ Feature Inventory

### 1. Authentication & Security

#### Google Sign-In (Firebase Authentication)
- **OAuth 2.0**: Secure Google account authentication
- **Client-Side SDK**: Firebase JavaScript SDK handles OAuth flow
- **Server-Side Validation**: Every API request validates Firebase ID tokens
- **Session Management**: Token-based authentication, no server sessions
- **User Context**: Automatic user identification via UID
- **Error Handling**: Graceful handling of expired/invalid tokens

**Security Features:**
- Service account key secured via environment variables
- All API endpoints protected with `@login_required` decorator
- HTTPS-ready (Firebase handles authentication security)
- CORS-compliant API design
- Input sanitization with Werkzeug utilities

---

### 2. Data Storage & Synchronization

#### Cloud Storage (Firebase Firestore)
**Data Model:**
```
users/
  {userId}/
    participants: [string array]
    frequentParticipants: [string array]
    metadata:
      lastUpdatedAt: timestamp
    sessions/
      {sessionId}/
        name: string
        savedAt: timestamp
        transactions: [array]
        participants: [array]
        currencies: object
```

**Key Features:**
- **Per-User Isolation**: All data scoped to authenticated user
- **Automatic Timestamps**: Server-side timestamp management
- **Atomic Updates**: Uses Firestore ArrayUnion/ArrayRemove
- **Scalability**: NoSQL cloud database, handles concurrent users

#### Client-Side Caching (IndexedDB)
**Database:** `ExpenseSplitDB`  
**Object Store:** `userDataStore`

**Cached Data:**
- Frequent participants
- Saved sessions list
- Active session (transactions, participants, currencies)
- Last sync timestamp

**Benefits:**
- **Performance**: Reduces Firestore reads by up to 90%
- **Offline Capability**: Can view cached data without connection
- **Instant UI**: No loading delays for cached content
- **Cost Reduction**: Minimizes billable Firestore operations

**Synchronization Logic:**
- Compares local timestamp with server metadata
- Only fetches if server data is newer
- Automatic sync on login
- Manual refresh available

---

### 3. Participant Management

#### Dynamic Participant System
- **Add Participants**: Text input with instant validation
- **Remove Participants**: One-click deletion with confirmation
- **Auto-Complete**: Datalist suggestions from frequent participants
- **Persistent Storage**: Saved to Firestore per user
- **Session-Specific**: Each session has its own participant list
- **Frequent Participants**: Marks commonly used participants for quick access

**UI Features:**
- Visual participant grid with cards
- Delete button on each participant card
- Real-time updates without page refresh
- Alphabetical sorting
- Duplicate prevention

---

### 4. Transaction Management

#### Transaction Input & Parsing
**Format:** `DD/MM/YYYY: Description - Amount`

**Example:**
```
15/06/2024: IZI*SERVICE - 97.00
23/06/2024: OPENAI *CHATGPT SUBSCR - 20.00
```

**Features:**
- **Bulk Entry**: Paste multiple transactions at once
- **Intelligent Parsing**: Extracts date, description, amount
- **Error Handling**: Validates format and shows errors
- **Auto-Assignment**: Suggests participants based on description history
- **Transaction IDs**: Unique ID generation for tracking

#### Transaction Analysis Table
**Columns:**
- **Index**: Transaction number
- **Date**: Formatted date display
- **Description**: Transaction description text
- **Amount**: Currency amount with toggle capability
- **Assigned To**: Multi-select checkboxes for participants
- **Actions**: Delete and edit buttons

**Interactive Features:**

##### In-Place Amount Editing
- **Hover Activation**: Pencil icon (✎) appears on hover
- **Click to Edit**: Opens inline input field
- **Auto-Save**: Saves on Enter or blur
- **Validation**: Ensures valid numeric input
- **IndexedDB Sync**: Immediately persists to local cache

##### Currency Toggle
- **Click Amount**: Switches between primary/secondary currency
- **Visual Feedback**: Smooth transition animation
- **Per-Transaction**: Each transaction remembers its display preference
- **Exchange Rate Aware**: Uses user-defined or default rates

##### Participant Assignment
- **Multi-Select**: Check/uncheck participants for each transaction
- **Smart Auto-Assignment**: Learns from historical descriptions
- **Unassign All**: Bulk unassignment button
- **Real-Time Summary**: Updates expense calculations instantly
- **Persistent**: Saves assignments to IndexedDB automatically

##### Search & Filter
- **Real-Time Filter**: Searches date, description, and amount
- **Case-Insensitive**: Flexible searching
- **Instant Results**: No refresh required
- **Clear Filter**: Easy reset

##### Bulk Operations
- **Delete All Transactions**: Clear entire transaction list with confirmation
- **Unassign All Participants**: Remove all assignments at once
- **Select Multiple**: Future enhancement capability

---

### 5. Multi-Currency Support

#### Supported Currencies
**Primary Currencies:**
- PEN (Peruvian Sol)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- And more...

#### Currency Features
- **Primary Currency**: Main display currency
- **Secondary Currency**: Alternative display for each transaction
- **Per-Transaction Toggle**: Click amount to switch display
- **Exchange Rates**: User-defined or system default
- **Currency Formatting**: Proper symbols and decimal places
- **Summary Display**: Shows totals in both currencies

**Use Cases:**
- International travelers tracking expenses in multiple currencies
- Shared expenses between countries
- Currency comparison and analysis

---

### 6. Session Management

#### Save & Load Sessions
**Functionality:**
- **Save Current State**: Stores all transactions, assignments, participants, and currencies
- **Custom Naming**: Optional session name (defaults to timestamp)
- **Session List**: View all saved sessions with metadata
- **Load Session**: Restore a saved session into active state
- **Overwrite Session**: Update existing saved session with current data
- **Delete Session**: Remove saved session from Firestore

**Session Metadata:**
- Session name
- Date/time saved
- Number of transactions
- Session ID

**Storage:**
- Saved to Firestore under `users/{userId}/sessions/{sessionId}`
- Includes complete transaction data with assignments
- Participant list snapshot
- Currency configuration

**Use Cases:**
- Multiple expense groups (e.g., "Family Vacation", "Office Lunch")
- Historical expense tracking
- Recurring expense patterns (e.g., monthly roommate expenses)
- Long-term projects with ongoing expenses

---

### 7. Expense Calculation & Summary

#### Real-Time Summary Table
**Columns:**
- **Participant Name**
- **Total (Primary Currency)**
- **Total (Secondary Currency)**

**Calculation Logic:**
- Sums all assigned transactions per participant
- Displays amount owed by each participant
- Updates instantly on any transaction/assignment change
- Uses cached data for performance

**Visual Feedback:**
- Clean tabular display
- Currency symbols and formatting
- Sorted alphabetically by participant

**Accuracy:**
- Precise decimal calculations
- Handles currency conversion
- Validates against total transaction amounts

---

### 8. PDF Export

#### Client-Side PDF Generation
**Technology:** jsPDF + jspdf-autotable

**Export Features:**
- **Session-Based**: Exports specific saved session
- **Browser-Generated**: No server processing required
- **Professional Layout**: Clean, printable format

**PDF Content:**
1. **Header**
   - Session name
   - Export timestamp
   - Currency information

2. **Transaction Table**
   - All transactions with details
   - Participant assignments
   - Amounts in primary currency

3. **Expense Summary**
   - Total per participant
   - Both currency displays
   - Grand totals

**Use Cases:**
- Record keeping
- Expense reports
- Sharing with non-app users
- Printable receipts

---

### 9. User Interface Features

#### Theme System
- **Light/Dark Mode**: Complete dual theme support
- **Toggle Switch**: Animated slider in header
- **Persistent Preference**: Saved to localStorage
- **System Detection**: Respects OS preference
- **Anti-FOUC**: Inline script prevents flash
- **Smooth Transitions**: CSS animations on theme change

#### Navigation
- **Section Buttons**: Quick jump to Currency, Input, Participants, Analysis, Sessions, Summary
- **Scroll Behavior**: Smooth scrolling to sections
- **Active States**: Visual feedback on navigation
- **Mobile Menu**: Responsive navigation for small screens

#### Responsive Design
**Breakpoints:**
- **Desktop**: Full multi-column layout
- **Tablet**: Adjusted grid layouts
- **Mobile**: Single-column stack, optimized touch targets

**Mobile Features:**
- Touch-friendly buttons (minimum 44px)
- Horizontal scrolling tables
- Collapsible sections
- Simplified navigation

#### Loading States
- **Spinner**: Visual loading indicator
- **Loading Messages**: Contextual status text (e.g., "Loading user data...")
- **Overlay**: Prevents interaction during loading
- **Error States**: Clear error messages with retry options

#### User Feedback
- **Success Messages**: Confirms actions (e.g., "Session saved")
- **Error Messages**: Explains what went wrong
- **Validation**: Real-time input validation
- **Confirmation Dialogs**: Prevents accidental deletions

---

### 10. Smart Features

#### Auto-Assignment Intelligence
**How It Works:**
1. User assigns participants to transaction descriptions
2. System learns patterns (e.g., "UBER" → ["Alice", "Bob"])
3. On new transaction with similar description, suggests previous assignments
4. User can accept, modify, or ignore suggestions

**Benefits:**
- **Time Saving**: Reduces manual assignment for recurring expenses
- **Consistency**: Ensures similar transactions assigned to same people
- **Learning**: Gets smarter with more usage

**Implementation:**
- Stored in local IndexedDB
- Description-based matching (fuzzy search)
- Per-user learning (not shared across users)

#### Frequent Participants
- **Tracking**: Identifies commonly used participants
- **Quick Access**: Auto-complete suggestions
- **Auto-Population**: Speeds up data entry
- **User-Specific**: Personalized to each user's patterns

---

## 📦 Dependencies

### Backend (Python)
**requirements.txt:**
```
blinker==1.8.2
Brotli==1.1.0
cachelib==0.13.0
cffi==1.17.1
click==8.1.7
colorama==0.4.6
firebase-admin
Flask (3.x+)
Werkzeug
python-dotenv
```

**Key Dependencies:**
- **Flask**: Web framework
- **firebase-admin**: Firebase Admin SDK for server-side operations
- **python-dotenv**: Environment variable management
- **Werkzeug**: Security utilities (escape, etc.)

### Frontend (JavaScript)
**CDN Libraries:**
- **Firebase SDK 10.12.2**: Authentication and client SDK
- **jsPDF 2.5.1**: PDF generation
- **jspdf-autotable 3.5.23**: Table formatting in PDFs
- **Font Awesome 6.0.0**: Icons
- **Google Fonts**: Roboto, Roboto Mono

**Browser APIs:**
- **IndexedDB**: Client-side persistent storage
- **Fetch API**: HTTP requests
- **ES6 Modules**: Modern JavaScript module system
- **localStorage**: Theme preference storage

---

## 🔧 Configuration & Setup

### Environment Variables
**Required:**
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to Firebase service account JSON file

**Optional:**
- `SECRET_KEY`: Flask secret key (defaults to random)
- `FLASK_RUN_HOST`: Server host (default: 127.0.0.1)
- `FLASK_RUN_PORT`: Server port (default: 5000)
- `FLASK_DEBUG`: Debug mode (default: False)

### Firebase Configuration
**Backend:** Service account JSON file  
**Frontend:** Firebase config object in [index.html](file:///c:/00%20Development/expenses-calculator-py/templates/index.html#L280-L286)

**Current Firebase Project:**
- Project ID: `expense-split-pro-46307`
- Auth Domain: `expense-split-pro-46307.firebaseapp.com`

### Setup Process
1. **Clone Repository**
2. **Create Virtual Environment**: `python -m venv .venv`
3. **Activate Environment**: `.venv\Scripts\Activate.ps1` (Windows)
4. **Install Dependencies**: `pip install -r requirements.txt`
5. **Configure Firebase**: Place service account key, set environment variable
6. **Update Frontend Config**: Paste Firebase config in `index.html`
7. **Run Application**: `python app.py`

---

## 📁 Project Structure

```
expenses-calculator-py/
├── .git/                           # Git repository
├── .venv/                          # Python virtual environment
├── static/
│   ├── css/                        # Modular stylesheets (17 files)
│   │   ├── _variables.css          # Design tokens
│   │   ├── _base.css               # HTML reset
│   │   ├── _buttons.css            # Button styles
│   │   ├── _forms.css              # Form inputs
│   │   ├── _tables.css             # Table layouts
│   │   ├── _header.css             # Header/nav
│   │   ├── _footer.css             # Footer
│   │   ├── _sections.css           # Content sections
│   │   ├── _participants.css       # Participant UI
│   │   ├── _transactions.css       # Transaction UI
│   │   ├── _sessions.css           # Session UI
│   │   ├── _summary.css            # Summary table
│   │   ├── _firebase_auth.css      # Google Sign-In
│   │   ├── _auth.css               # Auth general
│   │   ├── _utilities.css          # Helper classes
│   │   ├── _responsive.css         # Media queries
│   │   └── styles.css              # Main import file
│   └── js/                         # JavaScript modules (10 files)
│       ├── main.js                 # App initialization
│       ├── state.js                # State & IndexedDB
│       ├── api.js                  # Backend API calls
│       ├── ui.js                   # DOM manipulation
│       ├── handlers.js             # Event handlers
│       ├── transactions.js         # Transaction utilities
│       ├── currency.js             # Currency logic
│       ├── theme.js                # Theme switching
│       ├── export.js               # PDF generation
│       └── logger.js               # Logging utility
├── templates/
│   └── index.html                  # Main application template
├── app.py                          # Flask main application
├── auth.py                         # Authentication blueprint
├── auth_decorator.py               # Login decorator
├── participants.py                 # Participants blueprint
├── sessions.py                     # Sessions blueprint
├── migrate_user_data.py            # Database migration script
├── requirements.txt                # Python dependencies
├── serviceAccountKey.json          # Firebase credentials (gitignored)
├── .gitignore                      # Git ignore rules
├── LICENSE                         # MIT License
├── readme.md                       # Main documentation
├── SETUP_GUIDE.md                  # Setup instructions
└── dependecy-installation-guide.md # Dependency guide
```

---

## 🎯 Use Cases

### Individual Use
- Track personal expenses across multiple categories
- Manage different expense groups (work, personal, travel)
- Historical expense analysis

### Shared Households
- Roommate expense splitting
- Family budget tracking
- Household bill management

### Travel Groups
- Trip expense sharing among friends
- Multi-currency international travel expenses
- Fair cost distribution

### Small Businesses
- Team lunch expenses
- Project-based cost tracking
- Expense reimbursement tracking

### Events
- Party/celebration cost sharing
- Group gift purchases
- Event budget management

---

## 🔐 Security Features

1. **Firebase Authentication**: Industry-standard OAuth 2.0 via Google
2. **Token Validation**: Every API request validates Firebase ID tokens
3. **User Isolation**: Firestore security rules ensure users access only their data
4. **Input Sanitization**: Werkzeug escape prevents XSS attacks
5. **Environment Variables**: Secrets stored outside codebase
6. **HTTPS Ready**: Compatible with secure deployment
7. **No Server Sessions**: Stateless authentication reduces attack surface
8. **Service Account Security**: Backend credentials never exposed to client

---

## 🚀 Performance Optimizations

### Client-Side Caching
- **IndexedDB**: Reduces Firestore reads by ~90%
- **Timestamp Sync**: Only fetches when data changes
- **Instant UI**: No loading delay for cached content

### Code Organization
- **Modular CSS**: Reduced stylesheet size, better caching
- **ES6 Modules**: Tree-shaking compatible, lazy loading ready
- **Minimal Dependencies**: Only essential libraries loaded

### Database Efficiency
- **Targeted Queries**: Fetches only necessary fields
- **Atomic Operations**: Uses ArrayUnion/ArrayRemove for efficiency
- **Indexed Data**: Firestore automatic indexing

### Frontend Performance
- **Anti-FOUC**: Inline theme script prevents flash
- **Debounced Search**: Reduces DOM updates during filtering
- **Event Delegation**: Efficient event handling for dynamic content

---

## 📊 Database Schema

### Firestore Structure

```javascript
users (collection)
  └── {userId} (document)
      ├── participants: string[]
      │   Example: ["Alice", "Bob", "Charlie"]
      │
      ├── frequentParticipants: string[]
      │   Example: ["Alice", "Bob"]
      │
      ├── metadata: {
      │     lastUpdatedAt: timestamp
      │   }
      │
      └── sessions (subcollection)
          └── {sessionId} (document)
              ├── name: string
              │   Example: "Family Vacation July 2024"
              │
              ├── savedAt: timestamp
              │
              ├── transactions: [
              │     {
              │       id: string,
              │       date: string,           // "DD/MM/YYYY"
              │       description: string,
              │       amount: number,
              │       assignedTo: string[],
              │       currency: string,       // "PEN", "USD", etc.
              │       displayCurrency: string // Current display preference
              │     }
              │   ]
              │
              ├── participants: string[]
              │   Example: ["Alice", "Bob"]
              │
              └── currencies: {
                    main: string,     // "PEN"
                    secondary: string // "USD"
                  }
```

### IndexedDB Structure

```javascript
Database: ExpenseSplitDB
└── Object Store: userDataStore
    └── Key: "currentUserData"
        Value: {
          isAuthenticated: boolean,
          userId: string,
          frequentParticipants: string[],
          sessions: [
            {
              id: string,
              name: string,
              savedAt: timestamp,
              transactions: [...],
              participants: [...],
              currencies: {...}
            }
          ],
          activeSession: {
            name: string,
            transactions: [...],
            participants: [...],
            currencies: {...}
          },
          lastSyncedTimestamp: number
        }
```

---

## 🐛 Known Limitations

1. **Single Currency Per Transaction**: Cannot split a transaction across multiple currencies
2. **No Exchange Rate API**: Users must manually define exchange rates
3. **Client-Only PDF**: PDF generation limited by browser capabilities
4. **No Multi-Device Sync Conflicts**: Last-write-wins, no conflict resolution
5. **Google-Only Auth**: No other sign-in providers configured
6. **No Offline Writes**: Cannot create new data without internet connection

---

## 🔄 Migration History

**From:** SQLite database (`expense_sharing.db`)  
**To:** Firebase Firestore

**Migration Script:** [migrate_user_data.py](file:///c:/00%20Development/expenses-calculator-py/migrate_user_data.py)

**Migrated Data:**
- User participants
- Saved sessions
- Transaction history
- Participant assignments

**Post-Migration:** Legacy database files can be safely deleted

---

## 📈 Future Enhancement Opportunities

### Immediate Improvements
1. **Unequal Split Support**: Assign custom percentages/amounts to participants
2. **Expense Categories**: Tag transactions (food, transport, accommodation)
3. **Currency API Integration**: Real-time exchange rates from external API
4. **Export Formats**: CSV, Excel exports in addition to PDF
5. **Recurring Transactions**: Template support for regular expenses

### Advanced Features
1. **Multi-User Sessions**: Collaborative expense tracking in real-time
2. **Payment Tracking**: Mark who paid whom, settlement suggestions
3. **Budget Limits**: Set spending limits per category/participant
4. **Analytics Dashboard**: Charts and graphs for expense insights
5. **Email Notifications**: Session sharing and payment reminders
6. **Mobile Apps**: Native iOS/Android applications
7. **Offline Mode**: Full offline capability with sync on reconnection

### Technical Enhancements
1. **Unit Tests**: Backend endpoint testing
2. **E2E Tests**: Automated browser testing
3. **TypeScript Migration**: Type safety for JavaScript code
4. **Bundle Optimization**: Webpack/Vite build process
5. **CDN Assets**: Self-hosted libraries instead of CDN
6. **Docker Container**: Containerized deployment
7. **CI/CD Pipeline**: Automated testing and deployment

---

## 📞 Support & Contact

**Developer:** JF8989  
**Email:** juanfrajf.contacto@gmail.com  
**LinkedIn:** [linkedin.com/in/jfmarcenaroa/](https://www.linkedin.com/in/jfmarcenaroa/)  
**GitHub:** [github.com/jf8989](https://github.com/jf8989?tab=repositories)

---

## 📄 License

**MIT License**  
Copyright © 2025 JF8989  
All rights reserved. See [LICENSE](file:///c:/00%20Development/expenses-calculator-py/LICENSE) file for details.

---

## 📱 Detailed UI Interaction Flows & Calculation Mechanics

This section provides granular detail on exactly what users see, when calculations occur, and how data flows through the application.

### Application Initialization Flow

#### 1. Page Load Sequence
**What Happens:**
1. **HTML Loads**: Browser parses HTML document
2. **Anti-FOUC Script Executes** (inline in `<head>`):
   - Checks `localStorage.getItem('theme')`
   - If no saved theme, checks OS preference via `window.matchMedia('(prefers-color-scheme: dark')`
   - Sets `data-theme-preload` attribute on `<html>` element
3. **CSS Loads**: Stylesheets applied with theme variables
4. **Body Theme Script** (inline after `<body>` tag):
   - Reads `data-theme-preload` from `<html>`
   - Applies `data-theme` to `<body>` element
   - Removes temporary attribute
5. **Firebase SDK Loads**: Modules imported from CDN
6. **App JavaScript Loads**: ES6 modules initialize

**User Sees:**
- Themed page immediately (no flash)
- Loading spinner if authentication is in progress
- Either login screen or app content based on auth state

#### 2. Firebase Authentication Listener
**Location:** `main.js` - `firebase.onAuthStateChanged()` callback

**When User is Signed Out:**
1. **UI Changes**:
   - `#auth-section` display set to `"block"`
   - `#app-content` display set to `"none"`
   - `#user-status` display set to `"none"`
   - `#auth-error` cleared and hidden

2. **State Updates**:
   - `state.setAuthState(false, null)` called
   - IndexedDB cleared via `clearDBState()`
   - In-memory state reset to defaults

**User Sees:**
- Welcome message with Google Sign-In button
- No app content visible
- Clean slate, no previous user data

**When User is Signed In:**
1. **Loading Indicator Appears**:
   - `#loading-indicator` display set to `"flex"`
   - Loading message: "Loading user data..."

2. **Authentication State Updated**:
   - `state.setAuthState(true, user.uid)` called
   - User ID stored in IndexedDB
   - `isAuthenticated` flag set to `true`

3. **Data Synchronization Check**:
   ```javascript
   const lastKnownTs = state.getLastSyncedTimestamp();
   const serverData = await api.fetchUserData(lastKnownTs);
   ```
   - **API Request**: `GET /api/user/data?lastSyncedTimestamp={timestamp}`
   - **Backend Logic**: Compares timestamp with Firestore `users/{userId}/metadata/lastUpdatedAt`
   - **If Server Has Newer Data**: Returns full user data
   - **If Local is Current**: Returns `syncNeeded: false`

4. **State Population**:
   - If sync needed: `state.updateStateFromServer(serverData)` called
   - Updates frequent participants
   - Updates saved sessions list
   - Saves to IndexedDB
   - If no sync needed: Uses cached IndexedDB data

5. **UI Rendering**:
   - `ui.showLoggedInState(user.email)` called:
     - `#user-email-display` text set to user's email
     - `#user-status` display set to `"flex"`
     - `#auth-section` display set to `"none"`
     - `#app-content` display set to `"block"`
   
  - `ui.renderInitialUI()` called:
     - Participants list populated
     - Transactions table rendered (if active session has data)
     - Saved sessions table populated
   
   - `handlers.calculateAndUpdateSummary()` called:
     - Summary table calculated and displayed

6. **Loading Indicator Hidden**:
   - `#loading-indicator` display set to `"none"`

**User Sees:**
- Their email in the header
- Sign Out button
- All sections of the app
- Their saved data (participants, sessions, transactions)
- Summary calculations
- Navigation buttons active

---

### Currency Management Flow

#### Changing Primary or Secondary Currency

**User Action:** Selects different currency from dropdown

**What Happens:**

1. **Event Fired**: `change` event on `#main-currency` or `#secondary-currency` select element

2. **Handler Called**: `currencyChangeHandler()` in `handlers.js`

3. **State Updated**:
   ```javascript
   state.setActiveCurrencies(mainCurrency, secondaryCurrency);
   ```
   - Updates `appState.activeSession.currencies` object
   - Calls `state.saveStateToDB()` to persist to IndexedDB

4. **UI Recalculation**:
   - `handlers.calculateAndUpdateSummary()` called
   - Transactions table not re-rendered (currency symbols updated on next toggle)
   - Summary table fully re-rendered with new currencies

**User Sees:**
- Dropdown value changes
- Summary table updates immediately with new currency headers
- All participant totals recalculated in new currencies
- Transaction table amounts remain in their current display currency until toggled

#### Currency Toggle on Individual Transaction

**User Action:** Clicks on amount text in transaction table (e.g., "PEN 50.00")

**What Happens:**

1. **Event Fired**: `click` event on `.amount-display` span

2. **Currency Switch Logic**:
   ```javascript
   const newCurrency = (currentDisplayCurrency === mainCurrency) 
     ? secondaryCurrency 
     : mainCurrency;
   ```

3. **Handler Called**: `handlers.toggleCurrencyHandler(transactionIndex, newCurrency)`

4. **State Updated**:
   ```javascript
   state.getActiveTransactions()[transactionIndex].currency = newCurrency;
   state.saveStateToDB();
   ```

5. **UI Optimistic Update**:
   - Amount text immediately updates: `amountSpan.textContent = "${newCurrency} ${amount.toFixed(2)}"`
   - No HTTP request needed (local state change only)

6. **Summary Recalculation**:
   - `handlers.calculateAndUpdateSummary()` called
   - Summary table re-rendered to reflect currency change

**User Sees:**
- Amount text instantly changes from "PEN 50.00" to "USD 50.00" (or vice versa)
- Visual feedback: cursor changes to pointer on hover
- Summary table updates to show adjusted totals
- No loading indicator (instant local operation)

**Important Note**: The actual numeric value doesn't change, only the currency label. Exchange rate conversion is NOT applied automatically. This is a display preference toggle.

---

### Participant Management Flow

#### Adding a Participant

**User Action:** Types name in `#new-participant` input, clicks "Add" button

**What Happens:**

1. **Event Fired**: `click` event on `#add-participant-btn`

2. **Handler Called**: `addParticipantHandler()` in `handlers.js`

3. **Validation**:
   - Checks if participant name is empty
   - If empty: Shows alert "Participant name cannot be empty", returns

4. **State Check**:
   ```javascript
   const participants = state.getActiveParticipants();
   if (participants.includes(participantName)) {
     alert("Participant already exists in the active session");
     return;
   }
   ```

5. **API Request** (if not duplicate):
   - **Endpoint**: `POST /api/participants`
   - **Headers**: `Authorization: Bearer {firebaseIdToken}`
   - **Body**: `{ name: "ParticipantName" }`

6. **Backend Processing**:
   - Validates Firebase ID token
   - Gets user document: `users/{userId}`
   - Checks for duplicates in Firestore
   - Uses `firestore.ArrayUnion()` to add to `participants` array
   - Updates `metadata.lastUpdatedAt` timestamp

7. **Response Handling**:
   - If **201 Created**: Success
   - If **400 Bad Request**: "Participant already exists" (server-side check)
   - If **401 Unauthorized**: Token expired, prompts re-authentication
   - If **500 Server Error**: Shows error message

8. **State Updated** (on success):
   ```javascript
   state.addActiveParticipant(participantName);
   state.saveStateToDB();
   ```

9. **UI Updated**:
   - `ui.updateParticipantsListUI()` called
   - New participant card added to grid
   - Star button (unfilled) appears
   - Delete button appears
   - Input field cleared
   - `ui.addParticipantToTransactionCheckboxes(participantName)` called
     - Checkbox for new participant added to ALL transaction rows

10. **Summary Recalculation**:
    - `handlers.calculateAndUpdateSummary()` called
    - New participant appears in summary with $0.00

**User Sees:**
1. Participant name appears in participants grid
2. Star (☆) and trash icon buttons appear
3. Input field clears
4. All transactions now have checkbox for new participant
5. Summary table shows new participant with zero amounts
6. Brief success feedback (depending on implementation)

#### Deleting a Participant

**User Action:** Clicks trash icon button on participant card

**What Happens:**

1. **Confirmation Dialog**: 
   ```javascript
   if (!confirm(`Remove participant "${participantName}"?`)) return;
   ```

2. **API Request** (if confirmed):
   - **Endpoint**: `DELETE /api/participants`
   - **Headers**: `Authorization: Bearer {firebaseIdToken}`
   - **Body**: `{ name: "ParticipantName" }`

3. **Backend Processing**:
   - Uses `firestore.ArrayRemove()` to remove from `participants` array
   - Updates metadata timestamp

4. **State Updated** (on success):
   ```javascript
   state.removeActiveParticipant(participantName);
   state.saveStateToDB();
   ```

5. **Participant Assignment Cleanup**:
   - Loops through all active transactions
   - Removes participant from `assigned_to` arrays
   - State automatically saved

6. **UI Updated**:
   - `ui.updateParticipantsListUI()` called → Participant card removed
   - `ui.removeParticipantFromTransactionCheckboxes(participantName)` called
     - Checkbox removed from ALL transaction rows
   - `ui.refreshTransactionsTableUI()` called → Table re-rendered
   - `handlers.calculateAndUpdateSummary()` called → Summary updated

**User Sees:**
- Participant card disappears from grid
- All transaction assignments updated (participant removed)
- Checkboxes for that participant removed from all rows
- Summary table no longer shows that participant
- Smooth transition without page refresh

#### Marking Participant as Frequent (Star Toggle)

**User Action:** Clicks star button (☆ or ★) on participant card

**What Happens:**

1. **Handler Called**: `handlers.toggleParticipantFrequentHandler(name)`

2. **State Toggle**:
   ```javascript
   state.toggleFrequentParticipant(name);
   ```
   - Adds to or removes from `frequentParticipants` array
   - Saves to IndexedDB

3. **API Sync** (optional background):
   - Can send to `/api/participants/frequent` endpoint
   - Updates Firestore `users/{userId}/frequentParticipants`

4. **UI Updated**:
   - `ui.updateParticipantsListUI()` called
   - Star icon changes: ☆ → ★ or ★ → ☆
   - Tooltip text updates
   - Autocomplete datalist updated with frequent participants

**User Sees:**
- Star icon instantly toggles between filled and unfilled
- Tooltip changes between "Mark as frequent" and "Unmark as frequent"
- Next time they add participant, this name appears in autocomplete suggestions

---

### Transaction Management Flow

#### Adding Transactions (Bulk Paste)

**User Action:** Pastes text in `#transactions-text` textarea, clicks "Add Transactions"

**Example Input:**
```
15/06/2024: IZI*SERVICE - 97.00
23/06/2024: OPENAI *CHATGPT SUBSCR - 20.00
25/06/2024: UBER TRIP - 15.50
```

**What Happens:**

1. **Event Fired**: `click` event on `#add-transactions-btn`

2. **Handler Called**: `addTransactionsHandler()` in `handlers.js`

3. **Text Retrieval**:
   ```javascript
   const text = document.getElementById("transactions-text").value.trim();
   ```

4. **Parsing** (`transactions.js`):
   ```javascript
   const parsed = parseTransactions(text);
   ```
   - Splits text by newlines
   - For each line:
     - Uses regex to match `DD/MM/YYYY: Description - Amount` format
     - Extracts date, description, amount
     - Creates transaction object:
       ```javascript
       {
         id: `txn_${Date.now()}_${index}`,
         date: "15/06/2024",
         description: "IZI*SERVICE",
         amount: 97.00,
         assigned_to: [],
         currency: mainCurrency,
         displayCurrency: mainCurrency
       }
       ```

5. **Auto-Assignment Logic** (Smart Feature):
   - Checks IndexedDB for transaction history
   - Searches for similar descriptions
   - If match found, copies previous `assigned_to` array
   - Example: If "UBER" was previously assigned to ["Alice"], auto-assigns new UBER transactions to Alice

6. **State Updated**:
   ```javascript
   state.addMultipleActiveTransactions(parsedTransactions);
   state.saveStateToDB();
   ```

7. **UI Updated**:
   - `ui.refreshTransactionsTableUI()` called
   - New rows added to transaction table
   - Each row includes:
     - Index number
     - Date
     - Description
     - Amount with edit and currency toggle
     - Checkboxes for all participants
     - Delete button
   - `ui.clearTransactionInput()` clears textarea
   - `handlers.calculateAndUpdateSummary()` called

**User Sees:**
1. Textarea clears
2. New transactions appear in table below
3. Auto-assigned transactions show checked participants
4. Summary table updates with new totals
5. Smooth scroll to transaction table (if implemented)

**Parse Error Handling:**
- If line doesn't match format: Skipped with console warning
- If amount is not a number: Transaction created with amount 0
- If date is invalid: Transaction created with original text as date

#### Manually Assigning Participants to Transaction

**User Action:** Checks/unchecks participant checkbox in transaction row

**What Happens:**

1. **Event Fired**: `change` event on participant checkbox

2. **Current Assignments Gathered**:
   ```javascript
   const currentAssignments = Array.from(
     checkboxContainer.querySelectorAll("input:checked")
   ).map(cb => cb.value);
   ```

3. **Handler Called**: `handlers.updateTransactionAssignmentHandler(transactionIndex, currentAssignments)`

4. **State Updated**:
   ```javascript
   state.getActiveTransactions()[transactionIndex].assigned_to = currentAssignments;
   state.saveStateToDB();
   ```

5. **Summary Recalculation**:
   - `handlers.calculateAndUpdateSummary()` called immediately
   - Summary table re-rendered with updated totals

**User Sees:**
- Checkbox instantly checks/unchecks
- Summary table updates within milliseconds
- Participant's total amount changes
- No loading indicator (instant local operation)

**Example Scenario:**
- Transaction: "Dinner - $60.00"
- Check "Alice", "Bob", "Charlie"
- Summary shows each person owes $20.00 ($60 / 3)

#### Editing Transaction Amount (In-Place)

**User Action:** Hovers over amount cell, clicks pencil (✎) button

**What Happens:**

1. **Visual Change** (on hover):
   - Edit button opacity changes from 0 to 1
   - Cursor changes to pointer

2. **Event Fired**: `click` event on `.edit-amount-btn`

3. **UI Switches to Edit Mode**:
   - `switchToEditInput()` function called
   - Amount span and edit button removed
   - Input field created:
     ```html
     <input type="number" value="97.00" step="0.01" class="form-control form-control-sm">
     ```
   - Input field auto-focused and text selected

**User Sees:**
- Amount text replaced with editable input field
- Current value pre-filled and selected
- Keyboard-ready (can immediately start typing)

**User Edits and Saves:**

4. **Save Trigger**: User presses Enter or clicks away (blur event)

5. **Validation**:
   ```javascript
   const newAmount = parseFloat(input.value);
   if (isNaN(newAmount)) {
     alert("Invalid amount entered");
     // Revert to original display
     return;
   }
   ```

6. **Handler Called** (if valid):
   ```javascript
   await handlers.handleTransactionAmountUpdate(transactionIndex, newAmount);
   ```

7. **State Updated**:
   ```javascript
   state.getActiveTransactions()[transactionIndex].amount = newAmount;
   state.saveStateToDB();
   ```

8. **UI Reverted to Display Mode**:
   - `renderAmountCellContent()` called
   - Input field removed
   - Amount span and edit button re-rendered with new value

9. **Summary Recalculation**:
   - `handlers.calculateAndUpdateSummary()` called
   - All affected participant totals updated

**User Sees:**
- Input field disappears
- New amount displayed as text with currency
- Edit button reappears on hover
- Summary table updates with new calculations
- All changes immediate, no page refresh

**If User Cancels:**
- Presses Escape key
- `finishEditing(false)` called
- Original amount restored
- No state change

#### Deleting a Transaction

**User Action:** Clicks "Delete" button on transaction row

**What Happens:**

1. **Confirmation Dialog**:
   ```javascript
   if (confirm(`Delete transaction: ${date} - ${description}?`))
   ```

2. **Handler Called** (if confirmed):
   ```javascript
   handlers.deleteTransactionHandler(transactionIndex);
   ```

3. **State Updated**:
   ```javascript
   state.removeActiveTransaction(transactionIndex);
   state.saveStateToDB();
   ```

4. **UI Updated**:
   - `ui.refreshTransactionsTableUI()` called
   - Entire table re-rendered without deleted transaction
   - Row numbers adjusted
   - `handlers.calculateAndUpdateSummary()` called

**User Sees:**
- Confirmation dialog
- Transaction row disappears
- Remaining rows renumbered (1, 2, 3... without gaps)
- Summary table updated to remove that transaction's contribution

#### Filtering/Searching Transactions

**User Action:** Types in search box `#transaction-search-input`

**What Happens:**

1. **Event Fired**: `input` event (fires on every keystroke)

2. **Handler Called**: `filterTransactionsHandler()`

3. **Search Term Retrieved**:
   ```javascript
   const searchInput = document.getElementById("transaction-search-input");
   const searchTerm = searchInput.value.toLowerCase();
   ```

4. **UI Filtering** (`ui.filterTransactionsUI(searchTerm)`):
   ```javascript
   tableRows.forEach(row => {
     const date = row.cells[1]?.textContent.toLowerCase() || '';
     const description = row.cells[2]?.textContent.toLowerCase() || '';
     const amount = row.cells[3]?.textContent.toLowerCase() || '';
     const transactionInfo = `${date} ${description} ${amount}`;
     row.style.display = transactionInfo.includes(searchTerm) ? "" : "none";
   });
   ```

5. **Row Renumbering**:
   - Visible rows renumbered sequentially
   - Hidden rows retain original index in dataset

**User Sees:**
- As they type each character, table filters in real-time
- Non-matching rows hidden instantly
- Matching rows remain visible
- Row numbers update to show 1, 2, 3... for visible rows only
- No loading delay (pure DOM manipulation)

**Search Capability:**
- Searches date, description, and amount
- Case-insensitive
- Partial match (e.g., "uber" matches "UBER TRIP")
- Matches across all three fields (can search by amount like "20.00")

---

### Expense Calculation & Summary Flow

#### When Calculations Occur

**Calculations Trigger On:**
1. User logs in (initial load)
2. Participant assigned/unassigned to transaction
3. Transaction added
4. Transaction deleted
5. Transaction amount edited
6. Currency changed
7. Session loaded

**What Is NOT Recalculated:**
- Page scroll or navigation
- Theme changes
- Filtering transactions (no impact on totals)

#### Calculation Mechanics (Step-by-Step)

**Entry Point:** `handlers.calculateAndUpdateSummary()`

**Step 1: Data Retrieval**
```javascript
const transactions = state.getActiveTransactions();  // Array of transaction objects
const participants = state.getActiveParticipants();  // Array of participant names
const currencies = state.getActiveCurrencies();      // {main: "PEN", secondary: "USD"}
```

**Step 2: Initialize Totals Object**
```javascript
const totals = {};
participants.forEach(p => {
  totals[p] = { 
    PEN: 0,  // Primary currency
    USD: 0   // Secondary currency
  };
});
```

**Example Initial State:**
```javascript
{
  "Alice": { PEN: 0, USD: 0 },
  "Bob":   { PEN: 0, USD: 0 },
  "Charlie": { PEN: 0, USD: 0 }
}
```

**Step 3: Process Each Transaction**

For each transaction:

**Transaction Example:**
```javascript
{
  description: "Dinner",
  amount: 60.00,
  currency: "PEN",
  assigned_to: ["Alice", "Bob", "Charlie"]
}
```

**Calculation:**
```javascript
const assignedCount = transaction.assigned_to.length;  // 3
const share = transaction.amount / assignedCount;      // 60.00 / 3 = 20.00
const transactionCurrency = transaction.currency;      // "PEN"

// For each assigned participant
transaction.assigned_to.forEach(participant => {
  if (transactionCurrency === mainCurrency) {
    totals[participant][mainCurrency] += share;  // Add 20.00 to PEN
  } else if (transactionCurrency === secondaryCurrency) {
    totals[participant][secondaryCurrency] += share;  // Add 20.00 to USD
  }
});
```

**After Processing Transaction:**
```javascript
{
  "Alice": { PEN: 20.00, USD: 0 },
  "Bob":   { PEN: 20.00, USD: 0 },
  "Charlie": { PEN: 20.00, USD: 0 }
}
```

**Step 4: Process Multiple Transactions**

**Transaction 2:**
```javascript
{
  description: "Coffee",
  amount: 10.00,
  currency: "USD",
  assigned_to: ["Alice", "Bob"]
}
```

**Calculation:** 10.00 / 2 = 5.00 per person in USD

**Updated Totals:**
```javascript
{
  "Alice": { PEN: 20.00, USD: 5.00 },
  "Bob":   { PEN: 20.00, USD: 5.00 },
  "Charlie": { PEN: 20.00, USD: 0 }
}
```

**Step 5: Handle Unassigned Transactions**
```javascript
if (assignedTo.length === 0) {
  // Skip calculation - no one assigned
  continue;
}
```

**Step 6: Calculate Grand Totals**
```javascript
let grandTotal = { PEN: 0, USD: 0 };

participants.forEach(participant => {
  grandTotal.PEN += totals[participant].PEN;
  grandTotal.USD += totals[participant].USD;
});
```

**Result:**
```javascript
{
  PEN: 60.00,  // Alice(20) + Bob(20) + Charlie(20)
  USD: 10.00   // Alice(5) + Bob(5)
}
```

**Step 7: Render Summary Table**

**HTML Generated:**
```html
<tbody>
  <tr>
    <td>Alice</td>
    <td>PEN 20.00</td>
    <td>USD 5.00</td>
  </tr>
  <tr>
    <td>Bob</td>
    <td>PEN 20.00</td>
    <td>USD 5.00</td>
  </tr>
  <tr>
    <td>Charlie</td>
    <td>PEN 20.00</td>
    <td>USD 0.00</td>
  </tr>
  <tr class="summary-total-row">
    <td>TOTAL</td>
    <td>PEN 60.00</td>
    <td>USD 10.00</td>
  </tr>
</tbody>
```

**User Sees:**

| Participant | Total (Primary) | Total (Secondary) |
|-------------|----------------|-------------------|
| Alice       | PEN 20.00      | USD 5.00         |
| Bob         | PEN 20.00      | USD 5.00         |
| Charlie     | PEN 20.00      | USD 0.00         |
| **TOTAL**   | **PEN 60.00**  | **USD 10.00**    |

#### Division Precision

**Rounding:** JavaScript `toFixed(2)` ensures 2 decimal places

**Division Example:**
- Transaction: $10.00 assigned to 3 people
- JavaScript: 10.00 / 3 = 3.3333333333333335
- Display: $3.33 (each person)
- Note: Total shows 3 × $3.33 = $9.99 (1 cent discrepancy due to rounding)

**No Automatic Correction:** The app displays calculated values, may have minor rounding discrepancies with odd divisions.

---

### Session Management Flow

#### Saving Current State as New Session

**User Action:** Types session name (optional), clicks "Save Current State"

**What Happens:**

1. **Event Fired**: `click` event on `#save-session-btn`

2. **Handler Called**: `saveSessionHandler()`

3. **Data Collection**:
   ```javascript
   const sessionName = document.getElementById("session-name").value.trim();
   const finalName = sessionName || `Session ${new Date().toLocaleString()}`;
   const transactions = state.getActiveTransactions();
   const participants = state.getActiveParticipants();
   const currencies = state.getActiveCurrencies();
   ```

4. **Payload Creation**:
   ```javascript
   const payload = {
     name: finalName,
     transactions: transactions,
     participants: participants,
     currencies: currencies
   };
   ```

5. **API Request**:
   - **Endpoint**: `POST /api/sessions`
   - **Headers**: `Authorization: Bearer {firebaseIdToken}`
   - **Body**: Payload object

6. **Backend Processing**:
   - Validates token
   - Creates new document in `users/{userId}/sessions/`
   - Document structure:
     ```javascript
     {
       name: "Family Vacation",
       savedAt: serverTimestamp(),
       transactions: [...],
       participants: [...],
       currencies: {...},
       lastUpdatedAt: serverTimestamp()
     }
     ```
   - Updates parent document's `metadata.lastUpdatedAt`

7. **Response Handling**:
   - If **201 Created**: Success, returns `{id: "sessionId"}`
   - If **400**: Validation error
   - If **401**: Re-authentication required
   - If **500**: Server error

8. **State & UI Update** (on success):
   - `refreshStateAndSessionsUI("save")` called
   - Fetches updated sessions list from backend
   - Updates local state
   - `ui.updateSessionsTableUI()` called
   - `ui.clearSessionNameInput()` clears the name field

**User Sees:**
- Brief loading/processing indicator
- New session appears in "Saved Sessions" table
- Session name input clears
- Success message or feedback (depending on implementation)
- Session row includes:
  - Name
  - Date saved
  - Transaction count
  - Action buttons (Load, Save, Export, Delete)

#### Loading a Saved Session

**User Action:** Clicks " Load" button on session row

**What Happens:**

1. **Event Fired**: `click` event on Load button

2. **Handler Called**: `handlers.loadSessionHandler(sessionId)`

3. **Confirmation Dialog**:
   ```javascript
   if (!confirm("Loading this session will replace your current unsaved work. Continue?"))
     return;
   ```

4. **API Request**:
   - **Endpoint**: `GET /api/sessions/{sessionId}`
   - **Headers**: `Authorization: Bearer {firebaseIdToken}`

5. **Backend Processing**:
   - Fetches session document from Firestore
   - Returns full session object with transactions, participants, currencies

6. **State Updated**:
   ```javascript
   state.loadSessionIntoActiveState(sessionData);
   ```
   - Replaces active session completely
   - Updates transactions array
   - Updates participants array
   - Updates currencies
   - Saves to IndexedDB

7. **UI Updated**:
   - `ui.refreshTransactionsTableUI()` → Loads session's transactions
   - `ui.updateParticipantsListUI()` → Shows session's participants
   - Currency dropdowns updated
   - `handlers.calculateAndUpdateSummary()` → Recalculates with loaded data

**User Sees:**
- Confirmation dialog warning about replacing current work
- After confirmation:
  - Transaction table clears and populates with loaded transactions
  - All assignments preserved
  - Participants list updates
  - Currency selections updated
  - Summary recalculates
  - Smooth transition without page refresh

**Important:** Any unsaved changes to previous active session are lost.

#### Overwriting an Existing Session

**User Action:** Clicks " Save" (overwrite) button on session row

**What Happens:**

1. **Confirmation Dialog**:
   ```javascript
   if (!confirm(`Overwrite saved session "${sessionName}" with current data?`))
     return;
   ```

2. **Handler Called**: `handlers.overwriteSessionHandler(sessionId, sessionName)`

3. **Data Collection**:
   - Same as saving new session
   - Current transactions, participants, currencies

4. **API Request**:
   - **Endpoint**: `PUT /api/sessions/{sessionId}`
   - **Headers**: `Authorization: Bearer {firebaseIdToken}`
   - **Body**: Updated session data

5. **Backend Processing**:
   - Updates existing Firestore document
   - Replaces `transactions`, `participants`, `currencies`
   - Updates `lastUpdatedAt` timestamp

6. **State & UI Update**:
   - Refresh sessions list
   - Update transaction count in UI
   - Update timestamp in UI

**User Sees:**
- Confirmation dialog
- After confirmation:
  - Session row updates (new timestamp, possibly new transaction count)
  - Brief success feedback
  - No navigation away from current active session

#### Deleting a Session

**User Action:** Clicks " Delete" button on session row

**What Happens:**

1. **Confirmation Dialog**:
   ```javascript
   if (!confirm(`Permanently delete session "${sessionName}"?`))
     return;
   ```

2. **API Request**:
   - **Endpoint**: `DELETE /api/sessions/{sessionId}`
   - **Headers**: `Authorization: Bearer {firebaseIdToken}`

3. **Backend Processing**:
   - Deletes document from Firestore
   - Updates parent metadata timestamp

4. **State & UI Update**:
   - Removed from local sessions array
   - `ui.updateSessionsTableUI()` called
   - Row removed from table

**User Sees:**
- Confirmation dialog
- After confirmation:
  - Session row disappears from table
  - If no more sessions, shows "No saved sessions found"
  - Does NOT affect active session (can continue working)

---

### PDF Export Flow

**User Action:** Clicks " Export" button on session row

**What Happens:**

1. **Event Fired**: `click` event on Export button

2. **Handler Called**: `handleExportSessionPdf(sessionId, sessionName)` in `export.js`

3. **Data Retrieval**:
   ```javascript
   const session = state.getSessionById(sessionId);
   ```

4. **PDF Generation** (Client-Side):
   - Uses jsPDF library
   - Creates new PDF document
   - Adds header with session name and export timestamp
   - Adds transaction table using jspdf-autotable:
     - Columns: #, Date, Description, Amount, Assigned To
     - All transactions included with formatting
   - Adds summary section:
     - Participant totals in both currencies
     - Grand totals

5. **File Download Trigger**:
   ```javascript
   pdf.save(`${sessionName}_${dateString}.pdf`);
   ```

**User Sees:**
- Brief processing (fraction of a second)
- Browser download dialog or automatic download
- PDF file downloaded to Downloads folder
- Filename: `"Family Vacation_2024-06-15.pdf"`

**PDF Contents:**
```
ExpenseSplit Pro - Session Report
─────────────────────────────────
Session: Family Vacation
Exported: June 15, 2024 3:45 PM

TRANSACTIONS
─────────────────────────────────
#  | Date       | Description      | Amount     | Assigned To
1  | 15/06/2024 | Dinner          | PEN 60.00  | Alice, Bob, Charlie
2  | 16/06/2024 | Coffee          | USD 10.00  | Alice, Bob
3  | 17/06/2024 | Museum Tickets  | PEN 45.00  | Alice, Bob, Charlie

EXPENSE SUMMARY
─────────────────────────────────
Participant | PEN Total | USD Total
Alice       | 35.00     | 5.00
Bob         | 35.00     | 5.00
Charlie     | 35.00     | 0.00
TOTAL       | 105.00    | 10.00
```

---

### Theme Toggle Flow

**User Action:** Clicks theme toggle switch (sun/moon icons)

**What Happens:**

1. **Event Fired**: `change` event on `#theme-checkbox`

2. **Handler Called**: `themeToggleHandler()` in `handlers.js`

3. **Theme Switch** (`theme.js`):
   ```javascript
   const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
   document.body.dataset.theme = newTheme;
   localStorage.setItem('theme', newTheme);
   ```

4. **CSS Variable Updates**:
   - All CSS custom properties update based on `[data-theme]` selector
   - Colors, backgrounds, borders all transition

**User Sees:**
- Smooth color transition across entire page
- All elements update simultaneously:
  - Background colors
  - Text colors
  - Border colors
  - Button styles
  - Table styles
  - Icon colors
- Sun/moon icons swap positions
- Checkbox slider animates

**Transition Speed:** ~300ms smooth transition via CSS

**Persistence:** Next time user visits, theme is remembered

---

### New Session Flow

**User Action:** Clicks "New Session" button in header

**What Happens:**

1. **Confirmation Dialog**:
   ```javascript
   if (!confirm("Start a new session? Current unsaved work will be cleared."))
     return;
   ```

2. **Handler Called**: `newSessionHandler()`

3. **State Reset**:
   ```javascript
   state.resetActiveSession();
   ```
   - Clears all transactions
   - Resets participants to frequent participants
   - Resets currencies to defaults (PEN, USD)
   - Clears session name
   - Saves to IndexedDB

4. **UI Reset**:
   - `ui.clearTransactionsTable()`
   - `ui.updateParticipantsListUI()` → Shows only frequent participants
   - `ui.clearSummaryTable()`
   - Currency dropdowns reset to defaults
   - Session name input cleared

**User Sees:**
- Confirmation dialog
- After confirmation:
  - All transactions disappear
  - Participants list shows only frequent participants
  - Summary table shows all zeros
  - Clean slate to start new expense tracking
  - No data lost from saved sessions

---

## 🏁 Conclusion

ExpenseSplit Pro represents a mature, feature-rich expense management application built with modern web technologies. The Firebase integration ensures scalable, secure cloud storage, while the IndexedDB caching layer provides exceptional performance. The modular architecture allows for easy maintenance and future enhancements.

This legacy Python version serves as a solid foundation, with comprehensive functionality for both individual and group expense tracking. The application successfully balances user-friendly interfaces with powerful features like smart auto-assignment, multi-currency support, and client-side PDF generation.

The codebase demonstrates professional software engineering practices including:
- Clear separation of concerns
- Comprehensive error handling
- Security-first design
- Performance optimization
- Maintainable code organization
- Thorough documentation

**Total Lines of Code:** ~3,000+ lines of Python + ~4,500+ lines of JavaScript + ~2,700+ lines of CSS

**Status:** Production-ready, actively maintained legacy version
