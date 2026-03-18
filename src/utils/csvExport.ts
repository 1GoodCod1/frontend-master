import toast from 'react-hot-toast';

/**
 * Escapes a cell value for CSV (handles quotes).
 */
function escapeCsvCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/**
 * Exports data to CSV and triggers download.
 * @param headers - Column headers
 * @param rows - Array of row arrays (each row is an array of cell values)
 * @param filename - Download filename (without extension)
 * @param successMessage - Toast message on success
 */
export function exportToCSV(
  headers: string[],
  rows: unknown[][],
  filename: string,
  successMessage = 'Exported to CSV',
): void {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast.success(successMessage);
}
