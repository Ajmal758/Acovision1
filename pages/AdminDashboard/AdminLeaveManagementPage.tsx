import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { LeaveRequest, LeaveStatus } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { LEAVE_STATUS_COLORS, Icons } from '../../constants';

const AdminLeaveManagementPage: React.FC = () => {
    const { leaveRequests, interns, updateLeaveRequestStatus, addNotification } = useData();
    const [filterStatus, setFilterStatus] = useState<LeaveStatus | 'all'>('all');

    const filteredRequests = useMemo(() => {
        return leaveRequests
            .filter(req => filterStatus === 'all' || req.status === filterStatus)
            .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    }, [leaveRequests, filterStatus]);
    
    const handleUpdateStatus = async (requestId: string, internId: string, status: LeaveStatus) => {
        const success = await updateLeaveRequestStatus(requestId, status, internId);
        if (success) {
            addNotification({
                message: `Leave request has been ${status.toLowerCase()}.`,
                type: 'success',
            });
        } else {
            addNotification({
                message: 'Failed to update leave request status.',
                type: 'error',
            });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-gray-800">Leave Request Management</h2>
            
            <Card>
                <div className="p-4 border-b flex items-center space-x-4">
                    <label htmlFor="status-filter" className="font-medium text-gray-700">Filter by status:</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as LeaveStatus | 'all')}
                        className="form-select rounded-md"
                    >
                        <option value="all">All</option>
                        {Object.values(LeaveStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map(req => {
                                const intern = interns.find(i => i.id === req.internId);
                                return (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full mr-3" src={intern?.avatarUrl} alt={intern?.name} />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{intern?.name || 'Unknown Intern'}</div>
                                                    <div className="text-xs text-gray-500">{intern?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{req.reason}</td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${LEAVE_STATUS_COLORS[req.status]}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {req.status === LeaveStatus.PENDING && (
                                                <>
                                                    <Button size="sm" variant="success" onClick={() => handleUpdateStatus(req.id, req.internId, LeaveStatus.APPROVED)}>Approve</Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(req.id, req.internId, LeaveStatus.REJECTED)}>Reject</Button>
                                                </>
                                            )}
                                            {req.status !== LeaveStatus.PENDING && (
                                                <span className="text-gray-400">Actioned</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredRequests.length === 0 && (
                        <p className="p-4 text-center text-gray-500">No leave requests match the current filter.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminLeaveManagementPage;