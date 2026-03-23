import { CSVUpload } from '../components/upload/CSVUpload';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, LogOut } from 'lucide-react';

export function UploadPage() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-400 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                FinTrack
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-xl text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-dark-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-dark-200">{user?.name}</p>
                  <p className="text-xs text-dark-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-dark-500 hover:text-danger-400 rounded-lg hover:bg-danger-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CSVUpload />
      </main>
    </div>
  );
}
