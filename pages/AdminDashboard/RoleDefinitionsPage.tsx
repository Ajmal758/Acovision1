
import React from 'react';
import { Icons } from '../../constants';

const permissionsData = [
  {
    feature: 'Access the Admin Dashboard',
    icon: Icons.Key,
    superAdmin: true,
    admin: true,
  },
  {
    feature: 'Add/Remove/Edit Interns',
    icon: Icons.Users,
    superAdmin: true,
    admin: true,
  },
  {
    feature: 'View Intern Tasks/Leaves/Announcements',
    icon: Icons.Resources,
    superAdmin: true,
    admin: true,
  },
  {
    feature: 'Send Announcements (all/specific/batch)',
    icon: Icons.Announcements,
    superAdmin: true,
    admin: true,
  },
  {
    feature: 'Add/Remove/Edit other Admins',
    icon: Icons.Wrench,
    superAdmin: true,
    admin: false,
  },
  {
    feature: 'Promote/demote Admins',
    icon: Icons.Trophy,
    superAdmin: true,
    admin: false,
  },
  {
    feature: 'Change system-level settings',
    icon: Icons.Lock,
    superAdmin: true,
    admin: false,
  },
];

const PermissionStatus: React.FC<{ allowed: boolean }> = ({ allowed }) => {
  const Icon = allowed ? Icons.Check : Icons.Cross;
  const textColor = allowed ? 'text-green-400' : 'text-red-400';
  const text = allowed ? 'Yes' : 'No';

  return (
    <div className={`flex items-center space-x-2 font-semibold ${textColor}`}>
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </div>
  );
};

const RoleDefinitionsPage: React.FC = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-red-500 rounded-full mr-4">
          <Icons.Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wider">Role Definitions</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead>
            <tr className="border-b border-gray-600 text-left">
              <th className="py-4 px-4 text-sm font-semibold tracking-wider uppercase">Feature / Permission</th>
              <th className="py-4 px-4 text-sm font-semibold tracking-wider uppercase">Super Admin</th>
              <th className="py-4 px-4 text-sm font-semibold tracking-wider uppercase">Admin</th>
            </tr>
          </thead>
          <tbody>
            {permissionsData.map((perm, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="py-4 px-4 align-middle">
                  <div className="flex items-center space-x-3">
                    <perm.icon className="w-6 h-6 text-gray-400" />
                    <span className="font-medium">{perm.feature}</span>
                  </div>
                </td>
                <td className="py-4 px-4 align-middle">
                  <PermissionStatus allowed={perm.superAdmin} />
                </td>
                <td className="py-4 px-4 align-middle">
                  <PermissionStatus allowed={perm.admin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleDefinitionsPage;
