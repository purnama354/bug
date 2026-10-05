import React, { useState, useEffect, useRef } from 'react';

interface ActivityLogProps {
  sessionsCompleted: number;
}

interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning';
}

const ActivityLog: React.FC<ActivityLogProps> = ({ sessionsCompleted }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const prevSessionsRef = useRef(sessionsCompleted);

  // BUG #8: EVENT LISTENER LEAK
  // Adding resize listener without cleanup
  // Every time this component re-renders (which happens when sessionsCompleted changes),
  // a NEW event listener is added but never removed
  // This causes memory to grow unboundedly
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    
    // BUG: Missing cleanup - should return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }); // BUG: No dependency array at all! This runs on EVERY render

  // Log session completions
  useEffect(() => {
    if (sessionsCompleted > prevSessionsRef.current) {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2),
        message: `Focus session #${sessionsCompleted} completed! 🎉`,
        timestamp: Date.now(),
        type: 'success',
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }
    prevSessionsRef.current = sessionsCompleted;
  }, [sessionsCompleted]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const typeStyles = {
    info: 'text-blue-500 bg-blue-50',
    success: 'text-green-500 bg-green-50',
    warning: 'text-yellow-500 bg-yellow-50',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fas fa-stream mr-2 text-indigo-500"></i>
          Activity Log
        </h2>
        {/* BUG: This shows window size which updates on every render due to the event listener leak */}
        <span className="text-xs text-gray-400 font-mono">
          {windowSize.width}x{windowSize.height}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <i className="fas fa-history text-3xl mb-2"></i>
            <p className="text-sm">No activity yet. Start a focus session!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 p-2 rounded-lg ${typeStyles[log.type]}`}
            >
              <i className={`fas ${log.type === 'success' ? 'fa-check-circle' : log.type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'} mt-0.5`}></i>
              <div className="flex-1">
                <p className="text-sm font-medium">{log.message}</p>
                <p className="text-xs opacity-60">{formatTime(log.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
