# Project Pulse - Next.js Migration Enhancements

## [2026-02-10] Phase 1: Global State Management (Zustand) [COMPLETED]
- **Goal**: Implement centralized state management with Zustand and IndexedDB persistence.
- **Accomplishments**:
    - Installed `zustand` and configured `useAppStore.ts`.
    - Implemented custom IndexedDB storage adapter for Zustand persistence.
    - Refactored `SessionEditor.tsx`, `ParticipantsManager.tsx`, and `SessionsList.tsx` to use the store.
    - Refactored `useCachedData.ts` to act as a Firestore-to-Store sync bridge.
    - Cleaned up legacy `indexedDb.ts` implementation.
    - Verified build and type safety with `npx tsc`.

## [2026-02-10] Phase 2: Per-Transaction Hybrid Model [NEXT]
- **Goal**: Allow each transaction to independently choose its splitting mode (Simple vs. Payer-focused).
- **Core Strategy**: 
    - Implement a subtle "Who paid?" UI element in each transaction row for progressive disclosure.
    - Expand `Transaction` type to include optional `paid_by` and `mode`.
    - Update `calculateSummary` to handle both simple (split among checked) and advanced (payer-based) calculations simultaneously.
- **Reference Files**:
    - [IMPLEMENTATION_PHASES.md](file:///c:/00%20Development/expenses-calculator-py/user-docs/planning/IMPLEMENTATION_PHASES.md#L93-L160) (Detailed Phase 2 design)
    - [index.ts](file:///c:/00%20Development/expenses-calculator-py/src/types/index.ts) (Type updates)
    - [calculations.ts](file:///c:/00%20Development/expenses-calculator-py/src/lib/calculations.ts) (Calculation engine)
