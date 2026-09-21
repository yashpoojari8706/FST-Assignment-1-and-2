# SecureOps — Automated Relational Data Seeding, Transactional Event Notification & Secure Full-Stack Endpoints

**Department:** Department of Artificial Intelligence and Machine Learning  
**Program:** B.Tech. Semester V | **Subject:** Fullstack Development with Next.js (DJS23AMD302)  
**Assignment:** Assignment 2 | **Target Outcomes:** CO3 & CO4  

---

## 1. Executive Summary & Objective

**SecureOps** is an enterprise-grade, multi-tenant transaction security platform demonstrating:
- **CO3**: Multi-tenant session validation and role-based access control (RBAC) via **Better Auth** and Next.js **Proxy/Middleware** security gates.
- **CO4**: Data-driven full-stack endpoints integrating relational platforms via **Prisma ORM (PostgreSQL)** and object document storage via **Mongoose (MongoDB)**.

---

## 2. Technology Stack & Key Versions

| Layer / Technology | Component | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Full-stack server components, Server Actions & Route Handlers |
| **Authentication** | Better Auth 1.2+ | Prisma adapter, session validation, password accounts |
| **Relational Database** | PostgreSQL 16 + Prisma ORM 6+ | Normalized multi-tenant models, ACID transactions, foreign-key integrity |
| **Object Database** | MongoDB 7 + Mongoose 8+ | Flexible raw Resend webhook payload archive |
| **Data Generation** | @faker-js/faker 9+ | Localized automated relational database seeding |
| **Email & Alerts** | Resend SDK 4+ & React Email 3+ | Transaction alert templates & post-commit notifications |
| **Webhook Security** | Svix 1.6+ | Raw request body signature verification & idempotency |
| **Testing** | Vitest 3+ & TSX | RBAC matrix, tenant isolation, and payload validation suites |

---

## 3. Requirement Traceability Matrix

| Official Assignment 2 Requirement | Implementation Strategy | Exact Source File(s) | Verification Status |
| :--- | :--- | :--- | :--- |
| **Normalized Prisma Relational Schema** | Defined `User`, `Tenant`, `Role`, `Membership`, `Transaction`, `AuditLog`, `EmailEvent` | [`prisma/schema.prisma`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/prisma/schema.prisma) | ✅ PASS |
| **Automated Faker.js Seeding** | Deterministic multi-tenant seed generating 3 roles, 3 tenants, 23 users, 55 transactions | [`prisma/seed.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/prisma/seed.ts) | ✅ PASS |
| **Reset & Seed Pipeline** | Single-pass TypeScript CLI executing push, client generation, and seeding | [`scripts/db-reset-seed.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/scripts/db-reset-seed.ts) | ✅ PASS |
| **Better Auth Multi-Tenant RBAC** | Prisma adapter, password credentials, and tenant-scoped role checks | [`lib/auth.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/lib/auth.ts), [`lib/authorization/`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/lib/authorization/) | ✅ PASS |
| **Proxy / Middleware Auth Gate** | Node.js runtime early auth gate rejecting unauthenticated requests | [`proxy.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/proxy.ts), [`middleware.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/middleware.ts) | ✅ PASS |
| **Protected Server Actions & Routes** | Authoritative backend session, tenant bounds, and role checks | [`actions/transactions.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/actions/transactions.ts), [`app/api/transactions/route.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/app/api/transactions/route.ts) | ✅ PASS |
| **React Email & Resend Alerts** | Accessible email template and post-commit notification service | [`components/emails/TransactionAlertEmail.tsx`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/components/emails/TransactionAlertEmail.tsx), [`lib/services/email-service.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/lib/services/email-service.ts) | ✅ PASS |
| **Resend Webhook & Idempotency** | Raw-body Svix verification, `providerEventId` unique index deduplication | [`app/api/webhooks/resend/route.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/app/api/webhooks/resend/route.ts) | ✅ PASS |
| **Mongoose Object Database (CO4)** | MongoDB connection and raw webhook event archiving model | [`lib/mongodb.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/lib/mongodb.ts), [`models/ResendWebhookArchive.ts`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/models/ResendWebhookArchive.ts) | ✅ PASS |
| **2-Page Architecture Note** | Complete architectural document with Mermaid diagrams | [`docs/ASSIGNMENT_2_ARCHITECTURE.md`](file:///d:/SCIENCE/DJS%20AIML/SEM%205/FST_2/docs/ASSIGNMENT_2_ARCHITECTURE.md) | ✅ PASS |

---

## 4. Local Quickstart & Verification Guide

### Step 1: Start Database Containers
```bash
docker compose up -d
```
*Spins up PostgreSQL 16 on port 5432 and MongoDB 7 on port 27017.*

### Step 2: Run Database Reset & Automated Faker Seeder
```bash
npm run db:reset-seed
```

### Step 3: Run Vitest & E2E Verification Suites
```bash
npm test
npm run verify:all
```

### Step 4: Launch Application
```bash
npm run dev
```
Open **http://localhost:3000** and sign in using the seeded demo credentials:
- **Admin**: `admin@secureops.dev` / `SecureOps123!` (Apex Global Holdings — Admin)
- **Member**: `member@secureops.dev` / `SecureOps123!` (Apex Global Holdings — Member)
- **Guest**: `guest@secureops.dev` / `SecureOps123!` (Apex Global Holdings — Guest)
