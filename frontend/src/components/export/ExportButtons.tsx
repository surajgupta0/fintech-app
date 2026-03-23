import { useState } from 'react';
import { exportCSV, exportPDF } from '../../api/upload';
import { Download, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportButtonsProps {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export function ExportButtons({ startDate, endDate, category }: ExportButtonsProps) {
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const blob = await exportCSV(startDate, endDate, category);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const blob = await exportPDF(startDate, endDate, category);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF report exported successfully');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="flex items-center gap-3" id="export-buttons">
      <button
        onClick={handleExportCSV}
        disabled={exportingCSV}
        className="flex items-center gap-2 px-4 py-2 bg-dark-900/60 border border-dark-700 hover:border-primary-500/50 text-dark-300 hover:text-dark-100 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
      >
        {exportingCSV ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export CSV
      </button>
      <button
        onClick={handleExportPDF}
        disabled={exportingPDF}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-sm font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50"
      >
        {exportingPDF ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Export PDF
      </button>
    </div>
  );
}
