import { DropZone } from './DropZone';

export function CSVUpload() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark-100">Upload Bank Statement</h2>
        <p className="text-dark-500 mt-2">
          Upload your bank statement CSV file to automatically classify and track your transactions.
        </p>
      </div>
      <DropZone />
      <div className="mt-6 p-4 bg-dark-900/30 border border-dark-800 rounded-xl">
        <h3 className="text-sm font-semibold text-dark-300 mb-2">Supported Formats</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-dark-500">
          <p>• HDFC Bank</p>
          <p>• SBI Bank</p>
          <p>• ICICI Bank</p>
          <p>• Axis Bank</p>
          <p>• Kotak Bank</p>
          <p>• Any CSV with date, description, amount</p>
        </div>
      </div>
    </div>
  );
}
