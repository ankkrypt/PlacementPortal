'use client';
export default function Table({ columns, data, onRowClick, renderActions }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left font-medium text-gray-600">
                {col}
              </th>
            ))}
            {renderActions && <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="px-4 py-8 text-center text-gray-400">
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || i}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3 text-gray-700">
                    {row[col] || '-'}
                  </td>
                ))}
                {renderActions && <td className="px-4 py-3">{renderActions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
