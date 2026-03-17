// src/lib/storage.js
// Persistent storage for workout history using browser storage API

// Initialize storage if not available
export const initializeStorage = async () => {
  if (typeof window !== 'undefined' && !window.storage) {
    console.warn('Storage API not available, using fallback');
    // Fallback to localStorage
    return true;
  }
  return true;
};

// Save a completed workout
export const saveWorkout = async (workout) => {
  try {
    const key = `workout:${Date.now()}`;
    const value = JSON.stringify({
      ...workout,
      id: key,
      date: new Date().toISOString(),
    });
    
    if (window.storage) {
      await window.storage.set(key, value);
    } else {
      // Fallback to localStorage
      const allWorkouts = JSON.parse(localStorage.getItem('fitpulse_workouts') || '[]');
      allWorkouts.push(JSON.parse(value));
      localStorage.setItem('fitpulse_workouts', JSON.stringify(allWorkouts));
    }
    
    console.log('✅ Workout saved:', key);
    return key;
  } catch (error) {
    console.error('❌ Error saving workout:', error);
    throw error;
  }
};

// Load all workouts from history
export const loadWorkoutHistory = async () => {
  try {
    if (window.storage) {
      const result = await window.storage.list('workout:');
      if (!result?.keys || result.keys.length === 0) {
        return [];
      }
      
      const workouts = [];
      for (const key of result.keys) {
        try {
          const data = await window.storage.get(key);
          if (data?.value) {
            workouts.push(JSON.parse(data.value));
          }
        } catch (e) {
          console.error('Error loading workout:', key, e);
        }
      }
      
      // Sort by date descending
      return workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      // Fallback to localStorage
      const allWorkouts = JSON.parse(localStorage.getItem('fitpulse_workouts') || '[]');
      return allWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  } catch (error) {
    console.error('❌ Error loading workout history:', error);
    return [];
  }
};

// Get specific workout by ID
export const getWorkout = async (workoutId) => {
  try {
    if (window.storage) {
      const result = await window.storage.get(workoutId);
      return result?.value ? JSON.parse(result.value) : null;
    } else {
      const allWorkouts = JSON.parse(localStorage.getItem('fitpulse_workouts') || '[]');
      return allWorkouts.find((w) => w.id === workoutId) || null;
    }
  } catch (error) {
    console.error('❌ Error getting workout:', error);
    return null;
  }
};

// Delete a workout
export const deleteWorkout = async (workoutId) => {
  try {
    if (window.storage) {
      await window.storage.delete(workoutId);
    } else {
      const allWorkouts = JSON.parse(localStorage.getItem('fitpulse_workouts') || '[]');
      const filtered = allWorkouts.filter((w) => w.id !== workoutId);
      localStorage.setItem('fitpulse_workouts', JSON.stringify(filtered));
    }
    
    console.log('✅ Workout deleted:', workoutId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting workout:', error);
    return false;
  }
};

// Calculate stats from workout history
export const calculateStats = (workouts) => {
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalCalories: 0,
      totalTime: 0,
      avgCaloriesPerWorkout: 0,
      avgDuration: 0,
    };
  }
  
  const totalCalories = workouts.reduce((sum, w) => sum + (w.totalCalories || 0), 0);
  const totalTime = workouts.reduce((sum, w) => sum + (w.totalTime || 0), 0);
  
  return {
    totalWorkouts: workouts.length,
    totalCalories,
    totalTime,
    avgCaloriesPerWorkout: Math.round(totalCalories / workouts.length),
    avgDuration: Math.round(totalTime / workouts.length),
    fatBurned: Math.round((totalCalories / 3500) * 10) / 10, // pounds
  };
};

// Export workout history as CSV
export const exportWorkoutHistoryCSV = (workouts) => {
  const headers = ['Date', 'Duration (mins)', 'Fitness Level', 'Goal', 'Total Calories', 'Exercises'];
  
  const rows = workouts.map((w) => [
    new Date(w.date).toLocaleDateString(),
    w.duration,
    w.fitnessLevel,
    w.goal || 'Custom',
    w.totalCalories,
    Object.keys(w.exercises || {}).join(', '),
  ]);
  
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  
  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitpulse-history-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Clear all workouts (for reset/testing)
export const clearAllWorkouts = async () => {
  try {
    if (window.storage) {
      const result = await window.storage.list('workout:');
      if (result?.keys) {
        for (const key of result.keys) {
          await window.storage.delete(key);
        }
      }
    } else {
      localStorage.removeItem('fitpulse_workouts');
    }
    
    console.log('✅ All workouts cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing workouts:', error);
    return false;
  }
};

// Export all data as JSON (for backup)
export const exportWorkoutHistoryJSON = async (workouts) => {
  const data = {
    exportDate: new Date().toISOString(),
    appVersion: '2.0',
    workouts,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitpulse-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};
