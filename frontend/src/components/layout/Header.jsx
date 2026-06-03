import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, FileText } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-sm border-b border-dark-700 h-16 flex items-center justify-between px-6">
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

      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg">
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
        </div>
      )}
    </header>
  );
}
