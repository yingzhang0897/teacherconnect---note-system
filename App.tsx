import React, { useState } from 'react';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { User, UserRole } from './types';
import { Icons } from './components/Icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

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