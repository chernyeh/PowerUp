// Workout plan generation and calorie calculation logic
import { exercises, goals } from './exercises';

export function calculateCalorieOptions(duration, fitnessLevel) {
  const multiplier = { light: 0.7, intermediate: 1, vigorous: 1.3 };
  const base = duration * multiplier[fitnessLevel] * 5;
  return [
    Math.round(base * 0.6),
    Math.round(base * 0.8),
    Math.round(base),
    Math.round(base * 1.2),
  ];
}

export function generateWorkoutPlan(selectedGoal, selectedExercises, duration, fitnessLevel) {
  const plan = [];

  // Determine exercise list from goal or manual selection
  let exerciseList = selectedExercises.length > 0 ? selectedExercises : [];
  let distribution = null;

  if (selectedGoal && exerciseList.length === 0) {
    const goal = goals[selectedGoal];
    exerciseList = goal.exercises;
    distribution = goal.distribution;
  }

  if (exerciseList.length === 0) return plan;

  // Calculate time per exercise
  const totalRatio = distribution
    ? distribution.reduce((a, b) => a + b, 0)
    : exerciseList.length;

  const restDuration = fitnessLevel === 'light' ? 40 : fitnessLevel === 'intermediate' ? 30 : 20;
  const setsPerExercise = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;

  // Account for rest periods in total time
  const totalRestSets = exerciseList.length * (setsPerExercise - 1);
  const totalRestTime = totalRestSets * restDuration;
  const activeMinutes = Math.max(duration * 60 - totalRestTime, duration * 30); // at least half the time is active

  exerciseList.forEach((exName, idx) => {
    const ratio = distribution ? distribution[idx] : 1;
    const exerciseTime = (ratio / totalRatio) * activeMinutes;
    const secondsPerSet = Math.max(Math.round(exerciseTime / setsPerExercise), 15);

    for (let i = 0; i < setsPerExercise; i++) {
      plan.push({
        exercise: exName,
        duration: secondsPerSet,
        set: i + 1,
        totalSets: setsPerExercise,
        type: 'exercise',
      });

      // Add rest between sets (not after last set of last exercise)
      const isLastSetOfExercise = i === setsPerExercise - 1;
      const isLastExercise = idx === exerciseList.length - 1;
      if (!isLastSetOfExercise || !isLastExercise) {
        plan.push({
          type: 'rest',
          duration: isLastSetOfExercise ? restDuration + 10 : restDuration, // longer rest between exercises
        });
      }
    }
  });

  return plan;
}

export function calculateResults(workoutPlan, fitnessLevel) {
  const results = {};

  workoutPlan.forEach((item) => {
    if (item.type === 'rest') return;

    const exKey = item.exercise;
    const exData = exercises[exKey];
    if (!exData) return;

    const caloriesPerMin = exData.caloriesPerMin[fitnessLevel];
    const calories = Math.round((item.duration / 60) * caloriesPerMin);

    if (!results[exKey]) {
      results[exKey] = {
        name: exData.description,
        totalCalories: 0,
        totalTime: 0,
        sets: 0,
      };
    }

    results[exKey].totalCalories += calories;
    results[exKey].totalTime += item.duration;
    results[exKey].sets += 1;
  });

  return results;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
