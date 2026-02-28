'use client';

export default function ManageOrdersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
        {/* Simple Date Filter Placeholder */}
        <select className="border border-gray-200 rounded-md px-4 py-2 text-sm text-gray-600 bg-white">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>All Time</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Customer Email</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition">
              <td className="px-6 py-4 font-medium text-gray-900">#ORD-9024</td>
              <td className="px-6 py-4 text-gray-500">Oct 24, 2023 2:40 PM</td>
              <td className="px-6 py-4">user@example.com</td>
              <td className="px-6 py-4 font-semibold">$56.00</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Shipped</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-green-600 hover:text-green-800 font-medium">View Details</button>
              </td>
            </tr>
            <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition">
              <td className="px-6 py-4 font-medium text-gray-900">#ORD-9025</td>
              <td className="px-6 py-4 text-gray-500">Oct 26, 2023 9:15 AM</td>
              <td className="px-6 py-4">new_student@gmail.com</td>
              <td className="px-6 py-4 font-semibold">$120.00</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Paid</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-green-600 hover:text-green-800 font-medium">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}