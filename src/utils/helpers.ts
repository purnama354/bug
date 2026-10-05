import { Task } from '../types';

// BUG #1: Expensive computation without memoization
// This function is called on every render and does O(n^2) work
export function calculateStatistics(tasks: Task[]) {
  const startTime = performance.now();
  
  // Simulating expensive computation - calculating correlation between tasks
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    mediumPriority: tasks.filter(t => t.priority === 'medium').length,
    lowPriority: tasks.filter(t => t.priority === 'low').length,
    averageCompletionTime: 0,
    productivityScore: 0,
    tagDistribution: {} as Record<string, number>,
  };

  // BUG: O(n^2) nested loop - unnecessary expensive computation
  for (let i = 0; i < tasks.length; i++) {
    for (let j = 0; j < tasks.length; j++) {
      if (i !== j && tasks[i].tags.some(tag => tasks[j].tags.includes(tag))) {
        stats.productivityScore += 0.01;
      }
    }
  }

  // Calculate average completion time
  const completedWithTime = tasks.filter(t => t.completed && t.completedAt);
  if (completedWithTime.length > 0) {
    const totalTime = completedWithTime.reduce((sum, t) => sum + (t.completedAt! - t.createdAt), 0);
    stats.averageCompletionTime = totalTime / completedWithTime.length;
  }

  // Calculate tag distribution
  tasks.forEach(task => {
    task.tags.forEach(tag => {
      stats.tagDistribution[tag] = (stats.tagDistribution[tag] || 0) + 1;
    });
  });

  const endTime = performance.now();
  console.log(`[PERF] calculateStatistics took ${endTime - startTime}ms`);
  
  return stats;
}

// BUG #2: No caching for localStorage reads
// Every call reads from localStorage (blocking I/O simulation)
export function loadFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return null;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage:', e);
  }
}

// BUG #3: Simulated API call without abort/cancellation support
export function simulateSearchAPI(query: string): Promise<string[]> {
  return new Promise((resolve) => {
    const delay = Math.random() * 1000 + 200; // Random delay 200-1200ms
    setTimeout(() => {
      const mockResults = [
        'Fix login bug', 'Update dependencies', 'Write tests',
        'Deploy to production', 'Code review', 'Database migration',
        'API integration', 'UI redesign', 'Performance optimization',
        'Security audit', 'Documentation update', 'Bug fix sprint'
      ];
      const filtered = mockResults.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    }, delay);
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// BUG #4: Creates new object reference every time (causes unnecessary re-renders)
export function getDefaultTask(): Omit<Task, 'id' | 'createdAt'> {
  return {
    title: '',
    description: '',
    priority: 'medium',
    completed: false,
    tags: [],
  };
}
