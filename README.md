# BGVerify.ai — AI-Powered Background Verification SaaS

> **Next-Generation Autonomous Background Verification Platform powered by Playwright Browser Bots, AI Evidence Analysis, and Multi-Tenant BGCoin Ledger.**

---

## 📌 Executive Summary & Problem Statement

Traditional background verification is slow, fragmented, and predominantly manual. HR teams and recruitment agencies wait between **2 to 4 weeks** while third-party verification agencies manually phone past employers, mail universities, and check disparate records.

**BGVerify.ai** disrupts this paradigm by automating background verification checks using:
1. **Playwright-powered Headless Browser Agents:** Authorized bots navigate university portals, employer verification portals, and government databases to collect tamper-evident screenshots, PDFs, and HTML DOM snapshots.
2. **AI & OCR Verification Engine:** OCR extracts structured data from collected evidence; LLMs compare submitted candidate claims vs. authentic source data, calculating match confidence scores and flagging discrepancies (e.g. tenure dates, graduation year).
3. **Multi-Tenant BGCoin Economy:** Organizations purchase BGCoin packs (recharge credits) and spend exactly **1 BGCoin per verification check**. All wallet deductions follow strict atomic transactions and write to an immutable audit ledger.

---

## 💰 Commercial Model: The BGCoin System

Organizations operate on a pre-paid credit model. 1 Background Check = 1 BGCoin. Unused coins remain permanently in the company's wallet.

| Package Tier | Quantity | Price (INR) | Effective Rate | Target Audience |
| :--- | :---: | :---: | :---: | :--- |
| **Starter Pack** | 100 BGCoins | ₹9,000 | ₹90 / check | Early-stage startups & boutique agencies |
| **Growth Pack** *(Most Popular)* | 500 BGCoins | ₹42,500 | ₹85 / check *(Save 6%)* | Mid-market businesses & growing teams |
| **Enterprise Pack** | 1,000 BGCoins | ₹80,000 | ₹80 / check *(Save 11%)* | High-volume enterprises & staffing agencies |

---

## 👥 The 3 User Portals & Roles

```
                                  BGVerify.ai
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   ADMIN PORTAL                 COMPANY / HR PORTAL           CANDIDATE PORTAL
 (admin@bgverify.ai)            (hr@acme-corp.com)       (rahul.sharma@example.com)
  • Global Dashboard             • Company KPIs & Stats       • Verification Onboarding
  • Cross-Tenant Verifications   • Submit Verification Jobs   • Legal Consent (DPDP)
  • Human Review Queue           • Candidate Directory        • Document Uploads (PDF/JPG)
  • Company Accounts & KYC       • Discrepancy Review Queue   • Live Selfie Face Match
  • BGCoin Grants & Billing      • BGCoin Wallet & Top-up     • Verified Document Vault
  • Immutable Audit Trail        • Evidence & PDF Reports     • Real-time Progress Status
```

### 1. 🔴 Admin Portal (`admin@bgverify.ai` / `AdminPass123!`)
- **Global Dashboard Overview:** Real-time visibility into overall platform throughput, active worker clusters, and cross-tenant metrics.
- **Verification Request Oversight:** Supervise jobs across all registered companies.
- **Human-in-the-Loop Review Queue:** Intervene in cases flagged by AI due to date discrepancies or partial matches before reports are released.
- **Company Accounts:** Inspect registered organizations, KYC verification badges, and grant custom BGCoin credits.
- **Audit & Security Trail:** Append-only, cryptographically hashed ledger tracking every sensitive action.

### 2. 🟡 Company / HR Portal (`hr@acme-corp.com` / `HrPass123!`)
- **HR Dashboard:** Instant view of verified, in-progress, and flagged candidate checks, plus live BGCoin balance.
- **New Verification Dispatch:** Dispatch automated checks (Employment, Education, Identity, Criminal, etc.) costing 1 BGCoin.
- **Candidate Directory:** Register candidates, monitor legal consent status, and view associated credentials.
- **Discrepancy Review Queue:** Review AI-flagged differences between candidate claims and portal records.
- **Wallet & Billing:** One-click BGCoin top-ups with auditable transaction history.

### 3. 🟢 Candidate Portal (`rahul.sharma@example.com` / `CandidatePass123!`)
- **Candidate Hub:** Track personal background screening status across all requested checks.
- **Step 1: Legal Consent:** Digital sign-off complying with Indian DPDP Act and global background screening laws.
- **Step 2: Document Upload:** Upload Aadhaar, Passport, degree certificates, and experience letters.
- **Step 3: Live Selfie Biometric Check:** Capture live camera selfie for automated facial matching against ID cards.
- **Stored Documents:** Access encrypted, timestamped evidence copies stored in the private vault.

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

## ⚙️ High-Level Technical Architecture

