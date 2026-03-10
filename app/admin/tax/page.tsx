"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

interface TaxData {
  state: string;
  subtotal: number;
  tax: number;
  total: number;
  count: number;
  orders: {
    date: string;
    state: string;
    subtotal: number;
    tax: number;
    total: number;
    email: string;
  }[];
}

export default function TaxDashboardPage() {
  const [taxByState, setTaxByState] = useState<TaxData[]>([]);
  const [totalTax, setTotalTax] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxData();
  }, []);

  const fetchTaxData = async () => {
    try {
      const enrollmentsSnap = await getDocs(collection(db, "enrollments"));
      const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const statesMap: Record<string, TaxData> = {};
      let totalTaxCollected = 0;
      let totalRevenueCollected = 0;

      enrollments.forEach((enrollment: any) => {
        const state = enrollment.state || "Unknown";
        const subtotal = enrollment.subtotal || 0;
        const tax = enrollment.taxAmount || 0;
        const total = enrollment.totalAmount || 0;

        totalTaxCollected += tax;
        totalRevenueCollected += total;

        if (!statesMap[state]) {
          statesMap[state] = {
            state,
            subtotal: 0,
            tax: 0,
            total: 0,
            count: 0,
            orders: []
          };
        }

        statesMap[state].subtotal += subtotal;
        statesMap[state].tax += tax;
        statesMap[state].total += total;
        statesMap[state].count += 1;

        statesMap[state].orders.push({
          date: enrollment.enrolledAt?.toDate().toLocaleDateString() || "N/A",
          state,
          subtotal,
          tax,
          total,
          email: enrollment.userEmail || "N/A"
        });
      });

      const taxData = Object.values(statesMap).sort((a, b) => b.tax - a.tax);
      setTaxByState(taxData);
      setTotalTax(totalTaxCollected);
      setTotalRevenue(totalRevenueCollected);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tax data:", error);
      setLoading(false);
    }
  };

  const exportCSV = () => {
    // CSV Headers
    let csv = "Date,State,Customer Email,Subtotal,Tax,Total\n";

    // Add all orders
    taxByState.forEach(stateData => {
      stateData.orders.forEach(order => {
        csv += `${order.date},${order.state},${order.email},${order.subtotal.toFixed(2)},${order.tax.toFixed(2)},${order.total.toFixed(2)}\n`;
      });
    });

    // Add summary
    csv += "\n\nTAX SUMMARY BY STATE\n";
    csv += "State,Order Count,Subtotal,Tax Collected,Total Revenue\n";
    taxByState.forEach(stateData => {
      csv += `${stateData.state},${stateData.count},${stateData.subtotal.toFixed(2)},${stateData.tax.toFixed(2)},${stateData.total.toFixed(2)}\n`;
    });

    csv += `\nTOTAL,,${taxByState.reduce((sum, s) => sum + s.subtotal, 0).toFixed(2)},${totalTax.toFixed(2)},${totalRevenue.toFixed(2)}\n`;

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading tax data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tax Dashboard</h1>
          <p className="text-gray-600">US Sales Tax Compliance</p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Tax Collected</h3>
          <p className="text-3xl font-bold text-purple-600">${totalTax.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Including tax</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Tax Rate (Avg)</h3>
          <p className="text-3xl font-bold text-blue-600">
            {totalRevenue > 0 ? ((totalTax / (totalRevenue - totalTax)) * 100).toFixed(2) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Effective rate</p>
        </div>
      </div>

      {/* Tax by State Table */}
      <div className="bg-white border rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Tax by State</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {taxByState.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No tax data yet
                  </td>
                </tr>
              ) : (
                taxByState.map((stateData) => {
                  const taxRate = stateData.subtotal > 0 
                    ? (stateData.tax / stateData.subtotal) * 100 
                    : 0;

                  return (
                    <tr key={stateData.state} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{stateData.state}</td>
                      <td className="px-6 py-4 text-right">{stateData.count}</td>
                      <td className="px-6 py-4 text-right">${stateData.subtotal.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-purple-600">
                        ${stateData.tax.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        ${stateData.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {taxRate.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {taxByState.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 font-semibold">
                <tr>
                  <td className="px-6 py-4">TOTAL</td>
                  <td className="px-6 py-4 text-right">
                    {taxByState.reduce((sum, s) => sum + s.count, 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ${taxByState.reduce((sum, s) => sum + s.subtotal, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-purple-600">
                    ${totalTax.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ${totalRevenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Tax Breakdown Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Tax Distribution by State</h2>
        <div className="space-y-4">
          {taxByState.slice(0, 10).map((stateData) => {
            const percentage = totalTax > 0 ? (stateData.tax / totalTax) * 100 : 0;
            
            return (
              <div key={stateData.state}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{stateData.state}</span>
                  <span className="text-sm text-gray-600">
                    ${stateData.tax.toFixed(2)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax Compliance Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Tax Compliance Information</h3>
            <p className="text-blue-800 text-sm mb-2">
              This report shows US sales tax collected through Stripe Tax. Stripe automatically calculates and applies the correct tax rate based on the customer's location.
            </p>
            <p className="text-blue-800 text-sm">
              Download the CSV report monthly for your accountant or tax filing purposes. Keep these records for at least 7 years for IRS compliance.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
