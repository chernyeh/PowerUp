// Persistent workout history using localStorage
const STORAGE_KEY = 'fitpulse_workouts';
const STATS_KEY = 'fitpulse_stats';

export function getWorkoutHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWorkout(workout) {
  const history = getWorkoutHistory();
  history.unshift(workout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  updateStats(history);
  return history;
}

export function deleteWorkout(index) {
  const history = getWorkoutHistory();
  history.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  updateStats(history);
  return history;
}

export function getStats() {
  if (typeof window === 'undefined') return { totalWorkouts: 0, totalCalories: 0, totalTime: 0 };
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : { totalWorkouts: 0, totalCalories: 0, totalTime: 0 };
  } catch {
    return { totalWorkouts: 0, totalCalories: 0, totalTime: 0 };
  }
}

function updateStats(history) {
  const stats = {
    totalWorkouts: history.length,
    totalCalories: history.reduce((sum, w) => sum + (w.totalCalories || 0), 0),
    totalTime: history.reduce((sum, w) => sum + (w.totalTime || 0), 0),
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function exportHistoryCSV() {
  const history = getWorkoutHistory();
  const rows = [
    ['Date', 'Fitness Level', 'Duration (mins)', 'Total Calories', 'Goal', 'Exercises'].join(','),
    ...history.map(w => {
      const exNames = w.exercises
        ? Object.values(w.exercises).map(e => e.name).join('; ')
        : '';
      return [
        new Date(w.date).toLocaleDateString(),
        w.fitnessLevel,
        w.duration,
        w.totalCalories,
        w.goal || 'Custom',
        `"${exNames}"`,
      ].join(',');
    }),
  ].join('\n');

  const blob = new Blob([rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitpulse-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
