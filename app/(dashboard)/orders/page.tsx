'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

        const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // In-memory sort to prevent composite index forcing on dev environment
        loadedOrders.sort((a: any, b: any) => b.createdAt.toMillis() - a.createdAt.toMillis());

        setOrders(loadedOrders);
      } catch (err) {
        console.error("Failed to load active orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="text-zinc-500 animate-pulse">Scanning ledgers...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Order History</h1>
      <p className="text-zinc-400 mb-8 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
        View your past purchases, physical shipments, and download invoices here.
      </p>

      {orders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
          <p className="text-zinc-500">You haven't authorized any purchases yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${order.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-white font-bold mb-1">
                  {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'} • ${order.totalAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-zinc-500 text-sm">
                  {order.createdAt?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <Link href={`/dashboard/order/${order.id}`} className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors">
                  View Details &rarr;
                </Link>
                <button className="text-sm border border-zinc-700 hover:bg-zinc-800 py-2 px-4 rounded-lg transition-colors font-medium">
                  Download PDF Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}