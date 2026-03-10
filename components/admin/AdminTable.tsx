// Placeholder for dynamic reusable datatable logic when integrated with Firebase

export const AdminTable = ({ columns, data }: { columns: string[]; data: Record<string, string | number | undefined>[] }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                        {columns.map(col => <th key={col} className="px-6 py-3 font-medium">{col}</th>)}
                    </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">No data available.</td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50/50">
                                {columns.map(col => (
                                    <td key={col} className="px-6 py-4">{row[col.toLowerCase()]}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
