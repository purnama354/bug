import React, { useMemo } from 'react';
import { Task } from '../types';
import { calculateStatistics } from '../utils/helpers';

interface StatisticsProps {
  tasks: Task[];
  sessionsCompleted: number;
}

const Statistics: React.FC<StatisticsProps> = ({ tasks, sessionsCompleted }) => {
  // BUG #7: calculateStatistics is called directly without useMemo
  // This means the expensive O(n^2) computation runs on EVERY render
  // even if tasks haven't changed
  const stats = calculateStatistics(tasks);

  // This one IS memoized correctly (to show contrast)
  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((stats.completedTasks / tasks.length) * 100);
  }, [tasks.length, stats.completedTasks]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <i className="fas fa-chart-bar mr-2 text-indigo-500"></i>
        Statistics
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
          <p className="text-sm text-indigo-600 font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-indigo-800">{stats.totalTasks}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-800">{stats.completedTasks}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium">Completion Rate</p>
          <p className="text-3xl font-bold text-yellow-800">{completionRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Focus Sessions</p>
          <p className="text-3xl font-bold text-purple-800">{sessionsCompleted}</p>
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Priority Breakdown</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">High</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (stats.highPriority / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-700 w-6 text-right">{stats.highPriority}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">Medium</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (stats.mediumPriority / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-700 w-6 text-right">{stats.mediumPriority}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-12">Low</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${tasks.length > 0 ? (stats.lowPriority / tasks.length) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-700 w-6 text-right">{stats.lowPriority}</span>
          </div>
        </div>
      </div>

      {/* Productivity score */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Productivity Score</p>
            <p className="text-2xl font-bold">{Math.min(100, Math.round(stats.productivityScore)).toFixed(0)}</p>
          </div>
          <div className="text-4xl opacity-80">
            <i className="fas fa-trophy"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
