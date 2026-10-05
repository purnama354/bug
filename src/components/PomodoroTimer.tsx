import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { generateId } from '../utils/helpers';

interface PomodoroTimerProps {
  onSessionComplete: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const intervalRef = useRef<number | null>(null);

  // BUG #5: MEMORY LEAK - setInterval is never cleaned up
  // When component unmounts, the interval keeps running
  // Also, there's no cleanup when isRunning changes to false
  useEffect(() => {
    if (isRunning) {
      // Missing: clearing previous interval before setting new one
      // Missing: cleanup function to clear interval on unmount
      const id = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            if (mode === 'work') {
              setSessions(s => s + 1);
              onSessionComplete();
              setMode('break');
              return 5 * 60; // 5 min break
            } else {
              setMode('work');
              return 25 * 60; // 25 min work
            }
          }
          return prev - 1;
        });
      }, 1000);
      intervalRef.current = id;
      
      // BUG: No cleanup function returned!
      // Should be: return () => clearInterval(id);
    }
  }, [isRunning, mode, onSessionComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fas fa-clock mr-2 text-indigo-500"></i>
          Pomodoro Timer
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          mode === 'work' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {mode === 'work' ? '🔥 Focus' : '☕ Break'}
        </span>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular progress */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={mode === 'work' ? '#6366f1' : '#10b981'}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-mono font-bold text-gray-800">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={toggleTimer}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
              isRunning 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <i className="fas fa-redo mr-2"></i>
            Reset
          </button>
        </div>

        {/* Session counter */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Sessions completed today</p>
          <div className="flex gap-1 mt-2 justify-center">
            {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-indigo-500"></div>
            ))}
            {sessions === 0 && (
              <span className="text-xs text-gray-400">No sessions yet</span>
            )}
          </div>
          <p className="text-lg font-bold text-indigo-600 mt-1">{sessions} sessions</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
