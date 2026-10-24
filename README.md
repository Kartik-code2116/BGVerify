# BGVerify.ai — AI-Powered Background Verification SaaS

> **Next-Generation Autonomous Background Verification Platform powered by Playwright Browser Bots, AI Resume OCR Parsing, and Multi-Tenant BGCoin Ledger.**

---

## 📌 Executive Summary & Problem Statement

Traditional background verification is slow, fragmented, and predominantly manual. HR teams and recruitment agencies wait between **2 to 4 weeks** while third-party verification agencies manually phone past employers, mail universities, and check disparate records.

**BGVerify.ai** disrupts this paradigm by automating background verification checks using:
1. **Playwright-powered Headless Browser Agents:** Authorized bots navigate university portals, employer verification portals, and government databases to collect tamper-evident screenshots, PDFs, and HTML DOM snapshots.
2. **AI & Multi-Tier OCR Resume Engine:** Real-time extraction of candidate data from uploaded PDF/image resumes using `pdf-parse` and Tesseract OCR, auto-filling candidate credentials in one click.
3. **AI Comparison & Discrepancy Engine:** Compares candidate claims against official portal evidence, computing match confidence scores and flagging discrepancies (e.g. graduation year or tenure mismatches) into an HR Review Queue.
4. **Multi-Tenant BGCoin Economy:** Organizations purchase BGCoin packs (recharge credits) and spend exactly **1 BGCoin per verification check**. All wallet deductions follow strict atomic transactions and write to an immutable audit ledger.

---

## 💰 Commercial Model: The BGCoin System

Organizations operate on a pre-paid credit model. 1 Background Check = 1 BGCoin. Unused coins remain permanently in the company's wallet.

| Package Tier | Quantity | Price (INR) | Effective Rate | Target Audience |
| :--- | :---: | :---: | :---: | :--- |
| **Starter Pack** | 100 BGCoins | ₹9,000 | ₹90 / check | Early-stage startups & boutique agencies |
| **Growth Pack** *(Most Popular)* | 500 BGCoins | ₹42,500 | ₹85 / check *(Save 6%)* | Mid-market businesses & growing teams |
| **Enterprise Pack** | 1,000 BGCoins | ₹80,000 | ₹80 / check *(Save 11%)* | High-volume enterprises & staffing agencies |

---

## 🏗️ Detailed Architecture & Completed Sections

### 1. 🖥️ Frontend Architecture (React 19 + Vite + Tailwind CSS)

The frontend is built as a responsive Single Page Application (SPA) with a custom **Dark Theme Design System** (`index.css`), **React Router v7**, **TanStack React Query**, and **Axios interceptors**.

#### A. Multi-Tenant Role-Based Routing & Access Control
* **`ProtectedRoute.jsx`:** Inspects active JWT session and enforces role permissions (`admin`, `org_owner`, `hr_admin`, `candidate`). Unauthorized routes automatically redirect to the user's home dashboard.
* **`AuthContext.jsx`:** Manages user session state, local storage synchronization, token refresh mechanisms, and role helpers (`isAdmin`, `isCompany`, `isCandidate`).
* **`DashboardLayout.jsx`:** Collapsible sidebar navigation tailored to the active role, top header with search bar, notification indicators, and user profile drawer.

#### B. Company / HR Portal Pages
* **`CompanyDashboardPage.jsx`:**
  * Live KPI statistics: Total Checks, Passed, In Progress, Requires Review.
  * **🚨 Urgent Hiring Requisitions Widget:** Live alert showing priority 24-hour turnaround vacancies.
  * **Sector Distribution Breakdown:** Aggregated headcount distribution across Technology, BFSI, Logistics, Healthcare, and Operations.
  * Interactive BGCoin balance card with instant top-up modal trigger.
  * Recent candidate verification stream with one-click access to evidence reports.
* **`HiringRolesPage.jsx` (Hiring Roles & Sector Requisitions):**
  * **Dynamic Sector Management:** "⚙️ Manage Sectors" modal allowing HR managers to create custom sectors, edit names & descriptions, assign color badge palettes (`cyan`, `emerald`, `rose`, `amber`, etc.), and set default verification checks.
  * Multi-sector hiring requisition management across custom and default sectors.
  * Urgency prioritization: **`🚨 Urgent (24h Turnaround)`**, **`High Priority (48h)`**, and **`Standard (3-5 Days)`**.
  * Role-specific mandatory verification packages (e.g. CIBIL/Credit for BFSI, Commercial License for Logistics, Council verification for Healthcare).
  * Quick-launch sector templates for instant 1-click requisition publishing.
  * Requisition pipeline progress bar tracking vacancies filled vs target openings.
  * Edit Role Modal: update open positions, urgency, description, and required checks for existing job roles.
  * Direct action links: "+ Add Candidate" (pre-fills role/sector/urgency) and "View Candidates" (filters directory by role).
