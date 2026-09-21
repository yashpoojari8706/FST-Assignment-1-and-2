"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Terminal, Shield, ArrowRight, AlertCircle, Key, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@secureops.dev");
  const [password, setPassword] = useState("SecureOps123!");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "AUTHENTICATION FAILED: INVALID CREDENTIALS");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "SESSION INITIALIZATION FAILED");
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("SecureOps123!");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0c0f14]">
      <div className="w-full max-w-md neo-panel shadow-2xl overflow-hidden">
        {/* Console Header */}
        <div className="neo-panel-header flex items-center justify-between">
          <span>SECURITY GATE // AUTHENTICATION</span>
          <span className="text-[10px] font-mono-tech text-[#00d2ff]">BETTER-AUTH v1.2</span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded bg-[#18202c] border border-[#3b495e] flex items-center justify-center text-[#00d2ff]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#e6edf3] font-mono-tech">
                SECURE<span className="text-[#00d2ff]">OPS</span> CONSOLE
              </h1>
              <p className="text-[11px] text-[#57677e] font-mono-tech">
                NODE-RUNTIME PROXY ACCESS GATE
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-2.5 rounded neo-badge-danger w-full text-xs font-mono-tech flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-mono-tech text-xs">
            <div>
              <label className="block text-[#57677e] font-bold uppercase mb-1.5">
                OPERATOR IDENTIFIER (EMAIL)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#0e131b] border border-[#232d3d] text-[#e6edf3] focus:outline-none focus:border-[#00d2ff]"
                placeholder="operator@secureops.dev"
              />
            </div>

            <div>
              <label className="block text-[#57677e] font-bold uppercase mb-1.5">
                SECURITY SECRET (PASSWORD)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#0e131b] border border-[#232d3d] text-[#e6edf3] focus:outline-none focus:border-[#00d2ff]"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 neo-button-primary flex items-center justify-center gap-2 font-mono-tech mt-2"
            >
              {loading ? (
                <span>VALIDATING SESSION CREDENTIALS...</span>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>INITIALIZE OPERATOR SESSION</span>
                </>
              )}
            </button>
          </form>

          {/* Seed Operator Fast-Fill Palette */}
          <div className="mt-6 pt-5 border-t border-[#232d3d]">
            <div className="text-[10px] font-bold text-[#57677e] uppercase font-mono-tech mb-2.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#00d2ff]" /> FAST-FILL SEEDED DEMO CLEARANCES:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser("admin@secureops.dev")}
                className={`py-1.5 px-2 rounded text-[11px] font-mono-tech font-bold border text-center transition ${
                  email === "admin@secureops.dev"
                    ? "bg-[#18202c] border-[#00d2ff] text-[#00d2ff]"
                    : "bg-[#0e131b] border-[#232d3d] text-[#8b9bb4] hover:border-[#3b495e]"
                }`}
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => setDemoUser("member@secureops.dev")}
                className={`py-1.5 px-2 rounded text-[11px] font-mono-tech font-bold border text-center transition ${
                  email === "member@secureops.dev"
                    ? "bg-[#18202c] border-[#00d2ff] text-[#00d2ff]"
                    : "bg-[#0e131b] border-[#232d3d] text-[#8b9bb4] hover:border-[#3b495e]"
                }`}
              >
                MEMBER
              </button>
              <button
                type="button"
                onClick={() => setDemoUser("guest@secureops.dev")}
                className={`py-1.5 px-2 rounded text-[11px] font-mono-tech font-bold border text-center transition ${
                  email === "guest@secureops.dev"
                    ? "bg-[#18202c] border-[#00d2ff] text-[#00d2ff]"
                    : "bg-[#0e131b] border-[#232d3d] text-[#8b9bb4] hover:border-[#3b495e]"
                }`}
              >
                GUEST
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-[10px] font-mono-tech text-[#57677e] hover:text-[#8b9bb4]">
              ← SYSTEM TOPOLOGY & ARCHITECTURE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
