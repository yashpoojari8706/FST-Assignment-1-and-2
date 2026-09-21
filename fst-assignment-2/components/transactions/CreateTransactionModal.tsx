"use client";

import { useState } from "react";
import { createTransactionAction } from "@/actions/transactions";
import { Plus, X, Send, AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateTransactionModalProps {
  tenantId: string;
  userEmail: string;
}

export function CreateTransactionModal({
  tenantId,
  userEmail,
}: CreateTransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("5000");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("Q3 Cloud Security Provisioning");
  const [recipientEmail, setRecipientEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg(null);

    try {
      const res = await createTransactionAction({
        tenantId,
        amount: parseFloat(amount),
        currency,
        description,
        recipientEmail,
      });

      if (res.success && res.data) {
        setResultMsg({
          success: true,
          text: `TX [${res.data.transaction.reference}] COMMITTED. NOTIFICATION: ${
            res.data.emailDispatch.success ? "DISPATCHED" : "POST-COMMIT QUEUED"
          }`,
        });
        setTimeout(() => {
          setIsOpen(false);
          setResultMsg(null);
        }, 1800);
      } else {
        setResultMsg({
          success: false,
          text: res.error?.message || "TRANSACTION MUTATION FAILED",
        });
      }
    } catch (err: unknown) {
      setResultMsg({
        success: false,
        text: err instanceof Error ? err.message : "SYSTEM MUTATION ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="neo-button-primary px-3 py-1.5 flex items-center gap-1.5 font-mono-tech"
      >
        <Plus className="w-3.5 h-3.5" /> INITIATE TRANSACTION
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none">
          <div className="neo-panel w-full max-w-md shadow-2xl overflow-hidden">
            <div className="neo-panel-header flex items-center justify-between">
              <span>MUTATION CONSOLE // NEW TRANSACTION</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8b9bb4] hover:text-[#e6edf3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-[11px] font-mono-tech text-[#8b9bb4] mb-4">
                Executes ACID commit in PostgreSQL (Transaction + AuditLog) and triggers awaited Resend React Email alert.
              </p>

              {resultMsg && (
                <div
                  className={`mb-4 p-2.5 rounded text-xs font-mono-tech flex items-center gap-2 ${
                    resultMsg.success
                      ? "neo-badge-success w-full"
                      : "neo-badge-danger w-full"
                  }`}
                >
                  <span>{resultMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono-tech">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[#57677e] font-bold mb-1 uppercase">
                      AMOUNT (DECIMAL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 rounded bg-[#0c0f14] border border-[#232d3d] text-[#e6edf3] focus:outline-none focus:border-[#00d2ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#57677e] font-bold mb-1 uppercase">
                      CURRENCY
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#0c0f14] border border-[#232d3d] text-[#e6edf3] focus:outline-none focus:border-[#00d2ff]"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#57677e] font-bold mb-1 uppercase">
                    DESCRIPTION / AUDIT NOTE
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded bg-[#0c0f14] border border-[#232d3d] text-[#e6edf3] focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#57677e] font-bold mb-1 uppercase">
                    NOTIFICATION RECIPIENT (RESEND)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded bg-[#0c0f14] border border-[#232d3d] text-[#e6edf3] focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#232d3d]">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="neo-button px-3 py-1.5"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="neo-button-primary px-3 py-1.5 flex items-center gap-1.5"
                  >
                    {loading ? "COMMITTING ACID..." : "COMMIT MUTATION"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
