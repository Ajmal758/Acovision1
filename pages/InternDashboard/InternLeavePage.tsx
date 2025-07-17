import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { LeaveRequest, LeaveStatus } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { LEAVE_STATUS_COLORS, Icons } from '../../constants';

const InternLeavePage: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests: allLeaveRequests, addNotification, submitLeaveRequest } = useData();
  
  const leaveRequests = useMemo(() => {
    if (!user) return [];
    return allLeaveRequests.filter(req => req.internId === user.id);
  }, [allLeaveRequests, user]);

  // Form state
  const [leaveType, setLeaveType] = useState<'multiple' | 'half' | 'single'>('multiple');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [period, setPeriod] = useState<'Morning' | 'Afternoon'>('Morning');

  // Break state
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [breakTimer, setBreakTimer] = useState<string>("00:00:00");

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (isBreakActive && breakStartTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - breakStartTime.getTime();
        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        setBreakTimer(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else {
      setBreakTimer("00:00:00");
    }
    return () => clearInterval(intervalId);
  }, [isBreakActive, breakStartTime]);

  const totalMonthlyLeaves = 3;
  const approvedLeavesThisMonth = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let totalDaysTaken = 0;

    leaveRequests.forEach(req => {
      if (req.status !== LeaveStatus.APPROVED) {
        return;
      }

      if (req.reason.toLowerCase().includes('half day')) {
        const reqDate = new Date(req.startDate);
        if (!isNaN(reqDate.getTime()) && reqDate.getMonth() === currentMonth && reqDate.getFullYear() === currentYear) {
          totalDaysTaken += 0.5;
        }
        return;
      }
      
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return;
      }
      
      let currentDate = new Date(start);
      while(currentDate <= end) {
        if (currentDate.getMonth() === currentMonth && currentDate.getFullYear() === currentYear) {
          totalDaysTaken += 1;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return totalDaysTaken;
  }, [leaveRequests]);
  const remainingLeaves = Math.max(0, totalMonthlyLeaves - approvedLeavesThisMonth);

  const handleCancel = () => {
    setLeaveType('multiple');
    setStartDate('');
    setEndDate('');
    setReason('');
    setPeriod('Morning');
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (remainingLeaves <= 0) {
      addNotification({ message: "You have no remaining leaves for this month and cannot apply.", type: 'error', targetUser: user.id });
      return;
    }

    if (!reason.trim()) {
      addNotification({message: "Please fill all required fields.", type: 'warning'});
      return;
    }

    let finalStartDate = startDate;
    let finalEndDate = endDate;
    let finalReason = reason;

    if (leaveType === 'multiple') {
        if (!startDate || !endDate) {
            addNotification({message: "Please select a start and end date.", type: 'warning'});
            return;
        }
    } else { // single or half
        if (!startDate) {
            addNotification({message: "Please select a date.", type: 'warning'});
            return;
        }
        finalEndDate = startDate; // End date is same as start for single/half
        if (leaveType === 'half') {
            finalReason = `(Half Day - ${period}) ${reason}`;
        }
    }

    const newRequestData = { internId: user.id, startDate: finalStartDate, endDate: finalEndDate, reason: finalReason };
    const newRequest = await submitLeaveRequest(newRequestData);
    
    if (newRequest) {
      handleCancel();
    }
  };

  const toggleBreak = () => {
    if (isBreakActive) {
      setIsBreakActive(false);
      setBreakStartTime(null);
      addNotification({message: "Break ended.", type: 'info', targetUser: user?.id});
    } else {
      setIsBreakActive(true);
      const startTime = new Date();
      setBreakStartTime(startTime);
      addNotification({message: "Break started.", type: 'info', targetUser: user?.id});
    }
  };
  
  const LeaveTypeButton: React.FC<{ type: 'single' | 'half' | 'multiple', children: React.ReactNode }> = ({ type, children }) => (
    <button
        type="button"
        onClick={() => setLeaveType(type)}
        className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border ${
            leaveType === type
            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main content: Form and History */}
        <div className="lg:col-span-3 space-y-6">
            {/* Apply for Leave Form */}
            <Card>
                <form onSubmit={handleSubmitLeave} className="space-y-6">
                    <fieldset disabled={remainingLeaves <= 0} className="space-y-6 disabled:opacity-50">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Apply for Leave</h2>
                        </div>

                        {/* Remaining Leaves Gauge */}
                        <div className="p-4 bg-primary-50 rounded-lg">
                            <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-1">
                                <span>Leaves remaining this month:</span>
                                <span className="font-bold text-primary-700 text-lg">{remainingLeaves}</span>
                            </div>
                            <div className="w-full bg-primary-200 rounded-full h-2.5">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(remainingLeaves / totalMonthlyLeaves) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                <span>0</span>
                                <span>{totalMonthlyLeaves}</span>
                            </div>
                        </div>

                        {/* Leave Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                <LeaveTypeButton type="single">Single Day</LeaveTypeButton>
                                <LeaveTypeButton type="half">Half Day</LeaveTypeButton>
                                <LeaveTypeButton type="multiple">Multiple Days</LeaveTypeButton>
                            </div>
                        </div>

                        {/* Conditional Fields */}
                        {leaveType === 'multiple' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <div className="relative mt-1">
                                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input-field pr-10"/>
                                        <Icons.Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                                    <div className="relative mt-1">
                                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="input-field pr-10"/>
                                    <Icons.Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {leaveType === 'single' && (
                            <div>
                                <label htmlFor="singleDate" className="block text-sm font-medium text-gray-700">Date</label>
                                <div className="relative mt-1">
                                <input type="date" id="singleDate" value={startDate} onChange={e => {setStartDate(e.target.value); setEndDate(e.target.value);}} required className="input-field pr-10"/>
                                <Icons.Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}
                        {leaveType === 'half' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="halfDayDate" className="block text-sm font-medium text-gray-700">Date</label>
                                    <div className="relative mt-1">
                                        <input type="date" id="halfDayDate" value={startDate} onChange={e => {setStartDate(e.target.value); setEndDate(e.target.value);}} required className="input-field pr-10"/>
                                        <Icons.Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="period" className="block text-sm font-medium text-gray-700">Period</label>
                                    <select id="period" value={period} onChange={e => setPeriod(e.target.value as 'Morning' | 'Afternoon')} required className="mt-1 input-field appearance-none">
                                        <option>Morning</option>
                                        <option>Afternoon</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Reason Field */}
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
                            <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={4} required placeholder="Briefly explain your reason for leave" className="mt-1 input-field"></textarea>
                        </div>
                    </fieldset>

                    {remainingLeaves <= 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
                            <p className="font-semibold">Leave Quota Exhausted</p>
                            <p className="text-sm">You cannot apply for leave as you have no remaining days for this month.</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit" disabled={remainingLeaves <= 0}>Submit Request</Button>
                    </div>
                </form>
            </Card>

            {/* Leave History */}
            <Card title="Your Leave History">
                {leaveRequests.length > 0 ? (
                <ul className="space-y-3 max-h-96 overflow-y-auto">
                    {leaveRequests.map(req => (
                    <li key={req.id} className="p-3 bg-gray-50 rounded-md border-l-4" style={{borderColor: LEAVE_STATUS_COLORS[req.status].split(' ')[0].replace('bg', 'border')}}>
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-gray-800">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mt-1">{req.reason}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${LEAVE_STATUS_COLORS[req.status]}`}>
                            {req.status}
                        </span>
                        </div>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-gray-500 text-center py-4">You have not applied for any leave yet.</p>
                )}
            </Card>
        </div>

        {/* Right sidebar: Break Timer */}
        <div className="lg:col-span-2">
            <Card title="Break Timer">
                <div className="flex flex-col items-center justify-center space-y-4 p-4">
                    <p className="text-5xl font-mono text-primary-700">{breakTimer}</p>
                    <Button 
                        onClick={toggleBreak} 
                        variant={isBreakActive ? "danger" : "primary"}
                        leftIcon={isBreakActive ? Icons.XCircle : Icons.Clock}
                    >
                        {isBreakActive ? 'End Break' : 'Start Break'}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">Breaks are not counted towards your work hours. Please ensure you take them responsibly.</p>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default InternLeavePage;