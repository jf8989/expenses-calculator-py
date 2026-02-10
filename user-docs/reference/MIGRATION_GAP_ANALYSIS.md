# Migration Gap Analysis: Next.js vs Legacy Python

**Date:** February 10, 2026  
**Scope:** Comparison of the existing Next.js codebase against the legacy Python/Flask app as documented in `MIGRATION_REFERENCE.md`

---

## ⚠️ Critical Architectural Differences

### 1. Transaction Data Model — Fundamentally Redesigned

| Aspect | Python (Legacy) | Next.js (Current) |
|--------|----------------|-------------------|
| **Who paid** | Not tracked (implicit) | Explicit `payer` field per transaction |
| **Who shares** | `assigned_to: string[]` (checkbox-based) | `splitWith: string[]` (selected list) |
| **Calculation** | Simple equal split of amount among `assigned_to` | Payer/consumer model: `totalPaid` vs `fairShare` → `balance` |
| **Summary output** | "Participant X owes PEN 20.00" | "Participant X gets back / owes" with settle-up debts |

> **Impact:** The Next.js app uses a **"who paid for what"** model (like Splitwise), while the Python app uses a simple **"split this cost among checked people"** model. These are fundamentally different expense-splitting paradigms.

### 2. Currency System — Different Architecture

| Aspect | Python (Legacy) | Next.js (Current) |
|--------|----------------|-------------------|
| **Model** | Primary + Secondary currency pair | Main currency + N extra currencies with exchange rates |
| **Per-transaction toggle** | Click to toggle display between primary/secondary | Per-transaction currency dropdown |
| **Exchange rates** | User-defined or default, display-only toggle | `currencies: Record<string, number>` with conversion math |
| **Summary** | Two-column display (Primary + Secondary totals) | Single normalized total in main currency |
| **Missing currency** | PEN (Peruvian Sol) — was the default | Not included in `CURRENCY_OPTIONS` list |

### 3. State Management — Different Patterns

| Aspect | Python (Legacy) | Next.js (Current) |
|--------|----------------|-------------------|
| **Pattern** | In-memory `appState` + IndexedDB persistence | React `useState` in components + server actions |
| **Global store** | Centralized `state.js` module | No global store (Zustand recommended but not used) |
| **Caching** | IndexedDB as primary cache, timestamp sync | `useCachedData` hook with IndexedDB + background Firestore sync |
| **Active session concept** | Always has an "active session" in memory | Sessions are load-edit-save, no persistent active state |

---

## 🔴 Missing Features (Not Implemented in Next.js)

### Transaction Features
- [ ] **Bulk paste & parse of transactions** — Parser exists (`parser.ts`) but **no textarea UI** in `SessionEditor.tsx` for bulk pasting (the `handleBulkImport` function exists but uses `prompt()`)
- [ ] **In-place amount editing** — Python had hover-to-edit with pencil icon (✎); Next.js uses standard form inputs
- [ ] **Per-transaction currency toggle** — Click amount to switch display between primary/secondary
- [ ] **Transaction search/filter** — Real-time filtering of transaction table by date/description/amount
- [ ] **Delete All Transactions** button — Bulk clear with confirmation
- [ ] **Unassign All Participants** button — Bulk unassignment
- [ ] **Auto-assignment intelligence** — Learning from description history (e.g., "UBER" → auto-assign Alice)
- [ ] **Transaction IDs** — Legacy generated `txn_${Date.now()}_${index}` IDs for tracking

### Participant Features
- [ ] **Frequent participants system** — Star (☆/★) toggle to mark frequent participants
- [ ] **Autocomplete/datalist suggestions** — From frequent participants when adding new ones
- [ ] **Confirmation dialog on delete** — Currently deletes without confirmation
- [ ] **Participant cleanup on delete** — Removing participant from all transaction assignments

### Session Features
- [ ] **Overwrite/Update existing session** — "Save" button on session row to overwrite with current data (API exists in `firestoreService.updateSession` but no UI button on session cards)
- [ ] **Session metadata display** — Transaction count shown on session cards
- [ ] **"New Session" button** — Reset active state to start fresh (with confirmation dialog)
- [ ] **Load session confirmation** — "Loading will replace unsaved work" warning dialog

### PDF Export
- [ ] **PDF export (entire feature)** — No PDF generation at all. Python used jsPDF + jspdf-autotable client-side
  - Session report with header, transaction table, and expense summary
  - Proper formatting with currency information
  - Export button on each session row

