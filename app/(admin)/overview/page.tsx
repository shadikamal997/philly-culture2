'use client';

export default function AdminOverviewPage() {
  const metrics = [
    { label: 'Total Revenue (30d)', value: '$12,450', trend: '+14%' },
    { label: 'Total Orders', value: '342', trend: '+5%' },
    { label: 'Total Course Sales', value: '180', trend: '-2%' },
    { label: 'New Users', value: '45', trend: '+20%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Overview</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-green-200 transition">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{m.label}</span>
            <span className="text-4xl font-extrabold text-gray-900 mt-2">{m.value}</span>
            <span className={`text-sm mt-3 ${m.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
              {m.trend} from last month
            </span>
          </div>
        ))}
      </div>

      {/* Recent Orders Table Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <a href="/manage-orders" className="text-sm text-green-600 hover:text-green-800 font-medium">View All &rarr;</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              <tr className="border-t border-gray-100 hover:bg-gray-50/50">
                <td className="px-6 py-4">#ORD-001</td>
                <td className="px-6 py-4">johndoe@example.com</td>
                <td className="px-6 py-4 font-medium">$149.00</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Paid</span>
                </td>
              </tr>
              <tr className="border-t border-gray-100 hover:bg-gray-50/50">
                <td className="px-6 py-4">#ORD-002</td>
                <td className="px-6 py-4">jane.smith@email.com</td>
                <td className="px-6 py-4 font-medium">$49.50</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Shipped</span>
                </td>
              </tr>
              <tr className="border-t border-gray-100 hover:bg-gray-50/50">
                <td className="px-6 py-4">#ORD-003</td>
                <td className="px-6 py-4">alex_bbq@gmail.com</td>
                <td className="px-6 py-4 font-medium">$19.99</td>
                <td className="px-6 py-4">
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}