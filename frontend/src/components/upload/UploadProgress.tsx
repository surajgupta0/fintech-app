interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
}

export function UploadProgress({ progress, isUploading }: UploadProgressProps) {
  if (!isUploading) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-dark-400">Uploading & processing...</span>
        <span className="text-sm font-mono text-primary-400">{progress}%</span>
      </div>
      <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
