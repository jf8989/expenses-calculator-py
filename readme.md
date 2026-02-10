<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google AI"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

# Next.js & Firebase - Advanced Starter Template

> [!IMPORTANT] > **🚀 Discovery Brief Included:** This template features a built-in **Project Discovery Form** designed for client intake. It allows you to gather technical requirements, business goals, and design preferences from your clients in a professional, automated way.

This is a production-ready starter template for building modern, full-stack applications. It combines the power of Next.js with the scalability of Firebase and the intelligence of Google AI (Gemini).

---

## 🛠️ Detailed Setup Guide

Follow these steps to get your project up and running in minutes.

### 1. Repository Setup

1.  **Clone the Template:**

    ```bash
    git clone https://github.com/jf8989/next-js-template-jf8989.git my-app
    cd my-app
    ```

2.  **Initialize Your Own Git:**
    ```bash
    rm -rf .git
    git init
    git branch -M main
    ```

### 2. Service Configuration

#### Firebase Setup

1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Add a Web App and copy the configuration.
3.  Enable **Authentication** (Email/Google) and **Firestore**.
4.  Copy `.env.local.example` to `.env.local` and fill in your keys.

#### Google AI (Gemini)

1.  Get an API key from [Google AI Studio](https://aistudio.google.com/).
2.  Add it to `GEMINI_API_KEY` in your `.env.local`.

### 3. Installation

```bash
npm install
npm run dev
```

---

## ✨ Key Features

- 📝 **Intake Form:** Professional multi-step form for client discovery.
- 🔐 **Authentication:** Fully configured Firebase Auth.
- 🤖 **AI Integration:** Secure proxy for Google AI (Gemini) with streaming responses.
- 🎨 **Premium UI:** Radical design with Tailwind CSS, Framer Motion, and Dark Mode support.
- 📱 **Mobile Optimized:** 100% responsive components.
- ⚡ **Performance:** Optimized for Vercel deployment and Next.js Best Practices.

---

## 📂 Project Structure

- `src/app`: App Router pages and API routes.
- `src/components/forms`: The Project Discovery Brief form.
- `src/components/ui`: Premium, reusable UI components.
- `src/lib/firebase`: Firebase client and admin configuration.
- `src/types`: TypeScript definitions for the intake form and auth.

## 🚀 Deployment

Optimized for **Vercel**. Simply connect your GitHub repository, add your environment variables, and deploy!

---

## License

MIT - Free to use for your next big project!