```
                  ┌─────────────────────────────────────┐
                  │       React 19 Frontend (Vite)      │
                  │   Tailwind CSS • Dark Theme UI      │
                  └──────────────────┬──────────────────┘
                                     │ REST APIs (JWT Auth)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Express.js / Node.js API       │
                  │   Modular Monolith • Zod Validation │
                  └──────┬────────────────────────┬─────┘
                         │                        │
         Atomic Database │ Operations             │ Enqueue Jobs
                         ▼                        ▼
                  ┌──────────────┐         ┌──────────────┐
                  │   MongoDB    │         │BullMQ + Redis│
                  │ Multi-Tenant │         │ Job Dispatch │
                  └──────────────┘         └──────┬───────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │   Background Worker   │
                                      │  Playwright + Chromium│
                                      └───────────┬───────────┘
                                                  │
                                   ┌──────────────┴──────────────┐
                                   ▼                             ▼
                         ┌──────────────────┐          ┌──────────────────┐
                         │Playwright Browser│          │  AI / OCR Engine │
                         │ Portal Scraper   │          │ LLM Comparator   │
                         └─────────┬────────┘          └─────────┬────────┘
                                   │                             │
                                   └──────────────┬──────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │ Private S3 / Evidence │
                                      │ SHA-256 Hashed Vault  │
                                      └───────────────────────┘
```

---

## 📁 Complete Production-Ready File Structure

```
BGVerify/
├── DOCUMENTS/                                  # Business documentation & specifications
│   ├── BGVerify.txt                            # Full product specification & pricing
│   ├── my_understanding.txt                    # Detailed user roles and walkthrough guide
│   └── BGVerify.docx                           # Original enterprise requirements document
│
├── bgverify-backend/                           # Express.js + TypeScript REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts                     # MongoDB Mongoose connection
│   │   │   └── index.ts                        # Environment variables & constants
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                         # JWT verification & RBAC authorization
│   │   │   ├── errorHandler.ts                 # Centralized HTTP error handling
│   │   │   └── validate.ts                     # Zod request schema validation
│   │   │
│   │   ├── modules/
│   │   │   ├── audit/
│   │   │   │   ├── audit.model.ts              # Immutable audit trail schema
│   │   │   │   └── audit.routes.ts             # Audit trail inspection endpoints
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts          # Login, Register, Profile, Refresh
│   │   │   │   ├── auth.routes.ts              # Authentication routes
│   │   │   │   ├── auth.service.ts             # Token issuance & password hashing
│   │   │   │   └── auth.validation.ts          # Zod authentication schemas
│   │   │   │
│   │   │   ├── candidates/
│   │   │   │   ├── candidate.model.ts          # Candidate profile, docs & consent schema
│   │   │   │   └── candidate.routes.ts         # Candidate CRUD, consent, uploads & selfie
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
│   │   │   │   ├── verification.model.ts       # 14 verification types, AI analysis & evidence
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
│   ├── package.json                            # Backend dependencies & scripts
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
│   │   │   │   ├── CandidatesPage.jsx          # Candidate directory & registration
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

## 📊 Gap Analysis: Done vs. Remaining

| Requirement / Component | Status | Details |
| :--- | :---: | :--- |
| **Backend Express API** | ✅ **Done** | Modular architecture with strict TypeScript compilation. |
| **Multi-Tenant MongoDB Models** | ✅ **Done** | Tenant-scoped `organizationId` isolation, User, Org, Candidate, Verification, Wallet, Audit. |
| **BGCoin Atomic Deductions** | ✅ **Done** | Concurrency-safe atomic `$inc` balance decrements, preventing overspending. |
| **Auditable Transaction Ledger** | ✅ **Done** | Every credit and debit produces a persistent `WalletTransaction` and `AuditLog` entry. |
| **Commercial Package Purchases** | ✅ **Done** | `/api/v1/wallet/purchase` endpoint supporting 100, 500, and 1,000 coin packages. |
| **Candidate Consent & Document Uploads** | ✅ **Done** | Endpoints for legal consent, document storage metadata (SHA-256), and selfie upload. |
| **Admin Portal Frontend** | ✅ **Done** | Dashboard, Verifications Directory, Review Queue, Organizations & Grants, Audit Trail. |
| **Company HR Portal Frontend** | ✅ **Done** | Workspace KPIs, Verification Requests, Candidate Management, Review Queue, Wallet & Ledger. |
| **Candidate Portal Frontend** | ✅ **Done** | Verification Checklist, DPDP Legal Consent, Document Upload, Live Selfie Face Match. |
| **Evidence Viewer & Bot Trail** | ✅ **Done** | Modal displaying side-by-side submitted vs found data, confidence meter, Playwright bot execution trail, and reviewer actions. |
| **Production Build Validation** | ✅ **Done** | Both `bgverify-frontend` and `bgverify-backend` pass `npm run build` with zero errors. |
| **Distributed Queue Workers** | 🟡 *Next Phase* | Standalone BullMQ worker process with Playwright headless scraper and live Redis. |
| **External Payment Gateway** | 🟡 *Next Phase* | Razorpay webhook signature verification for live INR payments. |

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js:** v18+ (v20 recommended)
- **MongoDB:** Running locally on port `27017` or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd bgverify-backend
npm install

# Seed the MongoDB database with realistic demo accounts & data
npm run seed

# Start the backend development server
npm run dev
# Server starts on http://localhost:5000/api/v1
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
| **HR Manager (Acme Corp)** | `hr@acme-corp.com` | `HrPass123!` | 85 BGCoins balance, 3 candidates, active verifications |
| **HR Manager (TechStart)** | `hiring@techstart.io`| `HrPass123!` | 45 BGCoins balance, separate tenant workspace |
| **Candidate (Rahul Sharma)**| `rahul.sharma@example.com` | `CandidatePass123!` | Consent granted, degree and experience documents uploaded |
| **Candidate (Sneha Verma)** | `sneha.verma@example.com` | `CandidatePass123!` | Flagged date discrepancy case in manual review queue |
