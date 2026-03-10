"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

interface ProgramStats {
  id: string;
  title: string;
  programType: string;
  enrollments: number;
  revenue: number;
  avgCompletion: number;
  basePrice: number;
}

export default function AnalyticsPage() {
  const [programs, setPrograms] = useState<ProgramStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueByType, setRevenueByType] = useState<Record<string, number>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all programs
      const programsSnap = await getDocs(collection(db, "programs"));
      const programsData = programsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all enrollments
      const enrollmentsSnap = await getDocs(collection(db, "enrollments"));
      const enrollments = enrollmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate program stats
      const programStats: ProgramStats[] = [];
      const revenueByTypeMap: Record<string, number> = {};
      let totalRev = 0;

      programsData.forEach((program: any) => {
        const programEnrollments = enrollments.filter((e: any) => e.programId === program.id);
        const revenue = programEnrollments.reduce((sum: number, e: any) => sum + (e.totalAmount || 0), 0);
        const avgCompletion = programEnrollments.length > 0
          ? programEnrollments.reduce((sum: number, e: any) => sum + (e.completionPercent || 0), 0) / programEnrollments.length
          : 0;

        programStats.push({
          id: program.id,
          title: program.title,
          programType: program.programType || "other",
          enrollments: programEnrollments.length,
          revenue,
          avgCompletion,
          basePrice: program.basePrice || 0
        });

        const type = program.programType || "other";
        if (!revenueByTypeMap[type]) {
          revenueByTypeMap[type] = 0;
        }
        revenueByTypeMap[type] += revenue;
        totalRev += revenue;
      });

      programStats.sort((a, b) => b.revenue - a.revenue);

      setPrograms(programStats);
      setRevenueByType(revenueByTypeMap);
      setTotalRevenue(totalRev);
      setTotalEnrollments(enrollments.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </main>
    );
  }

  const avgOrderValue = totalEnrollments > 0 ? totalRevenue / totalEnrollments : 0;
  const overallCompletion = programs.reduce((sum, p) => sum + (p.avgCompletion * p.enrollments), 0) / 
                            (totalEnrollments || 1);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Program Analytics</h1>
        <p className="text-gray-600">Performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Enrollments</h3>
          <p className="text-3xl font-bold text-blue-600">{totalEnrollments}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">${avgOrderValue.toFixed(2)}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Completion</h3>
          <p className="text-3xl font-bold text-orange-600">{overallCompletion.toFixed(1)}%</p>
        </div>
      </div>

      {/* Revenue by Program Type */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Revenue by Program Type</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(revenueByType).map(([type, revenue]) => {
            const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
            const count = programs.filter(p => p.programType === type).length;
            const enrollments = programs
              .filter(p => p.programType === type)
              .reduce((sum, p) => sum + p.enrollments, 0);

            return (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{type}</h3>
                  <span className="text-sm text-gray-600">{count} {count === 1 ? 'program' : 'programs'}</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mb-1">${revenue.toFixed(2)}</p>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>{enrollments} enrollments</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Performance Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Program Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Enrollments</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Avg Completion</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No programs yet
                  </td>
                </tr>
              ) : (
                programs.map((program) => {
                  const revenuePercentage = totalRevenue > 0 ? (program.revenue / totalRevenue) * 100 : 0;

                  return (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{program.title}</td>
                      <td className="px-6 py-4 capitalize">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {program.programType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">${program.basePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-semibold">{program.enrollments}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        ${program.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${
                          program.avgCompletion >= 80 ? 'text-green-600' :
                          program.avgCompletion >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {program.avgCompletion.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {revenuePercentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">🏆 Top Performers (Revenue)</h3>
          <div className="space-y-3">
            {programs.slice(0, 5).map((program, index) => (
              <div key={program.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-800">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{program.title}</p>
                  <p className="text-sm text-gray-600">{program.enrollments} enrollments</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${program.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Leaders */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">✅ Best Completion Rates</h3>
          <div className="space-y-3">
            {programs
              .filter(p => p.enrollments > 0)
              .sort((a, b) => b.avgCompletion - a.avgCompletion)
              .slice(0, 5)
              .map((program, index) => (
              <div key={program.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-800">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{program.title}</p>
                  <p className="text-sm text-gray-600">{program.enrollments} students</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{program.avgCompletion.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
