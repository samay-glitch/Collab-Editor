import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, FileText, Sun, Moon } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

export default function Header() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-sm border-b border-dark-700 h-16 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="bg-primary-600 text-white p-2 rounded-lg flex items-center justify-center">
            <FileText size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            CollabEdit
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all duration-200 border border-transparent hover:border-dark-700/60"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <>
            <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-dark-800 border border-dark-700/60 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary-700 text-primary-100 flex items-center justify-center text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-dark-200">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="flex items-center gap-2 p-2 hover:bg-dark-800 hover:text-red-400"
              title="Log Out"
            >
              <LogOut size={16} />
              <span className="text-xs">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