* **`CandidatesPage.jsx` (Candidate & Student Directory):**
  * Searchable candidate directory with dynamic Sector Badges, Target Roles, and Urgency Indicators.
  * Dynamic Sector Filter tabs populated from company sectors and Urgency filter (`🚨 Urgent 24h Only`).
  * **Edit Candidate Assignment Modal:** Update a candidate's Sector, Target Role, Hiring Urgency, and Stage at any time with quick-pick active roles.
  * **⚡ AI Resume OCR Scanner:** Drag-and-drop dropzone for resumes with live scanning animation, auto-suggesting best-fit sector and role based on extracted skills.
  * 4-tab registration modal: **Hiring Role & Sector**, **Personal Details**, **Student / Academic (Roll/PRN Number, University)**, and **Employment**.
  * Dynamic sector dropdown powered by organization's configured sectors.
  * **"👁️ View Raw OCR Text"** transparency drawer to inspect extracted text bytes.
  * **One-Click "🎉 Hire Candidate":** Automatically updates candidate hiring stage and increments the role's filled headcount.
* **`CompanyVerificationsPage.jsx`:**
  * Verification pipeline filterable by check type (Employment, Education, Identity, Criminal, etc.) and execution status.
  * Priority indicators (`Standard`, `High`, `🚨 Urgent 24h`).
  * Shows candidate's assigned target role and sector.
* **`CompanyReviewQueuePage.jsx`:**
  * Dedicated queue for cases flagged by AI due to date discrepancies or partial name matches.
* **`CompanyWalletPage.jsx`:**
  * BGCoin balance summary and pricing packages.
  * Auditable transaction ledger showing credit/debit records, balance after deduction, and reference IDs.

#### C. Platform Admin Portal Pages
* **`AdminDashboardPage.jsx`:** Platform-wide oversight of total verification jobs, registered organizations, manual review load, and infrastructure status (MongoDB, BullMQ, Playwright cluster).
* **`AdminVerificationsPage.jsx`:** Cross-tenant verification directory with filters across all customer accounts.
* **`ReviewQueuePage.jsx`:** Global human-in-the-loop review station with decision actions (**Approve Match** / **Reject Discrepancy**) and review justification notes.
* **`AdminOrganizationsPage.jsx`:** Corporate account directory, KYC compliance badges, and manual BGCoin grant modal.
* **`AdminAuditPage.jsx`:** Read-only immutable security ledger tracking system operations, actor IDs, and resource changes.

#### D. Candidate Portal Pages
* **`CandidateDashboardPage.jsx`:** Onboarding progress checklist (Step 1: Consent → Step 2: Documents → Step 3: Biometric Selfie).
* **`CandidateTasksPage.jsx`:**
  * **Digital Consent Form:** Legally binding consent under Indian DPDP Act.
  * **Document Upload Vault:** Upload Aadhaar, Passport, and Degree Certificates.
  * **Biometric Live Selfie:** Webcam capture and liveness detection simulation.
* **`CandidateDocumentsPage.jsx`:** Repository of submitted documents with SHA-256 cryptographic digests.

#### E. Reusable Modals & Dialogs
* **`NewVerificationModal.jsx`:** Selects candidate, auto-populates their registered student/work credentials, and dispatches the check with 1 BGCoin deduction.
* **`TopUpModal.jsx`:** Selects commercial BGCoin packages (100, 500, 1000) with instant simulated checkout.
* **`EvidenceViewerModal.jsx`:** Displays AI validation confidence score, side-by-side submitted vs found table, Playwright bot execution console trail, and reviewer notes.

---

### 2. ⚙️ Backend Architecture (Node.js + Express + TypeScript)

The backend is built as a **Modular Monolith** using strict TypeScript compilation, Mongoose ODM, Zod request validation, Helmet security headers, and Pino structured logging.

#### A. Core API Modules
* **Authentication Module (`src/modules/auth/`):**
  * JWT access token and refresh token generation.
  * Bcrypt password hashing (salt rounds: 10).
  * Organization onboarding on user registration.
* **Sectors Module (`src/modules/sectors/`):**
  * Dynamic company sector CRUD (`GET`, `POST`, `PATCH`, `DELETE /api/v1/sectors`).
  * Auto-provisions 7 industry-standard defaults (Technology & IT, BFSI, Healthcare, Logistics, etc.) for new organizations.
  * **Automatic Cascading Renames:** Renaming a sector automatically cascades updates across all `JobRole` and `Candidate` documents in the organization.
  * Referential integrity protection blocking sector deletion if actively assigned to open roles or candidates.
* **Job Roles Module (`src/modules/roles/`):**
  * Requisition tracking per role, open vacancies, and filled counter.
  * Sector linkage and required verification package mapping.
  * Urgency indicators (`urgent`, `high`, `medium`, `low`).
* **Candidates Module (`src/modules/candidates/`):**
  * Candidate CRUD with organization-level tenancy partitioning.
  * Support for dynamic Sector, Target Role, Urgency, and Hiring Stage assignment.
  * `PATCH /api/v1/candidates/:id` endpoint for HR managers to reassign sectors, roles, and priority.
  * Flexible tenure dates (`startDate`, `endDate`) supporting `"Present"` and `"Current"` alongside date objects.
  * Student academic schema with **Roll Number / PRN**, **University**, **Degree**, and **Passing Year**.
  * DPDP legal consent recording.
  * Candidate document upload and live selfie endpoints.
  * **`POST /api/v1/candidates/parse-resume`** endpoint for multi-tier OCR document parsing.
* **Verifications Module (`src/modules/verifications/`):**
  * Atomic BGCoin deduction: validates wallet balance $\ge 1$ and decrements balance via `$inc` before creating the verification record.
  * **Real Autonomous Playwright Browser Engine (`playwrightBot.service.ts`):** Launches sandboxed headless Chromium (`v156.0.8078.4`), navigates to authoritative registrar/employer clearinghouse portals, queries candidate credentials (Student Roll/PRN, degree, employer, employee ID), captures real full-page evidence screenshots, computes SHA-256 digests, and generates millisecond-timestamped execution trails.
  * Status and result lifecycle management (`pending` → `completed` / `manual_review`).
* **Wallet Module (`src/modules/wallet/`):**
  * Organization wallet balance tracking.
  * Package purchase endpoint (`/purchase`) supporting 100, 500, and 1,000 BGCoin tiers.
  * Admin manual credit grant endpoint (`/topup`).
  * Double-entry transaction ledger (`WalletTransaction`).
* **Organizations Module (`src/modules/organizations/`):**
  * Multi-tenant account management and KYC verification flags.
  * Aggregate statistics (active candidates, verification counts, wallet reserves).
* **Audit Module (`src/modules/audit/`):**
  * Centralized audit logging for every critical state mutation (verification dispatch, wallet debit, manual approval).

---

### 3. 📄 Detailed Structure: AI Resume OCR & Document Parsing Engine

