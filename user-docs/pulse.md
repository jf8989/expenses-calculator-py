# Project Pulse - Next.js Migration Enhancements

> [!IMPORTANT]
> **AI Continuity Protocol**: Any AI assistant working on this project MUST:
> 1.  **Read this file first** to understand current progress.
> 2.  **Update this file** after completing each implementation phase.
> 3.  **Include References**: Always include links to implementation plans, reference files, and key components for the next phase to avoid redundant instruction and research.

## [2026-02-10] Phase 1: Global State Management (Zustand) [COMPLETED]
- **Goal**: Implement centralized state management with Zustand and IndexedDB persistence.
- **Accomplishments**:
    - Installed `zustand` and configured `useAppStore.ts`.
    - Implemented custom IndexedDB storage adapter for Zustand persistence.
    - Refactored `SessionEditor.tsx`, `ParticipantsManager.tsx`, and `SessionsList.tsx` to use the store.
    - Refactored `useCachedData.ts` to act as a Firestore-to-Store sync bridge.
    - Cleaned up legacy `indexedDb.ts` implementation.
    - Verified build and type safety with `npx tsc`.

## [2026-02-10] Phase 2: Per-Transaction Hybrid Model [COMPLETED]
- **Goal**: Allow each transaction to independently choose its splitting mode (Simple vs. Payer-focused).
- **Accomplishments**:
    - Renamed `splitWith` to `assigned_to` across the app for legacy compatibility.
    - Updated `calculateSummary` to handle transactions with and without `payer`.
    - Implemented progressive disclosure UI for payer selection in `SessionEditor`.
    - Added `PEN` currency support.
    - Verified build and type safety with `npm run build`.

## [2026-02-10] Phase 3: Currency System — Toggle + Multi-Currency [COMPLETED]
- **Goal**: Keep multi-currency rates but bring back per-transaction label toggle.
- **Accomplishments**:
    - Implemented clickable currency toggle badge in `SessionEditor` rows.
    - Ensured `Transaction.currency` defaults to `mainCurrency`.
    - Verified all summary and settle-up displays are normalized to `mainCurrency`.
    - Confirmed exchange rate math in `calculations.ts` handles per-transaction overrides.
    - Verified build and type safety with `npm run build`.

## [2026-02-10] Phase 4: Missing Features — Feature Parity with Python [NEXT]
