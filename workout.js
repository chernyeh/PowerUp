// src/lib/workout.js
// Workout plan generation and calculation utilities

import { exercises, goals } from './exercises';

/**
 * Generate a complete workout plan based on config
 * @param {Object} config - Workout configuration
 * @returns {Array} Array of workout items (exercises + rest)
 */
export const generateWorkoutPlan = (config) => {
  const { duration, fitnessLevel, selectedGoal, selectedExercises } = config;
  let plan = [];
  let exerciseList = selectedExercises || [];
  let totalMinutes = duration;

  // If using preset goal, override selected exercises
  if (selectedGoal && (!selectedExercises || selectedExercises.length === 0)) {
    const goal = goals[selectedGoal];
    if (!goal) return [];

    const totalRatio = goal.distribution.reduce((a, b) => a + b, 0);
    exerciseList = goal.exercises;
    const timePerExercise = goal.distribution.map(
      (dist) => (dist / totalRatio) * totalMinutes
    );

    // Build plan with exercises and rest periods
    exerciseList.forEach((exName, idx) => {
      const minutes = Math.round(timePerExercise[idx] * 2) / 2; // Round to nearest 0.5
      const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
      const secondsPerSet = (minutes / sets) * 60;

      for (let i = 0; i < sets; i++) {
        plan.push({
          exercise: exName,
          duration: Math.ceil(secondsPerSet), // Round up to whole seconds
          set: i + 1,
          totalSets: sets,
        });

        // Add rest between sets (but not after last set)
        if (i < sets - 1) {
          plan.push({
            type: 'rest',
            duration: 30,
          });
        }
      }
    });
  }

  return plan;
};

/**
 * Calculate workout results (calories per exercise)
 * @param {Array} workoutPlan - The workout plan array
 * @param {String} fitnessLevel - Fitness level (light/intermediate/vigorous)
 * @returns {Object} Results breakdown by exercise
 */