### Navigation & UI
- [ ] **Section navigation buttons** — Quick-jump to Currency, Input, Participants, Analysis, Sessions, Summary sections
- [ ] **Smooth scroll to sections** — `scrollIntoView` behavior
- [ ] **Loading overlay** — Full overlay preventing interaction during load (current app has spinner but no overlay)
- [ ] **Success/error toast messages** — Action confirmations (e.g., "Session saved successfully")
- [ ] **Anti-FOUC inline script** — Inline theme script in `<head>` to prevent flash of unstyled content (Next.js uses `next-themes` which handles this differently)

### Data Sync
- [ ] **Timestamp-based sync comparison** — Python compared local vs server `lastUpdatedAt` and only fetched if server was newer; Next.js always fetches both cached + fresh
- [ ] **Optimistic UI updates** — Several operations in Python updated UI before server confirmation
- [ ] **Background sync** — Python synced in background; Next.js does this partially via `useCachedData`

---

## 🟡 Partial Implementations / Differences

### Authentication
| Feature | Status | Notes |
|---------|--------|-------|
| Google Sign-In | ✅ Implemented | Uses Firebase Auth, dedicated `/login` page (vs inline in Python) |
| Token-based API auth | ⚠️ Different | Uses Next.js server actions instead of Bearer token API routes |
| Sign out | ✅ Implemented | In header |
| Auth state persistence | ✅ Implemented | Via `AuthProvider` context with safety timeout |

### Theme System
| Feature | Status | Notes |
|---------|--------|-------|
| Dark/Light toggle | ✅ Implemented | Uses `next-themes` (more robust than Python's manual implementation) |
| Persistence | ✅ Implemented | Handled by `next-themes` |
| Animated toggle | ✅ Implemented | Sun/Moon icon animation with framer-motion |
| System preference detection | ✅ Implemented | Built into `next-themes` |

### Session Management
| Feature | Status | Notes |
|---------|--------|-------|
| Save new session | ✅ Implemented | Via `SessionEditor` |
| Load saved session | ✅ Implemented | Click session card → opens editor |
| Delete session | ✅ Implemented | Trash icon on session card |
| Session list | ✅ Implemented | `SessionsList` component with card layout |
| Overwrite session | ⚠️ Partial | API exists but no dedicated "overwrite" UI flow on session list |

### Calculations
| Feature | Status | Notes |
|---------|--------|-------|
| Equal split | ⚠️ Different model | Splits by `splitWith` count, but tracks payer separately |
| Multi-currency conversion | ✅ Implemented | Uses exchange rates to normalize to main currency |
| Real-time summary | ✅ Implemented | Recalculates on transaction changes |
| Settle-up / debt minimization | ✅ **NEW** | `SettleUp.tsx` + `calculateDebts()` — not in Python at all |
| Grand totals | ⚠️ Not explicit | No explicit grand total row in summary |

---

## 🟢 New Features in Next.js (Not in Python)

| Feature | Component | Description |
|---------|-----------|-------------|
| **Settle-up / Debt Minimization** | `SettleUp.tsx` + `calculateDebts()` | Shows who owes whom with minimized payment flows |
| **Payer tracking** | `Transaction.payer` | Tracks who paid for each transaction |
| **Internationalization (i18n)** | `LanguageContext.tsx` | Full English/Spanish translations |
| **Session descriptions** | `Session.description` | Sessions have description field (not in Python) |
| **Multi-currency exchange rates** | `Session.currencies` | Arbitrary number of currencies with rates |
| **Avatar system** | `avatarUtils.ts` | Colored avatar initials for participants |
| **Framer Motion animations** | Multiple components | Smooth entrance/exit animations throughout |
| **Scroll-to-top button** | `scroll-to-top.tsx` | Floating button |
| **Particles background** | `particles-background.tsx` | Decorative animated background |
| **Wave divider** | `wave-divider.tsx` | Decorative section divider |
| **Responsive card-based layout** | `SessionsList` | Sessions displayed as styled cards (vs table rows in Python) |

---

## 📋 Summary of Key Action Items

### Must Fix (Breaking differences from Python)
1. **Add PEN** (Peruvian Sol) to `CURRENCY_OPTIONS`
2. **Decide on transaction model** — Keep payer-based Splitwise model or revert to Python's simple checkbox model?
3. **Implement PDF export** — Core feature completely missing
4. **Add transaction search/filter** — Important UX feature for large transaction lists

### Should Implement (Feature parity)
5. Frequent participants (star toggle + autocomplete)
6. Bulk transaction paste UI (textarea with proper UX, not `prompt()`)
7. Confirmation dialogs (delete participant, load session, new session)
8. New Session / reset functionality
9. Session overwrite button on session list cards

### Nice to Have (Polish)
10. Auto-assignment intelligence
11. Section navigation buttons
12. Success/error toast messages
13. Grand total row in summary
14. In-place amount editing with pencil icon
