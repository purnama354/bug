import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from './types';
import { loadFromStorage, saveToStorage, getDefaultTask } from './utils/helpers';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import Statistics from './components/Statistics';
import ActivityLog from './components/ActivityLog';

function App() {
  // BUG #9: Reading from localStorage on EVERY render instead of initializing once
  // loadFromStorage does JSON.parse each time, which is expensive for large datasets
  // Should use lazy initialization: useState(() => loadFromStorage(...))
  const [tasks, setTasks] = useState<Task[]>(loadFromStorage<Task[]>('tasks') || []);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  
  // Track renders for debugging
  useEffect(() => {
    setRenderCount(c => c + 1);
  });

  // BUG #10: Saving to localStorage on every render (not just when tasks change)
  // This blocks the main thread with JSON.stringify on every single render
  // Should be in a useEffect with [tasks] dependency
  saveToStorage('tasks', tasks);

  // BUG #11: Creating new object reference for defaultTask on every render
  // This causes child components to re-render unnecessarily if they receive this as a prop
  const defaultTask = getDefaultTask();

  // BUG #12: Not using useCallback for event handlers
  // These create new function references on every render
  // causing unnecessary re-renders in child components
  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed, completedAt: !task.completed ? Date.now() : undefined }
          : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    setFilter(newFilter);
  };

  const handleSessionComplete = () => {
    setSessionsCompleted(prev => prev + 1);
  };

  // BUG #13: Simulated "real-time" updates with setInterval that's never cleared
  // This creates a new interval every time the component re-renders
  // and none of them are ever cleaned up
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Simulate checking for updates
      console.log('[DEBUG] Checking for updates...', new Date().toISOString());
    }, 5000);
    
    // BUG: No cleanup function!
    // Should be: return () => clearInterval(intervalId);
  }, []); // This one at least has correct deps, but no cleanup

  // BUG #14: Window scroll listener added without cleanup
  // and added in a useEffect that depends on [tasks]
  // meaning it adds a new listener every time tasks change
  useEffect(() => {
    const handleScroll = () => {
      // Performance tracking
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      document.title = `Productivity Dashboard (${Math.round(scrollPercent)}% scrolled)`;
    };

    window.addEventListener('scroll', handleScroll);
    // BUG: Missing cleanup!
    // return () => window.removeEventListener('scroll', handleScroll);
  }, [tasks]); // BUG: tasks dependency causes re-adding listener on every task change

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-rocket text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Productivity Dashboard</h1>
                <p className="text-xs text-gray-500">Stay focused, get things done</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* BUG indicator - shows render count for debugging */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Renders:</span>
                <span className="text-sm font-mono font-bold text-indigo-600">{renderCount}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
                <i className="fas fa-fire text-orange-500"></i>
                <span className="text-sm font-bold text-indigo-700">{sessionsCompleted}</span>
                <span className="text-xs text-gray-500">sessions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Task List */}
          <div className="lg:col-span-2">
            <TaskList
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              filter={filter}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Right column - Timer & Stats */}
          <div className="space-y-6">
            <PomodoroTimer onSessionComplete={handleSessionComplete} />
            <Statistics tasks={tasks} sessionsCompleted={sessionsCompleted} />
          </div>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityLog sessionsCompleted={sessionsCompleted} />
          
          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <i className="fas fa-bullseye mr-2 text-indigo-500"></i>
              Quick Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Active Tasks</span>
                <span className="font-bold text-indigo-600">
                  {tasks.filter(t => !t.completed).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Completed Today</span>
                <span className="font-bold text-green-600">
                  {tasks.filter(t => t.completed && t.completedAt && 
                    new Date(t.completedAt).toDateString() === new Date().toDateString()
                  ).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">High Priority Pending</span>
                <span className="font-bold text-red-600">
                  {tasks.filter(t => !t.completed && t.priority === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Focus Time (est.)</span>
                <span className="font-bold text-purple-600">
                  {sessionsCompleted * 25} min
                </span>
              </div>
            </div>

            {/* Motivational quote */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-700 italic">
                "The secret of getting ahead is getting started."
              </p>
              <p className="text-xs text-indigo-500 mt-1">— Mark Twain</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <i className="fas fa-code mr-1"></i> Built with React & Tailwind CSS
            </p>
            <p className="text-sm text-gray-400">
              <i className="fas fa-bug mr-1 text-red-400"></i>
              <span className="text-red-400 font-medium">Contains intentional bugs for practice</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
