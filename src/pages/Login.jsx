import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // Navigation is now handled by the useEffect above
    } catch (err) {
      setError('Failed to log in. Please check your config and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Nagrik Setu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bhubaneswar Civic Issue Reporting
          </p>
        </div>
        
        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};
