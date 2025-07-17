
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME, Icons } from '../constants';

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'intern' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !selectedRole) {
      setError('Username and password are required.');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      const userRole = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
      setError(`Invalid credentials for ${userRole}. Please check and try again.`);
    }
  };
  
  const handleRoleSelect = (role: 'admin' | 'intern') => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-800 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all">
        {/* Header inside the card */}
        <div className="text-center mb-8">
            <Icons.CheckCircle className="w-14 h-14 mx-auto text-primary-600 mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
            <p className="text-gray-500 mt-1">Enterprise Dashboard Portal</p>
        </div>

        {selectedRole ? (
          // Login Form View
          <div>
            <button 
                onClick={() => setSelectedRole(null)}
                className="flex items-center text-sm text-gray-600 hover:text-primary-700 mb-6 font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Change Role
            </button>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedRole === 'admin' ? 'Admin Username' : 'Intern Username'}
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder={selectedRole === 'admin' ? 'e.g., admin' : 'e.g., sam, jess'}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${selectedRole === 'admin' ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>
            <p className="mt-4 text-center text-xs text-gray-500">
              Hint: Use '{selectedRole === 'admin' ? 'admin' : "sam', 'jess', or 'mike"}' as username and 'password' as password.
            </p>
          </div>
        ) : (
          // Role Selection View
          <div>
            <div className="text-center bg-primary-50 p-3 rounded-lg mb-6 border border-primary-100">
              <p className="text-sm text-primary-800 font-medium">Please select your role to access the dashboard</p>
            </div>
            <div className="space-y-4">
                <button
                    onClick={() => handleRoleSelect('admin')}
                    className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    <Icons.Users className="w-5 h-5 mr-3" />
                    Login as Administrator
                </button>
                 <button
                    onClick={() => handleRoleSelect('intern')}
                    className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                >
                    <Icons.Profile className="w-5 h-5 mr-3" />
                    Login as Intern
                </button>
            </div>
          </div>
        )}
        
        {error && (
            <div className="mt-6 w-full bg-red-100 p-3 rounded-md text-sm text-red-700 text-center shadow-sm">
            {error}
            </div>
        )}
            
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-xs">
            <a href="#" className="font-medium text-primary-600 hover:underline">Need help?</a>
            <p className="text-gray-400">&copy; {new Date().getFullYear()} {APP_NAME}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;