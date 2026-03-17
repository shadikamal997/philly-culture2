'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';

interface Order {
  id: string;
  orderId: string;
  total: number;
  status: string;
  createdAt: Date;
  programSlug?: string;
  items: Array<{
    title: string;
    price: number;
    type: string;
  }>;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const toDate = (value: any): Date => {
    if (!value) return new Date(0);
    if (value instanceof Date) return value;
    if (typeof value?.toDate === 'function') return value.toDate();
    if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) return;

      if (!user?.email) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('userEmail', '==', user.email)
        );

        const legacyOrdersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );

        const [enrollmentsSnapshot, legacyOrdersSnapshot] = await Promise.all([
          getDocs(enrollmentsQuery),
          getDocs(legacyOrdersQuery),
        ]);

        const enrollmentOrders: Order[] = enrollmentsSnapshot.docs.map((doc) => {
          const data = doc.data() as any;
          const amount = Number(data.totalAmount ?? data.total ?? 0);
          const title = data.programTitle || 'Program Enrollment';

          return {
            id: doc.id,
            orderId: data.stripeSessionId || doc.id,
            total: amount,
            status: data.status || 'active',
            createdAt: toDate(data.enrolledAt || data.createdAt),
            programSlug: data.programSlug,
            items: [
              {
                title,
                price: amount,
                type: 'program',
              },
            ],
          };
        });

        const legacyOrders: Order[] = legacyOrdersSnapshot.docs.map((doc) => {
          const data = doc.data() as any;
          const normalizedItems = Array.isArray(data.items)
            ? data.items.map((item: any) => ({
                title: item.title || 'Item',
                price: Number(item.price || 0),
                type: item.type || 'item',
              }))
            : [];

          return {
            id: doc.id,
            orderId: data.orderId || doc.id,
            total: Number(data.total || 0),
            status: data.status || 'pending',
            createdAt: toDate(data.createdAt),
            items: normalizedItems,
          };
        });

        const mergedOrders = [...enrollmentOrders, ...legacyOrders].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        setOrders(mergedOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authLoading, user?.email, user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order History</h1>
        <p className="text-gray-600 dark:text-gray-400">View your purchase history and order details</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.items[0]?.title || 'Order'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Order ID: {order.orderId}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.createdAt.toLocaleString()}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </div>
                  <span
                    className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'active' || order.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300"
                  >
                    <span>{item.title}</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.programSlug && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Link
                    href={`/programs/${order.programSlug}`}
                    className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    View Program
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your order history will appear here.</p>
          <Link
            href="/programs"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Programs
          </Link>
        </div>
      )}
    </div>
  );
}