The OCR engine in [`resumeParser.service.ts`](file:///d:/2)college%20folder/5th%20semister/BGVerify/bgverify-backend/src/modules/candidates/resumeParser.service.ts) extracts candidate data from uploaded PDF and image resumes.

```
       [ Uploaded Resume Document (PDF / PNG / JPG) ]
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                   Multi-Tier Text Extractor                 │
  ├─────────────────────────────────────────────────────────────┤
  │ Tier 1: PDF Document Parsing (PDFParse Class)               │
  │ Tier 2: Native PDF Stream Inflation (zlib.inflateSync)       │
  │ Tier 3: Optical Character Recognition (Tesseract.js Engine) │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Raw Extracted Text
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │             NLP & Heuristic Pattern Classifier              │
  ├─────────────────────────────────────────────────────────────┤
  │ • Candidate Name   : Excludes headers, emails & roles       │
  │ • Contact          : RFC email regex & Indian +91 mobile    │
  │ • University/Board : SPPU, IIT, VTU, Mumbai Uni, etc.       │
  │ • Degree & Program : B.Tech, M.Tech, MBA, AI, CS, etc.      │
  │ • Roll / PRN Number: PRN-XXXX, Roll No, Reg No keys         │
  │ • Graduation Year  : Explicit batch & passing year capture  │
  │ • GPA / CGPA       : X.XX/10 or percentage pattern matching │
  │ • Employer & Role  : Companies, designations & Emp IDs      │
  │ • National IDs     : Aadhaar & PAN regex formats            │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Structured JSON
                                 ▼
            [ Auto-Populate HR Candidate Form Tabs ]
                                 │
                                 ▼
             [ Hand Over to Playwright Verification Bot ]
```

#### Real-World Verification Test: Kartik Thorat Resume
Tested directly on an actual 2-page PDF resume:
* **Candidate Name:** `KARTIK THORAT`
* **Email:** `kartikthorat2116@gmail.com`
* **Phone:** `+91 8329785830`
* **University / College:** `VIT Pune` (Vishwakarma Institute of Technology)
* **Degree:** `Bachelor of Technology, Artificial Intelligence`
* **Graduation Year:** `2028`
* **CGPA:** `8.5 / 10`
* **Designation:** `Software Engineer`
* **Key Projects:** `WildTrack AI`, `Edu Report`, `SecureMeet`
* **Extracted Skills:** React.js, Node.js, Express.js, TypeScript, Python, Java, MongoDB, MySQL, AWS, Git, OpenCV, Flask, Kotlin.

---

### 4. 🤖 Playwright Bot Automation & AI Verification Engine

Once HR registers a candidate and clicks **"Verify"**:
1. **Target Navigation:** The Playwright bot opens the designated verification portal (e.g. University Registrar, Digilocker/NAD, or corporate employment portal).
2. **Automated Search:** Bot auto-fills the search fields using the candidate's verified keys (**Roll / PRN Number**, **Degree**, **Year**, or **Employee ID**).
3. **Evidence Capture:** Takes a full-page screenshot (`screenshot_portal.png`) and downloads the official digital verification PDF.
4. **AI Side-by-Side Comparison:** Compares candidate claims against portal evidence:

| Verification Field | What HR / Candidate Submitted | What Playwright Bot Found on Portal | AI Outcome |
| :--- | :--- | :--- | :---: |
| **Candidate Name** | Kartik Thorat | Kartik Thorat | ✅ Match |
| **University** | VIT Pune | Vishwakarma Institute of Technology | ✅ Match (Alias) |
| **Degree** | B.Tech Artificial Intelligence | Bachelor of Technology, AI | ✅ Match |
| **Roll / PRN No** | 71928341 | 71928341 | ✅ Match |
| **Passing Year** | 2028 | 2028 | ✅ Match |

* **Decision Flow:**
  * All fields match $\longrightarrow$ Marked **Completed - Match** (Confidence: **98%**).
  * Discrepancy detected (e.g. tenure gap or degree mismatch) $\longrightarrow$ Routed to **Human-in-the-Loop Review Queue** with discrepancy flags.

---

## 🔍 Supported Verification Checks (14 Types)

1. **Employment History:** Previous employers, designations, tenure dates, employee IDs.
2. **Education Credentials:** Universities, degrees, graduation years, roll numbers.
3. **Identity Verification:** Aadhaar, PAN card, Voter ID validation.
4. **Physical Address Check:** Geocoded address confirmation & verification.
5. **Criminal Background Records:** Police and district court record checks.
6. **Court & Legal Records:** High court, district court, and tribunal litigation check.
7. **Social Media & Media Scan:** Public profile sentiment and reputational scan.
8. **Passport Validation:** Passport authenticity check via authorized portal.
9. **Driving License Check:** RTO driver license authenticity verification.
10. **Professional Certifications:** CA, CFA, Bar Council, Medical Council license checks.
11. **Drug Screening Tests:** Authorized clinical lab panel validation.
12. **Credit & Financial Health:** Credit bureau report analysis.
13. **Global Sanctions & PEP:** OFAC, Interpol, and global sanctions watchlist search.
14. **Professional Reference Checks:** Automated referee outreach & response capture.

---

## 📁 Complete Production-Ready File Structure

```
BGVerify/
├── DOCUMENTS/                                  # Product specs, business model & guides
│   ├── BGVerify.txt                            # Full platform requirements & pricing
│   ├── my_understanding.txt                    # Role breakdown & workflow guide
│   └── BGVerify.docx                           # Original requirements document
│
├── bgverify-backend/                           # Express.js + TypeScript REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts                     # MongoDB Mongoose connection
│   │   │   └── index.ts                        # Environment configuration
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                         # JWT verification & RBAC authorization
│   │   │   ├── errorHandler.ts                 # Centralized error handling
│   │   │   └── validate.ts                     # Zod request schema validation
│   │   │
│   │   ├── modules/
│   │   │   ├── audit/
│   │   │   │   ├── audit.model.ts              # Immutable audit trail schema
│   │   │   │   └── audit.routes.ts             # Audit trail inspection endpoints
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts          # Auth controllers
│   │   │   │   ├── auth.routes.ts              # Authentication routes
│   │   │   │   ├── auth.service.ts             # Token issuance & password hashing
│   │   │   │   └── auth.validation.ts          # Zod authentication schemas
│   │   │   │
│   │   │   ├── candidates/
│   │   │   │   ├── candidate.model.ts          # Candidate model with academic & work schema
│   │   │   │   ├── candidate.routes.ts         # Candidate CRUD, consent, uploads & resume parser
│   │   │   │   └── resumeParser.service.ts     # Multi-tier PDF & Tesseract OCR engine
│   │   │   │
│   │   │   ├── organizations/
│   │   │   │   ├── organization.model.ts       # Tenant organization model
│   │   │   │   └── organization.routes.ts      # Multi-tenant management & stats
│   │   │   │
│   │   │   ├── users/
│   │   │   │   └── user.model.ts               # User schema with RBAC roles
│   │   │   │
│   │   │   ├── verifications/
│   │   │   │   ├── verification.controller.ts  # Verification controllers
│   │   │   │   ├── verification.model.ts       # 14 check types, AI analysis & evidence
│   │   │   │   ├── verification.routes.ts      # Verification dispatch, review & metrics
│   │   │   │   ├── verification.service.ts     # Verification lifecycle & atomic BGCoin deduct
│   │   │   │   └── verification.validation.ts  # Verification Zod validations
│   │   │   │
│   │   │   └── wallet/
│   │   │       ├── wallet.model.ts             # Wallet balance & transaction ledger
│   │   │       └── wallet.routes.ts            # Balance, packages, purchase & top-up
│   │   │
│   │   ├── scripts/
│   │   │   └── seed.ts                         # Complete test data seeder
│   │   │
│   │   ├── utils/
│   │   │   ├── errors.ts                       # Custom HTTP domain errors
│   │   │   └── logger.ts                       # Pino structured logger
│   │   │
│   │   ├── app.ts                              # Express application setup
│   │   └── server.ts                           # Server listener & graceful shutdown
│   │
│   ├── .env                                    # Backend environment configuration
│   ├── package.json                            # Backend dependencies (pdf-parse, tesseract.js)
│   └── tsconfig.json                           # TypeScript configuration
│
├── bgverify-frontend/                          # React 19 + Vite Frontend SPA
│   ├── src/
│   │   ├── assets/                             # Logos, branding and media
│   │   ├── components/
│   │   │   ├── EvidenceViewerModal.jsx         # AI side-by-side match & Playwright bot trail
│   │   │   ├── NewVerificationModal.jsx        # Verification dispatch modal (1 BGCoin cost)
│   │   │   ├── ProtectedRoute.jsx              # RBAC route guard
│   │   │   └── TopUpModal.jsx                  # BGCoin package purchase modal
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx                 # User session, JWT tokens & role helpers
│   │   │
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx             # Role-based sidebar, top header, user menu
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx                   # One-click test account login
│   │   │   ├── RegisterPage.jsx                # Company registration
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.jsx      # Platform stats & worker cluster status
│   │   │   │   ├── AdminVerificationsPage.jsx  # System-wide verifications directory
│   │   │   │   ├── ReviewQueuePage.jsx         # Flagged cases human review queue
│   │   │   │   ├── AdminOrganizationsPage.jsx  # Company directory & BGCoin grants
│   │   │   │   └── AdminAuditPage.jsx          # Security & compliance audit trail
│   │   │   │
│   │   │   ├── company/
│   │   │   │   ├── CompanyDashboardPage.jsx    # HR workspace, KPIs & live balance
│   │   │   │   ├── CompanyVerificationsPage.jsx# Company verification pipeline
│   │   │   │   ├── CandidatesPage.jsx          # Candidate directory & Resume OCR parser
│   │   │   │   ├── CompanyReviewQueuePage.jsx  # Discrepancy resolution queue
│   │   │   │   └── CompanyWalletPage.jsx       # BGCoin packages & transaction ledger
│   │   │   │
│   │   │   └── candidate/
│   │   │       ├── CandidateDashboardPage.jsx  # Verification readiness checklist
│   │   │       ├── CandidateTasksPage.jsx      # Consent form, doc uploads & live selfie
│   │   │       └── CandidateDocumentsPage.jsx  # Secure document vault & SHA-256 hashes
│   │   │
│   │   ├── services/
│   │   │   └── api.js                          # Axios instance with interceptors & API services
│   │   │
│   │   ├── App.jsx                             # App router with complete role routes
│   │   ├── index.css                           # BGVerify dark theme design system
│   │   └── main.jsx                            # React 19 root bootstrap
│   │
│   ├── package.json                            # Frontend dependencies & scripts
│   ├── tailwind.config.js                      # Tailwind CSS design system config
│   └── vite.config.js                          # Vite bundler configuration
│
└── README.md                                   # Comprehensive platform architecture & guide
```

---

## 📊 Summary of Completed Sections

| Section / Capability | Implementation Details | Status |
| :--- | :--- | :---: |
| **Multi-Tier Resume OCR Engine** | `pdf-parse` v2 + native zlib stream decompression + Tesseract OCR image fallback. | ✅ **Done** |
| **Candidate Auto-Fill Modal** | 3-tab layout (Personal, Academic with Roll Number, Employment) with auto-population from OCR. | ✅ **Done** |
| **Real File Streaming** | Frontend `FileReader` base64 streaming with "View Raw OCR Text" inspector. | ✅ **Done** |
| **BGCoin Atomic Wallet** | Concurrency-safe `$inc` balance decrements, prevention of overspending, auditable ledger. | ✅ **Done** |
| **Company HR Portal (5 Pages)** | Dashboard, Verifications, Candidate Directory & OCR, Review Queue, Wallet & Ledger. | ✅ **Done** |
| **Platform Admin Portal (5 Pages)**| Command Center, Global Verifications, Review Queue, Company KYC & Grants, Audit Trail. | ✅ **Done** |
| **Candidate Portal (3 Pages)** | Onboarding Readiness Checklist, DPDP Legal Consent, Document Vault, Live Selfie Face Match. | ✅ **Done** |
| **Evidence & Discrepancy Viewer**| Modal displaying side-by-side submitted vs found table, confidence meter, Playwright bot logs. | ✅ **Done** |
| **Autonomous Verification Engine**| Verification pipeline generating evidence files (`.pdf`, `.png`) and AI field comparisons. | ✅ **Done** |
| **Multi-Tenant MongoDB Layer** | Strict `organizationId` data segregation across User, Org, Candidate, Verification, and Wallet. | ✅ **Done** |
| **Zero-Error Production Builds** | Both `bgverify-backend` (`tsc`) and `bgverify-frontend` (`vite build`) pass with 0 errors. | ✅ **Done** |

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
* **Node.js:** v18+ (v20+ recommended)
* **MongoDB:** Running locally on port `27017` or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd bgverify-backend
npm install

# Seed the database with demo accounts, organizations, and verifications
npm run seed

# Start the development server
npm run dev
# Server runs on http://localhost:5000/api/v1
```

### 3. Frontend Setup
```bash
cd bgverify-frontend
npm install

# Start the Vite development server
npm run dev
# Accessible at http://localhost:5173
```

---

## 🔑 Demo Test Accounts

The database seeder provisions pre-configured accounts for all three portals. You can log into any account using the one-click buttons on the login screen or with these credentials:

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@bgverify.ai` | `AdminPass123!` | Full cross-tenant access, review queue, organization audits |
| **HR Manager (Acme Corp)** | `hr@acme-corp.com` | `HrPass123!` | 85 BGCoins balance, candidate directory, active verifications |
| **HR Manager (TechStart)** | `hiring@techstart.io`| `HrPass123!` | 45 BGCoins balance, separate tenant workspace |
| **Candidate (Rahul Sharma)**| `rahul.sharma@example.com` | `CandidatePass123!` | Consent granted, degree and experience documents uploaded |
| **Candidate (Sneha Verma)** | `sneha.verma@example.com` | `CandidatePass123!` | Flagged date discrepancy case in manual review queue |


                  ┌────────────────────────────────────────────────────────┐
                  │              HR Verification Workflow                  │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             │                                                               │
             ▼                                                               ▼
  Place 1: Candidates Page                                 Place 2: Discrepancy Review Queue
  (/company/candidates)                                    (/company/review)
  • HR clicks [Verify] on a student                        • Candidate claims with mismatches land here
  • Student data is auto pre-filled                        • HR can cross-verify on [Other Portal]
  • HR picks the Target Portal                             • HR can re-run the bot or decide in [Review & Act]
             │                                                               │
             └───────────────────────────────┬───────────────────────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────┐
                              │ Playwright Browser Bot      │
                              │ • Uses stored credentials   │
                              │ • Logs into selected portal │
                              │ • Queries student's roll/ID │
                              │ • Captures PNG evidence     │
                              └─────────────────────────────┘