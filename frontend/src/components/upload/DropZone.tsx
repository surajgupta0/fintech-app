import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '../../hooks/useUpload';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

export function DropZone() {
  const { uploadFile, isUploading, progress, result, error, reset } = useUpload();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const file = acceptedFiles[0];

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        id="csv-dropzone"
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary-400 bg-primary-500/10 scale-[1.02]'
            : isUploading
            ? 'border-dark-600 bg-dark-900/30 cursor-not-allowed'
            : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-900/50'
        }`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary-400 mx-auto animate-spin" />
            <p className="text-dark-300 font-medium">Processing your file...</p>
            <div className="w-full max-w-xs mx-auto bg-dark-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-dark-500 text-sm">{progress}% uploaded</p>
          </div>
        ) : isDragActive ? (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-primary-400 mx-auto animate-pulse-soft" />
            <p className="text-primary-300 font-medium">Drop your CSV file here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-dark-800 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-dark-400" />
            </div>
            <div>
              <p className="text-dark-200 font-medium">
                Drag & drop your bank statement CSV here
              </p>
              <p className="text-dark-500 text-sm mt-1">or click to browse files</p>
            </div>
            <p className="text-dark-600 text-xs">
              Supports HDFC, SBI, ICICI, Axis, Kotak formats • Max 10MB
            </p>
          </div>
        )}
      </div>

      {/* File info */}
      {file && !result && !error && !isUploading && (
        <div className="flex items-center gap-3 px-4 py-3 bg-dark-900/50 rounded-xl border border-dark-700">
          <FileText className="w-5 h-5 text-primary-400" />
          <div className="flex-1 min-w-0">
            <p className="text-dark-200 text-sm font-medium truncate">{file.name}</p>
            <p className="text-dark-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      {/* Success state */}
      {result && (
        <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-success-400 font-medium">Upload successful!</p>
              <div className="mt-2 space-y-1 text-sm text-dark-300">
                <p>✅ {result.inserted} transactions imported</p>
                {result.duplicates > 0 && <p>⏭️ {result.duplicates} duplicates skipped</p>}
                {result.skipped > 0 && <p>⚠️ {result.skipped} rows skipped</p>}
                {result.errors.length > 0 && (
                  <p>❌ {result.errors.length} errors found</p>
                )}
              </div>
            </div>
            <button onClick={reset} className="text-dark-500 hover:text-dark-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-danger-500/10 border border-danger-500/30 rounded-xl p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-danger-400 font-medium">Upload failed</p>
              <p className="text-dark-400 text-sm mt-1">{error}</p>
            </div>
            <button onClick={reset} className="text-dark-500 hover:text-dark-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
