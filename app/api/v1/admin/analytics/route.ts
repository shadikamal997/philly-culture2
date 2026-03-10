import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/roleGuard';
import { adminDb } from '@/firebase/firebaseAdmin';

// GET /api/v1/admin/analytics - Get dashboard analytics
export async function GET(req: NextRequest) {
  return requireAdmin(req, async (request: NextRequest, adminUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Get orders within date range
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('createdAt', '>=', startDate)
      .get();

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate revenue
    const totalRevenue = orders
      .filter((order: any) => order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    
    const prevOrdersSnapshot = await adminDb
      .collection('orders')
      .where('createdAt', '>=', prevStartDate)
      .where('createdAt', '<', startDate)
      .get();

    const prevOrders = prevOrdersSnapshot.docs.map((doc) => doc.data());
    const prevRevenue = prevOrders
      .filter((order: any) => order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Calculate trends
    const revenueTrend = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : totalRevenue > 0 ? '100.0' : '0.0';

    const ordersTrend = prevOrders.length > 0
      ? ((orders.length - prevOrders.length) / prevOrders.length * 100).toFixed(1)
      : orders.length > 0 ? '100.0' : '0.0';

    // Count course sales
    const courseSales = orders.reduce((count: number, order: any) => {
      const courseItems = (order.items || []).filter((item: any) => item.type === 'course');
      return count + courseItems.length;
    }, 0);

    const prevCourseSales = prevOrders.reduce((count: number, order: any) => {
      const courseItems = (order.items || []).filter((item: any) => item.type === 'course');
      return count + courseItems.length;
    }, 0);

    const courseSalesTrend = prevCourseSales > 0
      ? ((courseSales - prevCourseSales) / prevCourseSales * 100).toFixed(1)
      : courseSales > 0 ? '100.0' : '0.0';

    // Get new users
    const usersSnapshot = await adminDb
      .collection('users')
      .where('createdAt', '>=', startDate)
      .get();

    const newUsers = usersSnapshot.size;

    const prevUsersSnapshot = await adminDb
      .collection('users')
      .where('createdAt', '>=', prevStartDate)
      .where('createdAt', '<', startDate)
      .get();

    const prevNewUsers = prevUsersSnapshot.size;

    const usersTrend = prevNewUsers > 0
      ? ((newUsers - prevNewUsers) / prevNewUsers * 100).toFixed(1)
      : newUsers > 0 ? '100.0' : '0.0';

    // Get recent orders (last 10)
    const recentOrdersSnapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentOrders = recentOrdersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: doc.id,
        customerEmail: data.email || 'N/A',
        total: data.total || 0,
        status: data.status || 'pending',
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });

    // Get total counts
    const totalOrdersSnapshot = await adminDb.collection('orders').count().get();
    const totalUsersSnapshot = await adminDb.collection('users').count().get();
    const totalCoursesSnapshot = await adminDb.collection('courses').count().get();
    const totalProductsSnapshot = await adminDb.collection('products').count().get();

    return NextResponse.json({
      metrics: {
        revenue: {
          value: totalRevenue,
          trend: parseFloat(revenueTrend),
        },
        orders: {
          value: orders.length,
          trend: parseFloat(ordersTrend),
        },
        courseSales: {
          value: courseSales,
          trend: parseFloat(courseSalesTrend),
        },
        newUsers: {
          value: newUsers,
          trend: parseFloat(usersTrend),
        },
      },
      totals: {
        orders: totalOrdersSnapshot.data().count,
        users: totalUsersSnapshot.data().count,
        courses: totalCoursesSnapshot.data().count,
        products: totalProductsSnapshot.data().count,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
  });
}
