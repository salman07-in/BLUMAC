import React from "react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertTriangle,
  History,
  CheckCircle2,
  Users,
  Terminal,
} from "lucide-react";

export const metadata = {
  title: "Security & Audit Logs | BLUMAC Korean Store Admin",
};

export default async function AdminSecurityPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: true },
  });

  const adminUsers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blumac-copper uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4" />
            <span>Cybersecurity & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-blumac-navy">
            Enterprise Security & Audit Trail
          </h1>
          <p className="text-xs text-blumac-slate">
            Immutable system logs, administrator access records, and platform defense posture.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>System Posture: Hardened</span>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="text-xs font-bold uppercase tracking-wider">Gateway Encryption</span>
            <Lock className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-lg font-bold text-blumac-navy">AES-256 GCM</p>
          <p className="text-[11px] text-emerald-600 font-medium">SSL / TLS 1.3 Active</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="text-xs font-bold uppercase tracking-wider">2FA Master PIN</span>
            <KeyRound className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-lg font-bold text-blumac-navy">Enforced</p>
          <p className="text-[11px] text-blumac-slate font-medium">Secondary Challenge Required</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="text-xs font-bold uppercase tracking-wider">Session Policy</span>
            <ShieldCheck className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-lg font-bold text-blumac-navy">HTTP-Only Lax</p>
          <p className="text-[11px] text-emerald-600 font-medium">XSS & CSRF Mitigated</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-blumac-slate">
            <span className="text-xs font-bold uppercase tracking-wider">Authorized Admins</span>
            <Users className="w-4 h-4 text-blumac-copper" />
          </div>
          <p className="text-lg font-bold text-blumac-navy">{adminUsers.length} Operators</p>
          <p className="text-[11px] text-blumac-slate font-medium">Privileged Accounts</p>
        </div>
      </div>

      {/* Authorized Admins List */}
      <div className="bg-white rounded-2xl p-6 border border-blumac-beige shadow-subtle space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blumac-navy flex items-center gap-2">
          <Users className="w-4 h-4 text-blumac-copper" />
          <span>Authorized Administrative Operators</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminUsers.map((admin) => (
            <div
              key={admin.id}
              className="p-4 rounded-xl bg-blumac-ivory border border-blumac-beige flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blumac-navy text-white flex items-center justify-center font-bold text-xs">
                  {admin.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-blumac-navy">{admin.name}</p>
                  <p className="text-[11px] text-blumac-slate">{admin.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blumac-navy text-white text-[10px] font-bold uppercase tracking-wider">
                {admin.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-white rounded-2xl border border-blumac-beige shadow-card overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-blumac-beige pb-4">
          <div>
            <h2 className="text-base font-bold text-blumac-navy flex items-center gap-2">
              <History className="w-4 h-4 text-blumac-copper" />
              <span>Real-Time Security Audit Log</span>
            </h2>
            <p className="text-xs text-blumac-slate mt-0.5">
              Chronological log of administrative logins, operational actions, and resource modifications.
            </p>
          </div>
          <span className="text-xs font-mono text-blumac-copper font-bold">
            Showing Last 50 Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blumac-navy text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-4 font-bold">Resource Target</th>
                <th className="py-3 px-4 font-bold">Actor</th>
                <th className="py-3 px-4 font-bold">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blumac-beige">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-blumac-slate">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  const isSuccess = log.action.includes("SUCCESS") || log.action.includes("CREATED") || log.action.includes("RESTOCK");
                  const isAlert = log.action.includes("UNAUTHORIZED") || log.action.includes("FAILED");

                  return (
                    <tr key={log.id} className="hover:bg-blumac-ivory/50 transition-colors">
                      <td className="py-3 px-4 text-blumac-slate whitespace-nowrap font-mono text-[11px]">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isAlert
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : isSuccess
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blumac-navy">
                        {log.resource}
                      </td>
                      <td className="py-3 px-4 text-blumac-slate">
                        {log.user ? (
                          <span className="font-semibold text-blumac-navy">{log.user.name}</span>
                        ) : (
                          <span className="italic text-gray-400">System Gateway</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-blumac-charcoal max-w-xs truncate">
                        {log.details || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
