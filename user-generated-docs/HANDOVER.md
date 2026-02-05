# 🎯 PROJECT HANDOVER: Expense Genie (Next.js Migration)

> [!IMPORTANT]
> **To the next AI Assistant:** Read this document first. This project is a migration from a legacy Python/Flask app to a modern Next.js/Firebase architecture.

## 🚀 Current Project State
- **Core Migration**: COMPLETE (100% build pass, exit code 0).
- **Architecture**: Next.js 15, Firebase (Auth + Firestore), Tailwind CSS, Framer Motion.
- **Frontend**: Premium dark-mode UI with glassmorphism and particles background.
- **Backend**: Firebase Admin SDK via Server Actions.

## 📁 Key Documentation (in `user-generated-docs/`)
- `pulse.md`: **The Heartbeat Log**. A chronological record of every completed phase. **CRITICAL: This must be updated after every milestone.**
- `migration_implementation.md`: **The Roadmap**. Tracks the specific technical steps taken during the transition from Python to Next.js.
- `project-brief.md`: **The Vision**. Contains the original requirements, design aesthetics (Florería Victor proposal style), and feature list.

## 🔑 Firebase Context
- **Legacy Project ID**: `expense-split-pro-46307` (Credentials in `legacy-py-app/serviceAccountKey.json`).
- **Target Project**: A **NEW** Firebase project is being created by the user to host the Next.js version.
- **Separation**: The legacy app remains on the old project; the Next.js app will live on the new one.

## 🔜 Pending Tasks (Phase 7 & 8)
1. **Phase 7: Local Caching**: Implement simple IndexedDB persistence for offline/instant load.
2. **Phase 8: Data Migration**: Use the legacy `serviceAccountKey.json` to move data from the old Firestore to the new one.

## 🤖 Instructions for the next AI
- **Always update `pulse.md`** in the `user-generated-docs/` folder upon finishing a phase.
- Refer to `legacy-py-app/` for the original Python logic if needed.
- Follow the `implementation_plan.md` in the brain directory for technical details.
