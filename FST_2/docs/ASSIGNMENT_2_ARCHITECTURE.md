# ASSIGNMENT 2: SYSTEM ARCHITECTURE & VERIFICATION NOTE
**Department:** Artificial Intelligence and Machine Learning | **Course:** Fullstack Development with Next.js (DJS23AMD302)  
**Project:** SecureOps — Multi-Tenant Relational Seeding, Event Notification & Secure Full-Stack Endpoints  
**Course Outcomes:** CO3 (Better Auth Session & Proxy RBAC) & CO4 (Prisma PostgreSQL & Mongoose MongoDB)

---

## 1. RELATIONAL & OBJECT DATA ARCHITECTURE

SecureOps implements a normalized relational database design via **Prisma ORM (PostgreSQL)** paired with an asynchronous document archive via **Mongoose ODM (MongoDB)**.

```mermaid
erDiagram
    USER ||--o{ SESSION : "maintains"
    USER ||--o{ ACCOUNT : "authenticates"
    USER ||--o{ MEMBERSHIP : "belongs to"
    TENANT ||--o{ MEMBERSHIP : "enrolls"
    ROLE ||--o{ MEMBERSHIP : "defines permissions"
    TENANT ||--o{ TRANSACTION : "contains"
    USER ||--o{ TRANSACTION : "creates"
    TENANT ||--o{ AUDIT_LOG : "records"
    USER ||--o{ AUDIT_LOG : "triggers"
    TENANT ||--o{ EMAIL_EVENT : "tracks"
    TRANSACTION ||--o{ EMAIL_EVENT : "notifies"

    USER {
        string id PK
        string name
        string email UK
        boolean emailVerified
    }
    TENANT {
        string id PK
        string name
        string slug UK
    }
    ROLE {
        string id PK
        enum name "ADMIN | MEMBER | GUEST"
    }
    MEMBERSHIP {
        string id PK
        string userId FK
        string tenantId FK
        string roleId FK
    }
    TRANSACTION {
        string id PK
        string tenantId FK
        string createdByUserId FK
        string reference UK
        decimal amount
        enum status "COMPLETED | PENDING | FAILED"
    }
    AUDIT_LOG {
        string id PK
        string tenantId FK
        string actorUserId FK
        string action
        string entity
        json metadata
    }
    EMAIL_EVENT {
        string id PK
        string tenantId FK
        string transactionId FK
        string providerEventId UK
        string providerMessageId
        enum eventType "SENT | DELIVERED | BOUNCED | FAILED"
        enum source "SEED | RESEND_WEBHOOK"
    }
```

### Dual-Database Distinction (CO4 Fulfillment)
1. **PostgreSQL / Prisma ORM (Authoritative)**: Strictly normalized relational models maintaining ACID transactions, foreign-key integrity, multi-tenant boundaries, and structured audit trails.
2. **MongoDB / Mongoose ODM (Raw Archive)**: Stores unmutated raw webhook event bodies (`rawBody`), parsed JSON structures, and ingestion metrics in `ResendWebhookArchive`.

---

## 2. DEFENSE-IN-DEPTH AUTHORIZATION & PROXY RBAC (CO3)

SecureOps implements strict zero-trust multi-tier authorization. No client-provided user IDs, tenant identifiers, or role claims are ever trusted.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser Client
    participant Proxy as proxy.ts (Node.js Gate)
    participant Auth as Better Auth Session
    participant Route as Server Action / Route Handler
    participant RBAC as Tenant RBAC Engine
    participant Postgres as PostgreSQL (Prisma ACID)
    participant Resend as Resend / React Email
    participant Mongo as MongoDB (Mongoose)

    Client->>Proxy: Request Protected Resource (/dashboard/*, /api/*)
    Proxy->>Proxy: Evaluate session cookie presence
    alt No Session
        Proxy-->>Client: 401 Unauthorized / Redirect to /login
    else Session Present
        Proxy->>Route: Pass to Server Segment
    end

    Route->>Auth: Authoritative getSession(headers)
    Auth-->>Route: Verified User Context (id, email)
    Route->>RBAC: requireTenantAccess(tenantId, permission)
    RBAC->>Postgres: Verify Membership[userId, tenantId] & Role
    alt Access Denied
        RBAC-->>Route: Throw 403 Forbidden (TENANT_ACCESS_DENIED)
        Route-->>Client: 403 Forbidden Error
    else Clearance Verified
        Route->>Postgres: BEGIN Transaction [Create Tx + Create AuditLog]
        Postgres-->>Route: COMMIT (ACID Guaranteed)
        Route->>Resend: Awaited Post-Commit React Email Dispatch
        Resend-->>Route: Provider Message ID
        Route-->>Client: Structured Success Response
    end

    Note over Resend,Mongo: Asynchronous Inbound Webhook Lifecycle
    Resend->>Route: Inbound Webhook Event (/api/webhooks/resend)
    Route->>Route: Verify Svix Signature on raw request.text()
    Route->>Postgres: providerEventId deduplication check & write EmailEvent
    Route->>Mongo: Archive raw body string & payload to ResendWebhookArchive
```

---

## 3. TRANSACTIONAL NOTIFICATION & WEBHOOK LIFECYCLE

```
[Prisma ACID Mutation]
  BEGIN
    INSERT INTO "transaction" (id, reference, amount, status) VALUES ('tx_101', 'TX-781923', 5000.00, 'COMPLETED');
    INSERT INTO "audit_log" (action, entity, actorUserId) VALUES ('TRANSACTION_CREATED', 'Transaction', 'usr_admin');
  COMMIT;
      │
      ▼
[Awaited Resend Dispatch] 
  --> Render React Email template: TransactionAlertEmail.tsx
  --> Resend API Response: { id: "msg_98f12a", status: "success" }
      │
      ▼
[Svix Webhook Delivery] (/api/webhooks/resend)
  --> Validate Headers: svix-id, svix-timestamp, svix-signature with request.text()
  --> PostgreSQL Check: Check if providerEventId 'evt_39210' exists (Idempotency)
  --> PostgreSQL Write: INSERT INTO "email_event" (eventType='DELIVERED', source='RESEND_WEBHOOK')
  --> MongoDB Mongoose: Upsert ResendWebhookArchive { providerEventId, rawBody, processingStatus='PROCESSED' }
```

### Verified Local Demo Credentials
- **Admin**: `admin@secureops.dev` / `SecureOps123!` (Full Tenant Management & Audit Logs)
- **Member**: `member@secureops.dev` / `SecureOps123!` (Create & Inspect Transactions)
- **Guest**: `guest@secureops.dev` / `SecureOps123!` (Read-only metrics, mutation restricted)
