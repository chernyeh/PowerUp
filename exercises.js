// src/lib/exercises.js
// Exercise database with calorie calculations and video tutorials

export const exercises = {
  skipping: {
    caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 },
    description: 'Jump Rope',
    videoId: 'N5RqJqG5K6c',
    tips: 'Keep a steady rhythm. Land softly on the balls of your feet.',
    icon: '🪢',
  },
  plank: {
    caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 },
    description: 'Plank Hold',
    videoId: 'ASdvN7yuXq8',
    tips: 'Keep your body straight. Engage your core.',
    icon: '📍',
  },
  sidePlank: {
    caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 },
    description: 'Side Plank',
    videoId: 'qFj-xc3u5y0',
    tips: 'Keep your body in a straight line. Breathe steadily.',
    icon: '📐',
  },
  pushups: {
    caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 },
    description: 'Push-ups',
    videoId: 'Eh00_rniF8E',
    tips: 'Lower yourself until your chest nearly touches the ground.',
    icon: '💪',
  },
  balanceBoard: {
    caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 },
    description: 'Balance Board',
    videoId: 'Z9aXvC5BjD0',
    tips: 'Focus on stability. Small adjustments help!',
    icon: '⚖️',
  },
  burpees: {
    caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 },
    description: 'Burpees',
    videoId: 'JZQA8BlU2fg',
    tips: 'Go at your own pace. Quality over speed.',
    icon: '🔄',
  },
  mountainClimbers: {
    caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 },
    description: 'Mountain Climbers',
    videoId: 'nmwgirgblLw',
    tips: 'Alternate legs quickly. Keep your hips level.',
    icon: '⛰️',
  },
  jumpingJacks: {
    caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 },
    description: 'Jumping Jacks',
    videoId: '0Cxfh9Mh_1E',
    tips: 'Keep a steady pace. You\'re almost there!',
    icon: '🤸',
  },
};

export const goals = {
  general: {
    name: 'General Fitness',
    exercises: ['skipping', 'pushups', 'jumpingJacks', 'mountainClimbers'],
    distribution: [2, 1.5, 1.5, 1.5],
    icon: '🎯',
  },
  core: {
    name: 'Core Strength',
    exercises: ['plank', 'sidePlank', 'mountainClimbers', 'burpees'],
    distribution: [2, 2, 1.5, 1],
    icon: '🔥',
  },
  cardio: {
    name: 'Cardio Blast',
    exercises: ['skipping', 'jumpingJacks', 'burpees', 'mountainClimbers'],
    distribution: [2, 1.5, 1.5, 1.5],
    icon: '❤️',
  },
  balance: {
    name: 'Balance & Stability',
    exercises: ['balanceBoard', 'sidePlank', 'plank', 'pushups'],
    distribution: [2, 1.5, 1.5, 1.5],
    icon: '🧘',
  },
};

// Helper function to calculate calories
export const calculateCaloriesBurned = (durationSeconds, fitnessLevel, exerciseKey) => {
  const exercise = exercises[exerciseKey];
  if (!exercise) return 0;
  
  const caloriesPerMin = exercise.caloriesPerMin[fitnessLevel];
  const durationMin = durationSeconds / 60;
  return Math.round(durationMin * caloriesPerMin);
};

// Helper function to calculate calorie target options
export const calculateCalorieOptions = (duration, fitnessLevel) => {
  const fitnessMultiplier = { light: 0.7, intermediate: 1, vigorous: 1.3 };
  const baseCalories = duration * fitnessMultiplier[fitnessLevel] * 5;
  return [
    Math.round(baseCalories * 0.6),
    Math.round(baseCalories * 0.8),
    Math.round(baseCalories),
    Math.round(baseCalories * 1.2),
  ];
};
