/**
 * Utility for exporting data records to Excel-compatible CSV format
 * Includes UTF-8 BOM so Microsoft Excel, Google Sheets, and Apple Numbers
 * open it natively with proper formatting and character support.
 */

export function exportToExcel(filename, headers, rows) {
  if (!rows || rows.length === 0) {
    alert('No records available to export.');
    return;
  }

  // Generate CSV content with Excel-safe escaping
  const formatCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(h => formatCell(h.label || h.key || h)).join(',');
  const rowLines = rows.map(row => {
    return headers.map(h => {
      const key = typeof h === 'object' ? h.key : h;
      let val = row[key];
      if (typeof h.formatter === 'function') {
        val = h.formatter(val, row);
      }
      return formatCell(val);
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
