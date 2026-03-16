// Exercise definitions with calorie data, video demos, and form tips
export const exercises = {
  skipping: {
    caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 },
    description: 'Jump Rope',
    videoId: 'N5RqJqG5K6c',
    tips: 'Keep a steady rhythm. Land softly on the balls of your feet. Keep elbows close to your body and use wrist rotation.',
    icon: '🏃',
    muscles: ['Calves', 'Quads', 'Shoulders', 'Core'],
  },
  plank: {
    caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 },
    description: 'Plank Hold',
    videoId: 'ASdvN7yuXq8',
    tips: 'Keep your body in a straight line from head to heels. Engage your core and glutes. Breathe steadily.',
    icon: '🧘',
    muscles: ['Core', 'Shoulders', 'Glutes', 'Back'],
  },
  sidePlank: {
    caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 },
    description: 'Side Plank',
    videoId: 'qFj-xc3u5y0',
    tips: 'Keep your body in a straight line. Stack your feet or stagger them for stability. Breathe steadily.',
    icon: '🔄',
    muscles: ['Obliques', 'Shoulders', 'Hips', 'Core'],
  },
  pushups: {
    caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 },
    description: 'Push-ups',
    videoId: 'Eh00_rniF8E',
    tips: 'Lower yourself until your chest nearly touches the ground. Keep your core tight and back flat.',
    icon: '💪',
    muscles: ['Chest', 'Triceps', 'Shoulders', 'Core'],
  },
  balanceBoard: {
    caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 },
    description: 'Balance Board',
    videoId: 'Z9aXvC5BjD0',
    tips: 'Focus on stability. Small adjustments help! Keep your eyes on a fixed point ahead.',
    icon: '⚖️',
    muscles: ['Core', 'Ankles', 'Legs', 'Stabilizers'],
  },
  burpees: {
    caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 },
    description: 'Burpees',
    videoId: 'JZQA8BlU2fg',
    tips: 'Go at your own pace. Quality over speed. Land softly and use the momentum from the squat.',
    icon: '🔥',
    muscles: ['Full Body', 'Core', 'Chest', 'Legs'],
  },
  mountainClimbers: {
    caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 },
    description: 'Mountain Climbers',
    videoId: 'nmwgirgblLw',
    tips: 'Alternate legs quickly. Keep your hips level and core engaged throughout the movement.',
    icon: '⛰️',
    muscles: ['Core', 'Shoulders', 'Quads', 'Hip Flexors'],
  },
  jumpingJacks: {
    caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 },
    description: 'Jumping Jacks',
    videoId: '0Cxfh9Mh_1E',
    tips: 'Keep a steady pace. Land softly with slightly bent knees. Fully extend arms overhead.',
    icon: '⭐',
    muscles: ['Full Body', 'Calves', 'Shoulders', 'Core'],
  },
};

export const goals = {
  general: {
    name: 'General Fitness',
    description: 'Well-rounded workout targeting all muscle groups',
    exercises: ['skipping', 'pushups', 'jumpingJacks', 'mountainClimbers'],
    distribution: [2, 1.5, 1.5, 1.5],
    icon: '🎯',
  },
  core: {
    name: 'Core Strength',
    description: 'Build a rock-solid midsection',
    exercises: ['plank', 'sidePlank', 'mountainClimbers', 'burpees'],
    distribution: [2, 2, 1.5, 1],
    icon: '🧱',
  },
  cardio: {
    name: 'Cardio Blast',
    description: 'Maximum calorie burn and endurance',
    exercises: ['skipping', 'jumpingJacks', 'burpees', 'mountainClimbers'],
    distribution: [2, 1.5, 1.5, 1.5],
    icon: '❤️',
  },
  balance: {
    name: 'Balance & Stability',
    description: 'Improve coordination and body control',
    exercises: ['balanceBoard', 'sidePlank', 'plank', 'pushups'],
    distribution: [2, 1.5, 1.5, 1.5],
    icon: '🧘',
  },
};

// Motivational messages for different workout phases
export const motivationalMessages = {
  start: [
    "Let's do this! You showed up — that's already a win.",
    "Time to earn those results. Let's go!",
    "Your future self will thank you for this workout.",
  ],
  midway: [
    "Halfway there! You're doing incredible.",
    "Keep pushing! The hardest part is behind you.",
    "Your body is capable of more than you think.",
  ],
  almostDone: [
    "Almost there! Finish strong!",
    "Last push! Leave it all on the floor.",
    "You're in the home stretch — don't stop now!",
  ],
  rest: [
    "Great work! Catch your breath.",
    "Shake it out. You've earned this rest.",
    "Deep breaths. Next set coming up!",
    "Recovery is part of the workout. Rest up!",
  ],
  complete: [
    "Workout complete! You're a champion!",
    "Incredible effort! Be proud of yourself.",
    "That's a wrap! You absolutely crushed it.",
  ],
};

export function getRandomMessage(phase) {
  const messages = motivationalMessages[phase] || motivationalMessages.rest;
  return messages[Math.floor(Math.random() * messages.length)];
}
