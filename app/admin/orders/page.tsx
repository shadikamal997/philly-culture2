"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

interface Order {
  id: string;
  userEmail: string;
  customerName: string;
  programTitle: string;
  programId: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  state: string;
  country: string;
  city: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  status: string;
  refundStatus?: string;
  enrolledAt: any;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const enrollmentsSnap = await getDocs(collection(db, "enrollments"));
      const ordersData = enrollmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      // Sort by date (newest first)
      ordersData.sort((a, b) => {
        const dateA = a.enrolledAt?.toDate() || new Date(0);
        const dateB = b.enrolledAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const handleRefund = async (order: Order) => {
    if (!confirm(`Are you sure you want to refund $${order.totalAmount.toFixed(2)} to ${order.userEmail}?`)) {
      return;
    }

    setRefunding(order.id);

    try {
      // Call refund API
      const res = await fetch("/api/v1/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: order.id,
          paymentIntentId: order.stripePaymentIntentId,
          amount: Math.round(order.totalAmount * 100) // Convert to cents
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state
        setOrders(orders.map(o => 
          o.id === order.id 
            ? { ...o, refundStatus: "refunded", status: "refunded" }
            : o
        ));
        alert("Refund processed successfully!");
      } else {
        alert(`Refund failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Failed to process refund");
    } finally {
      setRefunding(null);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
          <p className="text-gray-600">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">
            ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Tax</p>
          <p className="text-2xl font-bold">
            ${orders.reduce((sum, o) => sum + o.taxAmount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Active Orders</p>
          <p className="text-2xl font-bold">
            {orders.filter(o => o.status === "active").length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Refunded</p>
          <p className="text-2xl font-bold">
            {orders.filter(o => o.refundStatus === "refunded").length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tax</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      {order.enrolledAt?.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{order.customerName || "N/A"}</div>
                      <div className="text-xs text-gray-500">{order.userEmail}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">{order.programTitle}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{order.city}, {order.state}</div>
                      <div className="text-xs text-gray-500">{order.country}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">${order.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-right">${order.taxAmount.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-right">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        order.refundStatus === "refunded" 
                          ? "bg-red-100 text-red-800"
                          : order.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {order.refundStatus === "refunded" ? "REFUNDED" : order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          View
                        </button>
                        {order.refundStatus !== "refunded" && order.status === "active" && (
                          <button
                            onClick={() => handleRefund(order)}
                            disabled={refunding === order.id}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm disabled:opacity-50"
                          >
                            {refunding === order.id ? "Processing..." : "Refund"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedOrder.customerName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedOrder.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{selectedOrder.city}, {selectedOrder.state}, {selectedOrder.country}</span>
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div>
                <h3 className="font-semibold mb-3">Program Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Program:</span>
                    <span className="font-medium">{selectedOrder.programTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Enrolled:</span>
                    <span className="font-medium">{selectedOrder.enrolledAt?.toDate().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({selectedOrder.state}):</span>
                    <span className="font-medium">${selectedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total Paid:</span>
                    <span className="font-bold text-lg">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Stripe Info */}
              <div>
                <h3 className="font-semibold mb-3">Stripe Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-gray-600 text-sm block">Session ID:</span>
                    <code className="text-xs bg-white px-2 py-1 rounded">{selectedOrder.stripeSessionId}</code>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm block">Payment Intent ID:</span>
                    <code className="text-xs bg-white px-2 py-1 rounded">{selectedOrder.stripePaymentIntentId}</code>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-3">Status</h3>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedOrder.refundStatus === "refunded" 
                      ? "bg-red-100 text-red-800"
                      : selectedOrder.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {selectedOrder.refundStatus === "refunded" ? "REFUNDED" : selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Close
              </button>
              {selectedOrder.refundStatus !== "refunded" && selectedOrder.status === "active" && (
                <button
                  onClick={() => {
                    handleRefund(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
