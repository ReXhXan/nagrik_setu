import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map, List, User, Shield } from 'lucide-react';

export const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <nav className="bg-pink-600 text-black shadow-md w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl tracking-tight">Nagrik Setu</Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="hover:bg-pink-700 p-2 rounded-md flex flex-col items-center text-xs">
              <Map size={20} />
              <span className="hidden sm:block">Map</span>
            </Link>
            <Link to="/feed" className="hover:bg-pink-700 p-2 rounded-md flex flex-col items-center text-xs">
              <List size={20} />
              <span className="hidden sm:block">Feed</span>
            </Link>
            <Link to="/my-reports" className="hover:bg-pink-700 p-2 rounded-md flex flex-col items-center text-xs">
              <User size={20} />
              <span className="hidden sm:block">My Reports</span>
            </Link>
            <Link to="/admin" className="hover:bg-pink-700 p-2 rounded-md flex flex-col items-center text-xs">
              <Shield size={20} />
              <span className="hidden sm:block">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
