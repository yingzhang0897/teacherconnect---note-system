import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { User, UserRole } from './types';
import { Icons } from './components/Icons';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await storageService.init();
        setIsDbReady(true);
      } catch (err: any) {
        console.error("Initialization failed:", err);
        setInitError(err.message || "Failed to connect to the database.");
      }
    };
    initApp();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (initError) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border-l-4 border-red-500">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
                <p className="mb-4 text-gray-600">Could not connect to the database.</p>
                <div className="bg-gray-100 p-4 rounded text-sm font-mono text-gray-700 overflow-x-auto mb-4">
                    {initError}
                </div>
                <p className="text-sm text-gray-500">
                    <strong>Tip:</strong> Ensure your <code>DATABASE_URL</code> is correctly set in your Vercel Environment Variables or .env file.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    Retry
                </button>
            </div>
        </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Connecting to Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navigation Bar (Visible only when logged in) */}
      {currentUser && (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <span className="text-indigo-600 mr-2"><Icons.Book /></span>
                <span className="font-bold text-xl tracking-tight text-gray-900">TeacherConnect</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                   <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
                   <span className="text-xs text-gray-500 uppercase">{currentUser.role}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    title="Logout"
                >
                    <Icons.LogOut />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="py-6">
        {!currentUser ? (
          <Login onLogin={setCurrentUser} />
        ) : currentUser.role === UserRole.TEACHER ? (
          <TeacherDashboard currentUser={currentUser} />
        ) : (
          <StudentDashboard currentUser={currentUser} />
        )}
      </main>
    </div>
  );
};

export default App;