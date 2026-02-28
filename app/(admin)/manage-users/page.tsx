'use client';

export default function ManageUsersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search email..."
            className="w-64 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="px-6 py-4 font-medium">User ID</th>
              <th className="px-6 py-4 font-medium">Name / Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition">
              <td className="px-6 py-4 font-mono text-xs text-gray-500">ux_129abc</td>
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">Shadi</p>
                <p className="text-xs text-gray-500">admin@phillyculture.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold tracking-wider">ADMIN</span>
              </td>
              <td className="px-6 py-4 text-gray-500">Oct 20, 2023</td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-600 hover:text-blue-800 font-medium">View Profile</button>
              </td>
            </tr>
            <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition">
              <td className="px-6 py-4 font-mono text-xs text-gray-500">ux_994xyz</td>
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">Test Customer</p>
                <p className="text-xs text-gray-500">customer@test.com</p>
              </td>
              <td className="px-6 py-4">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">USER</span>
              </td>
              <td className="px-6 py-4 text-gray-500">Oct 26, 2023</td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-600 hover:text-blue-800 font-medium">View Profile</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}