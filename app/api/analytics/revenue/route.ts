import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const user = userDoc.data();

    if (!user || (user.role !== 'owner' && user.role !== 'assistant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all orders
    const ordersSnapshot = await adminDb.collection('orders').get();

    // Initialize aggregation variables
    let grossRevenue = 0;
    let totalTax = 0;
    let totalOrders = 0;
    const revenueByState: Record<string, { revenue: number; tax: number; orders: number }> = {};
    const monthlyRevenue: Record<string, number> = {};
    const productSales: Record<string, { name: string; sales: number; revenue: number; quantity: number }> = {};

    // Process each order
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();

      // Only count paid orders
      if (order.status !== 'paid') return;

      totalOrders++;
      grossRevenue += order.total || 0;
      totalTax += order.taxAmount || 0;

      // Revenue by state
      const state = order.state || 'Unknown';
      if (!revenueByState[state]) {
        revenueByState[state] = { revenue: 0, tax: 0, orders: 0 };
      }
      revenueByState[state].revenue += order.total || 0;
      revenueByState[state].tax += order.taxAmount || 0;
      revenueByState[state].orders += 1;

      // Monthly revenue
      if (order.createdAt) {
        const date = order.createdAt.toDate();
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total || 0);
      }

      // Product sales
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.id;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.title || 'Unknown Product',
              sales: 0,
              revenue: 0,
              quantity: 0,
            };
          }
          productSales[productId].sales += 1;
          productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
          productSales[productId].quantity += item.quantity || 1;
        });
      }
    });

    // Convert monthly revenue to sorted array
    const monthlyRevenueArray = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Convert product sales to sorted array (top 10)
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Convert state revenue to sorted array
    const revenueByStateArray = Object.entries(revenueByState)
      .map(([state, data]) => ({
        state,
        revenue: data.revenue,
        tax: data.tax,
        orders: data.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      grossRevenue,
      totalTax,
      netRevenue: grossRevenue - totalTax,
      totalOrders,
      revenueByState: revenueByStateArray,
      monthlyRevenue: monthlyRevenueArray,
      topProducts,
      isOwner: user.role === 'owner',
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
