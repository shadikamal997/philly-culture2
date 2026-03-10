"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

interface OverviewMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  totalTax: number;
  activeStudents: number;
  totalEnrollments: number;
  completionRate: number;
  topStatesByTax: { state: string; tax: number; count: number }[];
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    totalRevenue: 0,
    revenueThisMonth: 0,
    totalTax: 0,
    activeStudents: 0,
    totalEnrollments: 0,
    completionRate: 0,
    topStatesByTax: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch all enrollments
      const enrollmentsSnap = await getDocs(collection(db, "enrollments"));
      const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total revenue and tax
      let totalRevenue = 0;
      let totalTax = 0;
      let revenueThisMonth = 0;
      const uniqueUsers = new Set();
      const statesTax: Record<string, { tax: number; count: number }> = {};
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      enrollments.forEach((enrollment: any) => {
        totalRevenue += enrollment.totalAmount || 0;
        totalTax += enrollment.taxAmount || 0;
        uniqueUsers.add(enrollment.userEmail);

        // Revenue this month
        if (enrollment.enrolledAt && enrollment.enrolledAt.toDate() >= startOfMonth) {
          revenueThisMonth += enrollment.totalAmount || 0;
        }

        // Tax by state
        const state = enrollment.state || "Unknown";
        if (!statesTax[state]) {
          statesTax[state] = { tax: 0, count: 0 };
        }
        statesTax[state].tax += enrollment.taxAmount || 0;
        statesTax[state].count += 1;
      });

      // Top 5 states by tax
      const topStates = Object.entries(statesTax)
        .map(([state, data]) => ({ state, ...data }))
        .sort((a, b) => b.tax - a.tax)
        .slice(0, 5);

      // Calculate completion rate
      const totalCompletion = enrollments.reduce((sum: number, e: any) => sum + (e.completionPercent || 0), 0);
      const avgCompletion = enrollments.length > 0 ? totalCompletion / enrollments.length : 0;

      setMetrics({
        totalRevenue,
        revenueThisMonth,
        totalTax,
        activeStudents: uniqueUsers.size,
        totalEnrollments: enrollments.length,
        completionRate: Math.round(avgCompletion),
        topStatesByTax: topStates
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your academy.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
              All Time
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${metrics.totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
              MTD
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">This Month</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${metrics.revenueThisMonth.toFixed(2)}
          </p>
        </div>

        {/* Tax Collected */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">🧾</span>
            </div>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full">
              Tax
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tax Collected</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${metrics.totalTax.toFixed(2)}
          </p>
        </div>

        {/* Active Students */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">
              Users
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Students</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.activeStudents}
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Total Enrollments</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{metrics.totalEnrollments}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Course enrollments</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Avg Completion</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{metrics.completionRate}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Student progress</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-xl">💵</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Avg Order Value</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ${metrics.totalEnrollments > 0 ? (metrics.totalRevenue / metrics.totalEnrollments).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Per enrollment</p>
        </div>
      </div>

      {/* Tax by State Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Tax Collection by State
          </h2>
        </div>
        {metrics.topStatesByTax.length > 0 ? (
          <div className="space-y-4">
            {metrics.topStatesByTax.map((item, idx) => (
              <div key={item.state} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.state}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">${item.tax.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({item.count} orders)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-full transition-all duration-500 ease-out group-hover:from-purple-600 group-hover:to-purple-700"
                    style={{
                      width: `${(item.tax / metrics.topStatesByTax[0].tax) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-500 dark:text-gray-400">No tax data yet</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/programs/create"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-700 transition-all group"
          >
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
              <span className="text-xl">➕</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">New Program</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create course</p>
            </div>
          </Link>

          <Link
            href="/admin/students"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Students</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage users</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-300 dark:hover:border-green-700 transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <span className="text-xl">🛒</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Orders</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View history</p>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Analytics</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View reports</p>
            </div>
          </Link>

          <Link
            href="/admin/certificates"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:border-yellow-300 dark:hover:border-yellow-700 transition-all group"
          >
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Certificates</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Issue awards</p>
            </div>
          </Link>

          <Link
            href="/admin/cohorts"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
              <span className="text-xl">👨‍👩‍👧‍👦</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Cohorts</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage groups</p>
            </div>
          </Link>

          <Link
            href="/admin/tax"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-300 dark:hover:border-pink-700 transition-all group"
          >
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Tax Reports</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View tax data</p>
            </div>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
          >
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">Audit Logs</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Security logs</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
