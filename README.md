# Fullstack Development with Next.js (DJS23AMD302)

**Department:** Department of Artificial Intelligence and Machine Learning  
**Program:** B.Tech. Semester V  
**Student / GitHub User:** [`yashpoojari8706`](https://github.com/yashpoojari8706)  
**Repository:** [https://github.com/yashpoojari8706/FST-Assignment-1-and-2](https://github.com/yashpoojari8706/FST-Assignment-1-and-2)

---

## Workspace Structure

This repository contains academic project submissions for the **Fullstack Development with Next.js** coursework:

```
FST-Assignment-1-and-2/
│
├── fst-assignment-1/    # Assignment 1: Responsive Accessible Component Architecture, Client State Management & End-to-End Type-Safe Form Mutations
│   ├── app/             # Next.js 15 App Router pages & layouts
│   ├── components/      # Pure Server Components & isolated interactive Client leaves
│   ├── actions/         # Native Next.js Server Action ('use server')
│   ├── store/           # Zustand persistent client store (localStorage)
│   ├── lib/             # Shared Zod validation schema & typed catalog
│   ├── README.md        # Comprehensive Assignment 1 documentation & traceability matrix
│   └── TECHNICAL_REPORT.md # 2-3 page academic technical report (RSC vs Client, State, CWV)
│
└── fst-assignment-2/    # Assignment 2: Automated Relational Data Seeding, Transactional Event Notification & Secure Full-Stack Endpoints
    ├── app/             # Next.js App Router (Auth, Dashboard, Transactions, Webhooks)
    ├── actions/         # Server Actions with authoritative RBAC checks
    ├── components/      # UI components & React Email alert templates
    ├── lib/             # Better Auth, Prisma client, MongoDB connection, Services
    ├── prisma/          # Normalized PostgreSQL multi-tenant schema & Faker.js seed
    ├── models/          # Mongoose raw webhook event archive model
    ├── scripts/         # Automated DB reset/seed and E2E verification suites
    ├── tests/           # Vitest RBAC isolation test suite
    ├── docs/            # Architecture documentation (ASSIGNMENT_2_ARCHITECTURE.md)
    └── README.md        # Comprehensive Assignment 2 documentation & quickstart
```

---

## Assignment Summaries

### 1. [Assignment 1: ShopFlow](./fst-assignment-1/)
- **Core Focus:** Accessible component architecture, fine-grained RSC / Client boundaries, persistent Zustand state, shared Zod validation, and native Server Actions.
- **Design Language:** Swiss Tech Minimalism with Bento Grid architecture.
- **Audit Scores:** Lighthouse 100/100 SEO, 100/100 Performance, 0.6s LCP, 0 CLS, 0 ms TBT.
- **Documentation:**
  - 📖 [Assignment 1 README](./fst-assignment-1/README.md)
  - 📑 [Technical Report (2–3 Pages)](./fst-assignment-1/TECHNICAL_REPORT.md)

---

### 2. [Assignment 2: SecureOps](./fst-assignment-2/)
- **Core Focus:** Multi-tenant enterprise security (CO3) and data-driven full-stack endpoints (CO4) integrating PostgreSQL (Prisma ORM) and MongoDB (Mongoose).
- **Key Modules:**
  - **Authentication & RBAC:** Better Auth with password credentials and tenant-scoped permissions (Admin, Member, Guest).
  - **Relational Seeding:** Automated deterministic `@faker-js/faker` pipeline seeding tenants, users, and transactions.
  - **Event Notification Pipeline:** Resend SDK with React Email templates triggered on post-commit transactions.
  - **Webhook Ingestion:** Svix signature verification, idempotency deduplication, and Mongoose payload archiving.
- **Documentation:**
  - 📖 [Assignment 2 README](./fst-assignment-2/README.md)
  - 📑 [Architecture Documentation](./fst-assignment-2/docs/ASSIGNMENT_2_ARCHITECTURE.md)
