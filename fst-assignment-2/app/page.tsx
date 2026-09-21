import Link from "next/link";
import { Terminal, Shield, Database, Lock, Send, Layers, ArrowRight, CheckCircle2, Cpu } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#0c0f14]">
      {/* Console Top Telemetry Bar */}
      <div className="border-b border-[#232d3d] bg-[#0e131b] px-4 py-1.5 flex items-center justify-between text-[11px] font-mono-tech text-[#57677e]">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">● SYSTEM ONLINE</span>
          <span>//</span>
          <span>DEPT: AI & ML</span>
          <span>//</span>
          <span>COURSE: DJS23AMD302</span>
          <span>//</span>
          <span>ASSIGNMENT 2</span>
        </div>
        <div className="flex items-center gap-4">
          <span>CO3: PROXY RBAC</span>
          <span>CO4: PRISMA & MONGOOSE</span>
        </div>
      </div>

      {/* Main Console Header */}
      <header className="border-b border-[#232d3d] bg-[#0e131b]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-[#18202c] border border-[#3b495e] flex items-center justify-center text-[#00d2ff]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wider text-[#e6edf3] font-mono-tech">
                SECURE<span className="text-[#00d2ff]">OPS</span>
              </span>
              <span className="ml-2 text-[10px] neo-badge neo-badge-neutral">
                CONTROL ROOM
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono-tech text-xs">
            <Link
              href="/login"
              className="neo-button px-3 py-1.5 text-[#8b9bb4] hover:text-[#e6edf3]"
            >
              OPERATOR LOGIN
            </Link>
            <Link
              href="/dashboard"
              className="neo-button-primary px-3 py-1.5 flex items-center gap-1.5"
            >
              <span>ACCESS CONSOLE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Architecture Overview */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="neo-panel p-8 mb-8">
          <div className="text-[10px] font-mono-tech text-[#00d2ff] font-bold uppercase tracking-wider mb-2">
            CYBERSECURITY OPERATIONS CONSOLE // ENTERPRISE RELATIONAL PIPELINE
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#e6edf3] font-mono-tech tracking-tight leading-tight">
            Automated Relational Seeding, Transactional Events & Edge RBAC Gates
          </h1>
          <p className="mt-4 text-sm text-[#8b9bb4] font-mono-tech max-w-3xl leading-relaxed">
            Engineered to fulfill Course Outcomes 3 & 4. Demonstrates defense-in-depth authorization with Better Auth, Next.js Proxy routing, normalized PostgreSQL persistence with Prisma ORM, and Mongoose raw webhook payload archiving.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="neo-button-primary px-4 py-2 font-mono-tech text-xs flex items-center gap-2"
            >
              LAUNCH OPERATIONS CONSOLE <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="neo-button px-4 py-2 font-mono-tech text-xs text-[#8b9bb4]"
            >
              TEST DEMO OPERATOR CLEARANCES
            </Link>
          </div>
        </div>

        {/* 3 Modular Core Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neo-panel overflow-hidden">
            <div className="neo-panel-header flex items-center justify-between">
              <span>01 // DUAL-DATABASE TOPOLOGY</span>
              <Database className="w-3.5 h-3.5 text-[#00d2ff]" />
            </div>
            <div className="p-5 font-mono-tech text-xs space-y-3">
              <div className="text-[#e6edf3] font-bold">PostgreSQL & MongoDB Integration</div>
              <p className="text-[#8b9bb4] text-[11px] leading-relaxed">
                PostgreSQL (Prisma ORM) serves as the authoritative normalized relational store for Users, Roles, Tenants, Memberships, Transactions, and Audit Logs. MongoDB (Mongoose ODM) preserves the raw Resend webhook payload archive.
              </p>
              <div className="neo-badge neo-badge-neutral text-[10px]">
                CO4: PRISMA ORM + MONGOOSE
              </div>
            </div>
          </div>

          <div className="neo-panel overflow-hidden">
            <div className="neo-panel-header flex items-center justify-between">
              <span>02 // BETTER AUTH & PROXY RBAC</span>
              <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
            </div>
            <div className="p-5 font-mono-tech text-xs space-y-3">
              <div className="text-[#e6edf3] font-bold">Multi-Tenant Zero-Trust RBAC</div>
              <p className="text-[#8b9bb4] text-[11px] leading-relaxed">
                Early authentication gating via Node.js runtime Proxy layer. Authoritative membership validation, tenant boundary isolation, and Admin/Member/Guest role enforcement inside Server Actions and Route Handlers.
              </p>
              <div className="neo-badge neo-badge-neutral text-[10px]">
                CO3: BETTER AUTH + PROXY RBAC
              </div>
            </div>
          </div>

          <div className="neo-panel overflow-hidden">
            <div className="neo-panel-header flex items-center justify-between">
              <span>03 // RESEND & WEBHOOK PIPELINE</span>
              <Send className="w-3.5 h-3.5 text-[#00d2ff]" />
            </div>
            <div className="p-5 font-mono-tech text-xs space-y-3">
              <div className="text-[#e6edf3] font-bold">ACID Mutation & Post-Commit Alerts</div>
              <p className="text-[#8b9bb4] text-[11px] leading-relaxed">
                ACID transaction commits Transaction + AuditLog before dispatching React Email via Resend. Inbound webhook endpoint verifies raw request body Svix signatures and enforces providerEventId deduplication.
              </p>
              <div className="neo-badge neo-badge-neutral text-[10px]">
                IDEMPOTENT EVENT PERSISTENCE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Console Strip */}
      <footer className="border-t border-[#232d3d] py-4 bg-[#0e131b]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono-tech text-[#57677e]">
          <div>
            SECUREOPS CONTROL ROOM // DJS AIML SEMESTER V // DJS23AMD302
          </div>
          <div className="flex items-center gap-3">
            <span>PRISMA v6.19</span>
            <span>•</span>
            <span>BETTER AUTH v1.2</span>
            <span>•</span>
            <span>MONGOOSE v8.12</span>
            <span>•</span>
            <span>RESEND v4.1</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