export const calculateWorkoutResults = (workoutPlan, fitnessLevel) => {
  const results = {};

  workoutPlan.forEach((item) => {
    // Skip rest periods
    if (item.type === 'rest') return;

    const exKey = item.exercise;
    const exData = exercises[exKey];
    if (!exData) return;

    const caloriesPerMin = exData.caloriesPerMin[fitnessLevel];
    const durationMin = item.duration / 60;
    const calories = Math.round(durationMin * caloriesPerMin);

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
};

/**
 * Get total calories from results
 * @param {Object} results - Results object from calculateWorkoutResults
 * @returns {Number} Total calories burned
 */
export const getTotalCalories = (results) => {
  return Object.values(results).reduce((sum, ex) => sum + (ex.totalCalories || 0), 0);
};

/**
 * Format seconds to MM:SS format
 * @param {Number} seconds - Duration in seconds
 * @returns {String} Formatted time string
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Convert seconds to minutes (with decimals)
 * @param {Number} seconds - Duration in seconds
 * @returns {Number} Duration in minutes
 */
export const secondsToMinutes = (seconds) => {
  return Math.round((seconds / 60) * 10) / 10;
};

/**
 * Estimate fat burned from calories
 * 1 pound of fat ≈ 3,500 calories
 * @param {Number} caloriesBurned - Total calories burned
 * @returns {Number} Pounds of fat burned (theoretical)
 */
export const estimateFatBurned = (caloriesBurned) => {
  return Math.round((caloriesBurned / 3500) * 1000) / 1000;
};

/**
 * Get motivational message based on workout intensity
 * @param {Number} totalCalories - Total calories burned
 * @param {Number} durationSeconds - Duration in seconds
 * @param {String} fitnessLevel - Fitness level
 * @returns {String} Motivational message
 */
export const getMotivationalMessage = (totalCalories, durationSeconds, fitnessLevel) => {
  const caloriesPerMin = totalCalories / (durationSeconds / 60);
  const fatBurned = estimateFatBurned(totalCalories);

  if (caloriesPerMin > 12) {
    return `🔥 BEAST MODE! You burned ${totalCalories} calories - that's ${fatBurned.toFixed(2)}lbs of fat theoretical equivalent!`;
  } else if (caloriesPerMin > 8) {
    return `💪 Awesome work! ${totalCalories} calories burned. Keep crushing it!`;
  } else if (caloriesPerMin > 5) {
    return `✨ Great effort! You're building strength and endurance. ${totalCalories} calories burned!`;
  } else {
    return `🎉 Nice work! You completed your workout and burned ${totalCalories} calories. Every rep counts!`;
  }
};

/**
 * Validate workout configuration
 * @param {Object} config - Workout configuration
 * @returns {Object} { isValid: boolean, errors: array }
 */
export const validateWorkoutConfig = (config) => {
  const errors = [];

  if (!config.duration || config.duration < 10 || config.duration > 60) {
    errors.push('Duration must be between 10 and 60 minutes');
  }

  if (!config.fitnessLevel) {
    errors.push('Fitness level must be selected');
  }

  if (!config.selectedGoal && (!config.selectedExercises || config.selectedExercises.length === 0)) {
    errors.push('Must select either a goal or specific exercises');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Create a structured workout object for storage
 * @param {Object} config - Workout configuration
 * @param {Object} results - Results from calculateWorkoutResults
 * @param {Number} totalTime - Total time used (seconds)
 * @returns {Object} Complete workout object
 */
export const createWorkoutObject = (config, results, totalTime) => {
  const totalCalories = getTotalCalories(results);
  const fatBurned = estimateFatBurned(totalCalories);

  return {
    date: new Date().toISOString(),
    fitnessLevel: config.fitnessLevel,
    ageRange: config.ageRange,
    duration: config.duration,
    goal: config.selectedGoal || 'custom',
    calorieTarget: config.calorieTarget,
    totalCalories,
    totalTime,
    fatBurned,
    exercises: results,
    completed: true,
    motivationalMessage: getMotivationalMessage(totalCalories, totalTime, config.fitnessLevel),
  };
};

/**
 * Compare workout progress over time
 * @param {Array} workouts - Array of workout objects
 * @returns {Object} Progress metrics
 */
export const calculateProgress = (workouts) => {
  if (workouts.length < 2) {
    return {
      totalWorkouts: workouts.length,
      message: 'Complete more workouts to see progress!',
    };
  }

  const sorted = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstWorkout = sorted[0];
  const lastWorkout = sorted[sorted.length - 1];

  const calorieIncrease = lastWorkout.totalCalories - firstWorkout.totalCalories;
  const caloriePercent = Math.round((calorieIncrease / firstWorkout.totalCalories) * 100);

  return {
    totalWorkouts: workouts.length,
    firstWorkoutCalories: firstWorkout.totalCalories,
    lastWorkoutCalories: lastWorkout.totalCalories,
    calorieIncrease,
    caloriePercent,
    trend: calorieIncrease > 0 ? '📈 Increasing intensity' : '⚖️ Consistent intensity',
  };
};

/**
 * Get personalized recommendations based on history
 * @param {Array} workouts - Array of workout objects
 * @returns {Array} Array of recommendation strings
 */
export const getRecommendations = (workouts) => {
  const recommendations = [];

  if (workouts.length === 0) {
    return ['Time to start your fitness journey! Complete your first workout.'];
  }

  const avgCalories = Math.round(
    workouts.reduce((sum, w) => sum + w.totalCalories, 0) / workouts.length
  );

  if (avgCalories < 200) {
    recommendations.push('💡 Try longer workouts or increase intensity to burn more calories');
  }

  if (workouts.length < 3) {
    recommendations.push('⏰ Aim for 3+ workouts per week for best results');
  }

  const recentWorkouts = workouts.slice(0, 3);
  const avgRecentCalories = Math.round(
    recentWorkouts.reduce((sum, w) => sum + w.totalCalories, 0) / recentWorkouts.length
  );

  if (avgRecentCalories > avgCalories) {
    recommendations.push('🔥 Great progress! Your recent workouts are more intense');
  }

  return recommendations;
};
