# The Quest: Sorting Hat 🧙‍♂️🎩

Welcome to **The Quest: Sorting Hat**, a Next.js application designed to evaluate candidates and assign them to one of four unique houses: **Ashmoor**, **Ravenscar**, **Valemont**, and **Thornvale**. It features two distinct flows: one for general builders (candidates) and a specialized flow for House Masters.

The sorting process isn't random; it uses **Groq AI** to analyze applicants' answers to scenario-based questions and intelligently assign them to the house that best aligns with their traits, skills, and leadership philosophy.

---

## 📂 Project Structure & File Overview

Here is a breakdown of the core files and directories in this repository and what they do:

### `app/` — Next.js App Router (Frontend Pages & Layout)
This directory contains the main user interface, pages, and routing logic.

* **`layout.js`**: The root layout for the application. It loads global fonts (Outfit, Garamond, IM Fell English) and provides the base HTML structure.
* **`globals.css`**: Global CSS variables, resets, and utility classes used across the entire app.
* **`page.js` & `page.module.css`**: The landing page and sorting flow for **general candidates**. This is where standard builders answer questions to be sorted into a house.
* **`admin/`**: Contains the admin dashboard pages to view, manage, and dispatch emails to sorted candidates.

### `app/house-masters/` — House Master Selection Flow
A specialized, isolated routing group specifically for applicants wanting to lead a house. It has a distinctive parchment aesthetic.

* **`page.js`**: The main orchestrator component for the House Masters application flow. It manages the state across multiple steps, validates inputs, and submits the final payload.
* **`housemasters.module.css`**: The CSS module responsible for the beautiful, immersive parchment and ink aesthetic of the House Masters flow.
* **`constants.js`**: Stores the questions, options, and copy text used throughout the house master sorting steps.
* **`components/`**: Modular React components representing each step in the application:
  * `LandingStep.js`: The initial landing screen.
  * `PreambleStep.js`: Context and rules about what being a House Master entails.
  * `CandidacyStep.js`: Collects basic applicant info (name, email, discord) and leadership experience.
  * `CommitmentStep.js`: Collects availability (hours, timezone, days).
  * `CouncilStep.js`: Scenario-based multiple-choice questions to evaluate leadership style.
  * `DecidingStep.js`: A single pivotal question determining the applicant's core value.
  * `ReviewStep.js`: The final confirmation screen before the applicant seals and submits their answers.

### `app/actions/` — Next.js Server Actions (Backend Logic)
Server-side functions called directly from the React components to securely handle data without exposing API routes.

* **`submitCandidate.js`**: Handles standard candidate submissions, triggers the AI evaluation, and saves the result to the database.
* **`submitHouseMaster.js`**: Handles the complex House Master application payload. It validates inputs, ensures there are still houses available to lead, asks the AI to assign a house, and handles race conditions (e.g., if two people apply for the last house at the exact same time).
* **`getHouseMasters.js` & `getCandidates.js`**: Fetches assigned house masters or candidates from the database.
* **`updateCandidate.js`**: Allows admins to manually update a candidate's status.
* **`dispatchEmails.js`**: Triggers email notifications to candidates once their sorting is complete.

### `lib/` — Utilities, Database, and External Services
Core backend utilities and integrations.

* **`db.js`**: Manages the connection to the MongoDB database using Mongoose.
* **`groq.js`**: The brain of the Sorting Hat. It interfaces with the Groq AI API. It constructs prompts based on applicant answers, instructs the AI on the traits of each house, and parses the AI's JSON decision to return a house assignment and personalized reasoning.
* **`email.js`**: Handles compiling and sending HTML emails (via an email provider like Resend or SendGrid) to notify candidates of their assigned house.
* **`models/`**: Mongoose schemas defining the structure of the MongoDB documents.
  * `Candidate.js`: Schema for general builders.
  * `HouseMaster.js`: Schema for house leaders, including availability, contact info, and their detailed question answers.

---

## 🚀 Getting Started

First, ensure you have your `.env.local` file configured with the required API keys (MongoDB connection string, Groq API key, etc.).

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠 Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: CSS Modules & Vanilla CSS
- **Database**: MongoDB (via Mongoose)
- **AI**: Groq API (for intelligent sorting)
- **Icons**: `react-icons` (Game Icons)
