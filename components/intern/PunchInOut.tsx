
import React, { useState, useEffect } from 'react';
import Button from '../shared/Button';
import { PunchStatus, PunchLog } from '../../types';
import { Icons } from '../../constants';
import { useData } from '../../contexts/DataContext';

interface PunchInOutProps {
  internId: string;
}

const PunchInOut: React.FC<PunchInOutProps> = ({ internId }) => {
  const { punchLogs, punchIn, punchOut } = useData();
  const [punchStatus, setPunchStatus] = useState<PunchStatus | undefined>();
  const [currentLog, setCurrentLog] = useState<PunchLog | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<string>("00:00:00");

  useEffect(() => {
    const logForStatus = punchLogs.find(p => p.internId === internId && !p.punchOutTime);
    if (logForStatus) {
        setPunchStatus(PunchStatus.PUNCHED_IN);
        setCurrentLog(logForStatus);
    } else {
        setPunchStatus(PunchStatus.PUNCHED_OUT);
        const lastLog = punchLogs
            .filter(p => p.internId === internId && p.punchOutTime)
            .sort((a,b) => new Date(b.punchOutTime!).getTime() - new Date(a.punchOutTime!).getTime())[0];
        setCurrentLog(lastLog);
    }
  }, [punchLogs, internId]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (punchStatus === PunchStatus.PUNCHED_IN && currentLog?.punchInTime) {
      const punchInDate = new Date(currentLog.punchInTime);
      intervalId = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - punchInDate.getTime();
        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
        setTimer(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else {
      setTimer("00:00:00");
    }
    return () => clearInterval(intervalId);
  }, [punchStatus, currentLog]);


  const handlePunch = async () => {
    setIsLoading(true);
    try {
      if (punchStatus === PunchStatus.PUNCHED_OUT || !punchStatus) {
        await punchIn(internId);
      } else {
        await punchOut(internId);
      }
    } catch (error) {
      console.error("Punch action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPunchedIn = punchStatus === PunchStatus.PUNCHED_IN;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">
          {isPunchedIn ? 'You are Punched In' : 'You are Punched Out'}
        </h3>
        
        {isPunchedIn && currentLog?.punchInTime && (
          <div className="text-center">
            <p className="text-sm text-gray-500">Punched in at: {new Date(currentLog.punchInTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            <p className="text-2xl font-mono text-primary-600 mt-1">{timer}</p>
          </div>
        )}
        {!isPunchedIn && currentLog?.punchOutTime && (
             <p className="text-sm text-gray-500">Last punch out: {new Date(currentLog.punchOutTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        )}

        <Button
          onClick={handlePunch}
          variant={isPunchedIn ? 'danger' : 'success'}
          size="lg"
          disabled={isLoading}
          leftIcon={isPunchedIn ? Icons.XCircle : Icons.CheckCircle}
          className="w-full max-w-xs"
        >
          {isLoading ? 'Processing...' : (isPunchedIn ? 'Punch Out' : 'Punch In')}
        </Button>
      </div>
    </div>
  );
};

export default PunchInOut;
