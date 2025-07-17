
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../shared/Button';
import { Icons, APP_NAME } from '../../constants';

const ChangePasswordModal: React.FC = () => {
  const { user, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!user) {
      setError('No user session found. Please try logging in again.');
      return;
    }

    setLoading(true);
    const success = await changePassword(user.id, newPassword);
    setLoading(false);

    if (!success) {
      setError('Failed to update password. Please try again.');
    }
    // On success, the modal will disappear automatically as the user state updates
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-in-out">
        <div className="p-6 text-center border-b">
            <Icons.Lock className="w-12 h-12 mx-auto text-primary-500 mb-2"/>
            <h3 className="text-xl font-bold text-gray-800">Set Your New Password</h3>
            <p className="text-sm text-gray-600 mt-1">For security, please create a new password for your {APP_NAME} account.</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 input-field-light"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 input-field-light"
              />
            </div>
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm font-medium">
                    {error}
                </div>
            )}
            <div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Set Password and Continue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;