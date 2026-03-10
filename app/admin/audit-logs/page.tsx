"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface AuditLog {
  id: string;
  action: string;
  adminId?: string;
  adminEmail?: string;
  targetId?: string;
  targetType?: string;
  details?: any;
  refundAmount?: number;
  timestamp: Date;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "refund" | "access" | "certificate">("all");
  const [limitCount, setLimitCount] = useState(50);

  useEffect(() => {
    fetchLogs();
  }, [limitCount]);

  const fetchLogs = async () => {
    try {
      const q = query(
        collection(db, "adminLogs"),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const snap = await getDocs(q);
      const logsData: AuditLog[] = snap.docs.map(doc => ({
        id: doc.id,
        action: doc.data().action || "unknown",
        adminId: doc.data().adminId,
        adminEmail: doc.data().adminEmail,
        targetId: doc.data().targetId,
        targetType: doc.data().targetType,
        details: doc.data().details,
        refundAmount: doc.data().refundAmount,
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      setLogs(logsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setLoading(false);
    }
  };

  const exportLogsCSV = () => {
    let csv = "Timestamp,Action,Admin,Target ID,Details,Amount\n";
    
    const filteredLogs = getFilteredLogs();
    filteredLogs.forEach(log => {
      const timestamp = log.timestamp.toLocaleString();
      const action = log.action;
      const admin = log.adminEmail || "System";
      const targetId = log.targetId || "-";
      const details = JSON.stringify(log.details || {}).replace(/,/g, ';');
      const amount = log.refundAmount ? `$${log.refundAmount.toFixed(2)}` : "-";
      
      csv += `"${timestamp}","${action}","${admin}","${targetId}","${details}","${amount}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredLogs = () => {
    if (filter === "all") return logs;
    if (filter === "refund") return logs.filter(l => l.action.includes("refund"));
    if (filter === "access") return logs.filter(l => l.action.includes("access") || l.action.includes("revoke") || l.action.includes("extend"));
    if (filter === "certificate") return logs.filter(l => l.action.includes("certificate"));
    return logs;
  };

  const getActionIcon = (action: string) => {
    if (action.includes("refund")) return "💰";
    if (action.includes("certificate")) return "📜";
    if (action.includes("revoke") || action.includes("access")) return "🔒";
    if (action.includes("extend")) return "📅";
    if (action.includes("close")) return "🚫";
    return "📝";
  };

  const getActionColor = (action: string) => {
    if (action.includes("refund")) return "text-red-600";
    if (action.includes("certificate")) return "text-green-600";
    if (action.includes("revoke")) return "text-red-600";
    if (action.includes("extend")) return "text-blue-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading audit logs...</p>
        </div>
      </main>
    );
  }

  const filteredLogs = getFilteredLogs();
  const refundActions = logs.filter(l => l.action.includes("refund")).length;
  const accessActions = logs.filter(l => l.action.includes("access") || l.action.includes("revoke") || l.action.includes("extend")).length;
  const certificateActions = logs.filter(l => l.action.includes("certificate")).length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
          <p className="text-gray-600">Track all admin actions and system events</p>
        </div>
        <button
          onClick={exportLogsCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Logs</h3>
          <p className="text-3xl font-bold text-blue-600">{logs.length}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Refund Actions</h3>
          <p className="text-3xl font-bold text-red-600">{refundActions}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Access Changes</h3>
          <p className="text-3xl font-bold text-orange-600">{accessActions}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Certificates</h3>
          <p className="text-3xl font-bold text-green-600">{certificateActions}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded font-semibold ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilter("refund")}
            className={`px-4 py-2 rounded font-semibold ${
              filter === "refund"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Refunds ({refundActions})
          </button>
          <button
            onClick={() => setFilter("access")}
            className={`px-4 py-2 rounded font-semibold ${
              filter === "access"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Access ({accessActions})
          </button>
          <button
            onClick={() => setFilter("certificate")}
            className={`px-4 py-2 rounded font-semibold ${
              filter === "certificate"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Certificates ({certificateActions})
          </button>
        </div>

        <select
          value={limitCount}
          onChange={(e) => setLimitCount(Number(e.target.value))}
          className="border rounded px-3 py-2"
        >
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={250}>Last 250</option>
          <option value={500}>Last 500</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Target ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No audit logs yet
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold">{log.timestamp.toLocaleDateString()}</p>
                        <p className="text-gray-600">{log.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getActionIcon(log.action)}</span>
                        <span className={`font-semibold ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.adminEmail || "System"}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {log.targetId ? log.targetId.substring(0, 12) + "..." : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.refundAmount && (
                        <span className="font-semibold text-red-600">
                          ${log.refundAmount.toFixed(2)}
                        </span>
                      )}
                      {log.details && (
                        <span className="text-gray-600">
                          {typeof log.details === "string" ? log.details : JSON.stringify(log.details).substring(0, 50)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">🔒 Security & Compliance</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• All admin actions are automatically logged with timestamps</li>
          <li>• Logs include admin identity, target resource, and action details</li>
          <li>• Export logs to CSV for compliance and security audits</li>
          <li>• Logs are immutable and stored permanently in Firestore</li>
          <li>• Review logs regularly to monitor admin activity</li>
        </ul>
      </div>
    </main>
  );
}
