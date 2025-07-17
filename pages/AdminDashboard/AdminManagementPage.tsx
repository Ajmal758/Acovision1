
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { Icons } from '../../constants';

const AdminManagementPage: React.FC = () => {
    const { admins, createAdmin, removeAdmin, addNotification } = useData();
    const { user: currentUser } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form state for adding a new admin
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [successData, setSuccessData] = useState<{ username: string, password?: string } | null>(null);

    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
        return (
            <Card title="Access Denied">
                <p>You do not have permission to access this page.</p>
            </Card>
        );
    }

    const resetAddForm = () => {
        setName('');
        setEmail('');
        setUsername('');
        setPassword('');
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !username) {
            addNotification({ message: 'All fields are required.', type: 'warning' });
            return;
        }

        const result = await createAdmin({ name, email, username }, password);

        if (result) {
            addNotification({ message: `Admin ${name} created successfully.`, type: 'success' });
            setSuccessData({ username: result.admin.username, password: result.password });
            resetAddForm();
        } else {
            addNotification({ message: 'Failed to create admin. Username might already exist.', type: 'error' });
        }
    };
    
    const handleCopyToClipboard = () => {
        if (!successData) return;
        const textToCopy = `Username: ${successData.username}\nPassword: ${successData.password}`;
        navigator.clipboard.writeText(textToCopy);
        addNotification({type: 'info', message: 'Credentials copied to clipboard.'});
    };

    const handleDone = () => {
      setSuccessData(null);
      setIsAddModalOpen(false);
    }


    const handleRemoveAdmin = (admin: User) => {
        if (admin.role === UserRole.SUPER_ADMIN) {
            addNotification({ message: 'The Super Admin cannot be removed.', type: 'error' });
            return;
        }

        if (window.confirm(`Are you sure you want to remove admin: ${admin.name}? This action cannot be undone.`)) {
            removeAdmin(admin.id).then(success => {
                if (success) {
                    addNotification({ message: `Admin ${admin.name} has been removed.`, type: 'success' });
                } else {
                    addNotification({ message: 'Failed to remove admin.', type: 'error' });
                }
            });
        }
    };
    
    const getRoleStyles = (role: UserRole) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'bg-primary-100 text-primary-800 border-primary-300';
            case UserRole.ADMIN:
                return 'bg-secondary-100 text-secondary-800 border-secondary-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-semibold text-gray-800">Manage Admins</h2>
                <Button onClick={() => setIsAddModalOpen(true)} leftIcon={Icons.PlusCircle}>
                    Add New Admin
                </Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map(admin => (
                                <tr key={admin.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full mr-4" src={admin.avatarUrl} alt={admin.name} />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{admin.name} {admin.id === currentUser.id && '(You)'}</div>
                                                <div className="text-xs text-gray-500">{admin.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleStyles(admin.role)}`}>
                                            {admin.role.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button size="sm" variant="ghost" disabled>Edit</Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleRemoveAdmin(admin)}
                                            disabled={admin.role === UserRole.SUPER_ADMIN}
                                            title={admin.role === UserRole.SUPER_ADMIN ? 'Super Admin cannot be removed' : 'Remove Admin'}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isAddModalOpen} onClose={handleDone} title={successData ? "Admin Created Successfully" : "Add New Admin"}>
                {successData ? (
                     <div className="space-y-4 text-center">
                        <Icons.CheckCircle className="w-16 h-16 mx-auto text-green-500"/>
                        <p className="text-lg">The admin account has been created.</p>
                        <div className="p-4 bg-gray-100 rounded-lg text-left text-sm space-y-2">
                            <div>
                                <span className="font-semibold text-gray-600">Username:</span>
                                <span className="ml-2 font-mono bg-gray-200 px-2 py-1 rounded">{successData.username}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Password:</span>
                                <span className="ml-2 font-mono bg-gray-200 px-2 py-1 rounded">{successData.password}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Please copy and share these credentials. The new admin will be required to change their password on first login.</p>
                        <div className="flex justify-center space-x-2 pt-2">
                            <Button variant="ghost" onClick={handleCopyToClipboard}>Copy Credentials</Button>
                            <Button onClick={handleDone}>Done</Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 input-field-light" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 input-field-light" />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 input-field-light" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Temporary Password</label>
                            <input type="text" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to auto-generate" className="mt-1 input-field-light" />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2 border-t">
                            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Admin</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default AdminManagementPage;
