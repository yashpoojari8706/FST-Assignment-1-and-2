import Link from "next/link";
import { Terminal, ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0c0f14]">
      <div className="w-full max-w-md neo-panel shadow-2xl overflow-hidden text-center">
        <div className="neo-panel-header flex items-center justify-between">
          <span>SECURITY ACCESS GATE // 403 FORBIDDEN</span>
          <span className="neo-badge neo-badge-danger">DENIED</span>
        </div>
        <div className="p-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded bg-[#18202c] border border-red-800 text-red-400 mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-base font-bold text-[#e6edf3] font-mono-tech mb-1">
            CLEARANCE REJECTION // RBAC 403
          </h1>
          <p className="text-xs text-[#8b9bb4] font-mono-tech mb-5">
            Your active operator identity lacks the required permission clearance or tenant membership to access this segment.
          </p>
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="neo-button px-4 py-2 font-mono-tech text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> RETURN TO CONSOLE OVERVIEW
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
