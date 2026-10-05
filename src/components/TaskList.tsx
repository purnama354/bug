import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { generateId, simulateSearchAPI } from '../utils/helpers';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  filter,
  onFilterChange,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // BUG #6: STALE CLOSURE - searchQuery in dependency array is missing
  // The effect captures the initial value of searchQuery and never updates
  // because the dependency array is incomplete
  useEffect(() => {
    let cancelled = false;
    
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // BUG: Race condition - no cancellation of previous requests
      // If user types fast, multiple requests fire and results arrive out of order
      simulateSearchAPI(searchQuery).then((results) => {
        // BUG: No check if this effect is still relevant (stale closure)
        if (!cancelled) {
          setSearchResults(results);
          setIsSearching(false);
        }
      });
    } else {
      setSearchResults([]);
    }

    // BUG: Missing searchQuery in dependency array
    // This means the effect only runs once on mount, never when searchQuery changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Should be [searchQuery]

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle.trim(),
      description: '',
      priority: newTaskPriority,
      completed: false,
      createdAt: Date.now(),
      tags: [],
    };

    onAddTask(newTask);
    setNewTaskTitle('');
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <i className="fas fa-tasks mr-2 text-indigo-500"></i>
        Tasks
      </h2>

      {/* Search with suggestions */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search or add task..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
        />
        {isSearching && (
          <span className="absolute right-3 top-2.5 text-gray-400">
            <i className="fas fa-spinner fa-spin"></i>
          </span>
        )}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-40 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700"
                onClick={() => {
                  setNewTaskTitle(result);
                  setSearchResults([]);
                }}
              >
                <i className="fas fa-lightbulb mr-2 text-yellow-400"></i>
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add task form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New task title..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          onClick={handleAddTask}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
        >
          <i className="fas fa-plus mr-1"></i> Add
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1 opacity-75">
              ({f === 'all' ? tasks.length : tasks.filter(t => f === 'active' ? !t.completed : t.completed).length})
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <i className="fas fa-clipboard-list text-4xl mb-2"></i>
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                task.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-indigo-200'
              }`}
            >
              <button
                onClick={() => onToggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {task.completed && <i className="fas fa-check text-xs"></i>}
              </button>
              <div className="flex-1">
                <span className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
