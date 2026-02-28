'use client';

export default function ManageProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
        <button className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-green-700 transition font-medium">
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium text-center">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition">
              <td className="px-6 py-4 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <img src="https://via.placeholder.com/150" alt="Product" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Philly Culture Secret Sauce</p>
                  <p className="text-xs text-gray-500">12oz Glass Bottle</p>
                </div>
              </td>
              <td className="px-6 py-4">sauces</td>
              <td className="px-6 py-4 font-medium">$12.99</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">142 In Stock</span>
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                <button className="text-red-500 hover:text-red-700 font-medium">Delete</button>
              </td>
            </tr>
            <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition">
              <td className="px-6 py-4 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <img src="https://via.placeholder.com/150" alt="Product" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Premium Apron</p>
                  <p className="text-xs text-gray-500">Black, Canvas</p>
                </div>
              </td>
              <td className="px-6 py-4">merchandise</td>
              <td className="px-6 py-4 font-medium">$35.00</td>
              <td className="px-6 py-4 text-center">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Out of Stock</span>
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                <button className="text-red-500 hover:text-red-700 font-medium">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}