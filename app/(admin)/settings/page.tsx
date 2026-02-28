'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

        {/* Section 1 */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">Store Configuration</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
              <input type="number" defaultValue={8.00} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Shipping Fee ($)</label>
              <input type="number" defaultValue={7.00} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">Stripe Webhooks</h3>
          <div className="flex items-center space-x-4">
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-gray-700">Webhook Connection Active</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Listening for `checkout.session.completed`</p>
        </section>

        {/* Action */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition">
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}