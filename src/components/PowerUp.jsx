'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Play as PlayIcon } from 'lucide-react';

const fontStyle = {
  fontFamily: '"Lora", Georgia, serif',
  letterSpacing: '0.3px',
};

const colors = {
  primary: '#d97706',
  primaryLight: '#f59e0b',
  primaryDark: '#b45309',
  dark: '#78350f',
  text: '#5f3817',
  textSecondary: '#8b5a2b',
  border: '#ddd6d0',
  light: '#fef6f0',
};

const exercises = {
  skipping: { caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 }, description: 'Skipping', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Keep steady rhythm, land softly on the balls of your feet. Modification: Double unders (rope passes twice per jump) for extra intensity. Alternative: Jump for height instead of speed.' },
  plank: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Plank Hold', duration: { light: 30, intermediate: 45, vigorous: 60 }, tips: 'Keep your body straight like a board, engage your core! Modification: Plank with shoulder taps or arm lifts for added challenge. Alternative: Plank walks or moving planks.' },
  sidePlank: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Side Plank', duration: { light: 30, intermediate: 40, vigorous: 50 }, tips: 'Stack your feet and keep your hips high. Modification: Lift your top leg or arm while holding. Alternative: Side plank with rotation.' },
  crunches: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Crunches', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Hands behind your head, lift your shoulders only. Keep neck neutral. Modification: Add a pause at the top, or do weighted crunches. Alternative: Decline crunches.' },
  bicycleCrunches: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Bicycle Crunches', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Bring opposite elbow to knee, alternate sides smoothly. Keep a steady rhythm. Modification: Slow down for more time under tension. Alternative: Reverse bicycle crunches.' },
  mountainClimbers: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Mountain Climbers', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Start in plank, bring knees to chest quickly, keep hips level! Modification: Cross-body mountain climbers for added core work. Alternative: Slow, controlled mountain climbers.' },
  legRaises: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Leg Raises', duration: { light: 30, intermediate: 40, vigorous: 50 }, tips: 'Lie flat, lift legs slowly without bending knees. Keep lower back pressed to floor. Modification: Add pauses or do single-leg raises. Alternative: Hanging leg raises from a bar.' },
  balanceBoard: { caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 }, description: 'Balance Board', duration: { light: 90, intermediate: 90, vigorous: 90 }, tips: 'Focus on stability, small adjustments help! Every 10 seconds, drop low for 5 seconds. Modification: Close your eyes or add arm movements. Alternative: Single-leg balancing or bosu ball work.' },
  jumpingJacks: { caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 }, description: 'Jumping Jacks', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Keep a steady pace, feet apart, arms up! Land softly to protect joints. Modification: Fast, explosive jumping jacks. Alternative: Step-touch jacks or side-to-side jacks.' },
  marchingInPlace: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5 }, description: 'Marching in Place', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Lift your knees up high, keep your arms moving in sync. Modification: Add arm variations or lift knees even higher. Alternative: High-intensity sprinting in place.' },
  walkingLunges: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Walking Lunges', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Step forward and bend your back knee, keep your torso upright. Modification: Add a jump between lunges or hold weights. Alternative: Reverse walking lunges or stationary lunges.' },
  highKnees: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'High Knees', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Pump your knees up to hip height, keep moving fast! Drive from your hips. Modification: Sprint-style high knees or add arm drive. Alternative: Bounding or skipping with high knees.' },
  burpees: { caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 }, description: 'Burpees', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Go at your own pace, quality over speed! Modification: Add a push-up or jump at the top for intensity. Alternative: Modified burpees without the jump.' },
  pushups: { caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 }, description: 'Push-ups', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Lower yourself until chest nearly touches ground, keep elbows close! Modification: Diamond push-ups or decline push-ups. Alternative: Knee push-ups or wall push-ups.' },
  squats: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Squats', duration: { light: 45, intermediate: 60, vigorous: 75 }, tips: 'Bend your knees and lower your hips, keep your chest up! Modification: Jump squats or pistol squats for challenge. Alternative: Wall sits or sumo squats.' },
  jumpSquats: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Jump Squats', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Squat down then jump explosively, land softly. Modification: Add a pause at the bottom. Alternative: Pogo jumps or tuck jumps.' },
  gluteBridges: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Glute Bridges', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Lie on your back, push through heels, squeeze glutes at top! Modification: Single-leg bridges or add weights. Alternative: Hip thrusts or step-ups.' },
  singleLegStand: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Single Leg Stand', duration: { light: 30, intermediate: 40, vigorous: 50 }, tips: 'Stand on one leg, keep your core tight, switch legs halfway. Focus on a point ahead. Modification: Close your eyes or add arm movements. Alternative: Flamingo pose or pistol squat progressions.' },
  downwardDog: { caloriesPerMin: { light: 2.5, intermediate: 3.5, vigorous: 5 }, description: 'Downward Dog', duration: { light: 35, intermediate: 45, vigorous: 55 }, tips: 'Hands and feet on ground, push your hips up high. Breathe deeply. Modification: Add leg lifts or moves. Alternative: Dolphin pose or upward dog.' },
  armCircles: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Arm Circles', duration: { light: 35, intermediate: 45, vigorous: 55 }, tips: 'Small circles first, then larger, both directions! Keep shoulders relaxed. Modification: Add weight or increase speed. Alternative: Arm cross-overs or shoulder rolls.' },
  tricepDips: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Tricep Dips', duration: { light: 40, intermediate: 50, vigorous: 60 }, tips: 'Use a chair or bench, lower your body slowly, keep elbows close. Modification: Feet on elevated surface or add weight. Alternative: Bench dips or resistance band dips.' },
};

const goals = {
  general: ['skipping', 'pushups', 'squats', 'mountainClimbers'],
  core: ['plank', 'sidePlank', 'mountainClimbers', 'crunches', 'bicycleCrunches', 'legRaises'],
  cardio: ['skipping', 'jumpingJacks', 'highKnees', 'burpees'],
  strength: ['pushups', 'squats', 'gluteBridges', 'tricepDips'],
  balance: ['balanceBoard', 'sidePlank', 'singleLegStand'],
  hiit: ['burpees', 'jumpSquats', 'jumpingJacks'],
};

const presets = {
  matt: {
    name: 'Matt\'s Workout',
    age: '11-12',
    defaultSkipGoal: 500,
    fitnessLevel: 'intermediate',
    emoji: '⭐',
    exercises: 'Skipping • Plank • Balance Board',
    blurb: 'Cardio + Core + Balance',
  },
};

export default function PowerUp() {
  const [stage, setStage] = useState('config');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [skipGoal, setSkipGoal] = useState(null);
  const [showSkipGoalModal, setShowSkipGoalModal] = useState(false);
  const [skipInput, setSkipInput] = useState('');
  
  const [ageGroup, setAgeGroup] = useState('11-12');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [duration, setDuration] = useState(20);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [estimatedSkips, setEstimatedSkips] = useState(0);
  
  const synth = useRef(null);

  const [skipStats, setSkipStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0,
    lastResetDate: new Date().toDateString(),
  });

  useEffect(() => {
    const saved = localStorage.getItem('powerupSkipStats');
    if (saved) {
      const stats = JSON.parse(saved);
      const today = new Date().toDateString();
      if (stats.lastResetDate !== today) {
        stats.daily = 0;
        stats.lastResetDate = today;
      }
      setSkipStats(stats);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('powerupSkipStats', JSON.stringify(skipStats));
  }, [skipStats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // NEW: Speak the countdown number when it changes
  useEffect(() => {
    if (stage === 'workout' && countdown > 0 && countdown <= 5) {
      speak(countdown.toString());
    } else if (stage === 'workout' && countdown === 0 && isRunning) {
      // Only say "Go!" once when transitioning from 1 to 0
      if (timeLeft === workoutPlan[0]?.duration) {
        speak('Go!');
      }
    }
  }, [countdown, stage]);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0 && countdown === 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            moveToNextExercise();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft, currentIndex, workoutPlan, countdown]);

  const getCalorieContext = (calories) => {
    if (calories < 30) return '~1 apple';
    if (calories < 80) return '1 ice lolly';
    if (calories < 120) return '1 scoop of ice cream';
    if (calories < 160) return '1 chocolate bar';
    if (calories < 200) return '1 slice of shortcake';
    if (calories < 280) return '1 muffin';
    if (calories < 350) return '2 scoops of ice cream';
    if (calories < 450) return '1 slice of cake';
    if (calories < 600) return '1 cupcake';
    return `${Math.round(calories / 250)} slices of cake`;
  };

  const getCaloriesBurned = (exerciseKey, durationSeconds, ageLvl, fitLvl) => {
    const exerciseData = exercises[exerciseKey];
    const caloriesPerMinute = exerciseData.caloriesPerMin[fitLvl];
    const durationMinutes = durationSeconds / 60;
    
    const ageFactors = {
      '11-12': 1.0, '13-17': 0.98, '18-25': 0.96, '26-35': 0.94, '36-50': 0.92, '50+': 0.88,
    };
    const ageFactor = ageFactors[ageLvl] || 0.92;
    
    return Math.round(caloriesPerMinute * durationMinutes * ageFactor);
  };

  const calculateSkippingDuration = (goal) => {
    return Math.ceil((goal / 105) * 45);
  };

  const calculateSkipsCalories = (skips) => {
    const durationSeconds = calculateSkippingDuration(skips);
    return getCaloriesBurned('skipping', durationSeconds, ageGroup, fitnessLevel);
  };

  const estimateWorkoutCaloriesForModal = () => {
    // Estimate total workout calories based on workout duration and intensity
    // For Matt's preset: mostly cardio + core + balance
    const baseCaloriesPerMinute = fitnessLevel === 'light' ? 4 : fitnessLevel === 'intermediate' ? 5.5 : 7;
    const estimatedCalories = Math.round(duration * baseCaloriesPerMinute);
    return estimatedCalories;
  };

  const calculateWorkoutCalories = () => {
    if (!workoutPlan.length) return 0;
    let totalCalories = 0;
    workoutPlan.forEach(item => {
      if (item.type === 'exercise') {
        const cals = getCaloriesBurned(item.exercise, item.duration, ageGroup, fitnessLevel);
        totalCalories += cals;
      }
    });
    return totalCalories;
  };

  useEffect(() => {
    // Pre-load voices when component mounts
    if (synth.current) {
      synth.current.getVoices();
      synth.current.onvoiceschanged = () => {
        const voices = synth.current.getVoices();
        console.log('Voices loaded on mount:', voices.map(v => v.name));
      };
    }
  }, []);

  const selectAndSpeak = (voices, utterance) => {
    let selectedVoice = null;
    
    // Priority: Google US English, then Google UK English Female
    selectedVoice = voices.find(v => v.name.includes('Google US English')) ||
                    voices.find(v => v.name.includes('Google UK English Female')) ||
                    voices[0]; // Fallback to first available
    
    console.log('Selected voice:', selectedVoice?.name);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    synth.current.speak(utterance);
  };

  const speak = (text, speed = 1.0) => {
    if (!synth.current) return;
    
    synth.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = synth.current.getVoices();
    
    if (voices.length === 0) {
      const handler = () => {
        const loadedVoices = synth.current.getVoices();
        if (loadedVoices.length > 0) {
          synth.current.onvoiceschanged = null;
          selectAndSpeak(loadedVoices, utterance);
        }
      };
      synth.current.onvoiceschanged = handler;
    } else {
      selectAndSpeak(voices, utterance);
    }
  };

  const generatePlan = () => {
    if (!selectedPreset && !selectedGoal && !selectedExercises.length) {
      alert('Please select a workout option');
      return;
    }

    let exercisesToUse = [];
    let skipsForWorkout = skipGoal || 250;
    let totalSkippingDuration = 0;

    if (selectedPreset === 'matt') {
      exercisesToUse = ['skipping', 'plank', 'balanceBoard'];
      skipsForWorkout = skipGoal || 500;
      totalSkippingDuration = calculateSkippingDuration(skipsForWorkout);
    } else if (selectedGoal) {
      exercisesToUse = goals[selectedGoal];
      if (exercisesToUse.includes('skipping')) {
        totalSkippingDuration = calculateSkippingDuration(skipsForWorkout);
      }
    } else {
      exercisesToUse = selectedExercises.length > 0 ? selectedExercises : Object.keys(exercises).slice(0, 5);
      if (exercisesToUse.includes('skipping')) {
        totalSkippingDuration = calculateSkippingDuration(skipsForWorkout);
      }
    }

    const cardioExercises = ['skipping', 'jumpingJacks', 'highKnees', 'burpees', 'mountainClimbers'];
    const balanceExercises = ['balanceBoard', 'sidePlank', 'singleLegStand'];
    
    const sortedExercises = [
      ...exercisesToUse.filter(ex => cardioExercises.includes(ex)),
      ...exercisesToUse.filter(ex => !cardioExercises.includes(ex) && !balanceExercises.includes(ex)),
      ...exercisesToUse.filter(ex => balanceExercises.includes(ex)),
    ];

    const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
    const targetDuration = duration * 60;
    let plan = [];
    let usedTime = 0;

    let skippingSets = [];
    let remainingSeconds = totalSkippingDuration;
    let skipSetCount = 0;
    
    while (remainingSeconds > 0) {
      skipSetCount++;
      let setDuration = remainingSeconds > 60 ? 60 : Math.ceil(remainingSeconds / 30) * 30;
      skippingSets.push({ exercise: 'skipping', duration: setDuration, type: 'exercise', set: skipSetCount, totalSets: skipSetCount, isSkipping: true, skipGoal: skipsForWorkout });
      remainingSeconds -= setDuration;
    }

    skippingSets.forEach((set, idx) => {
      plan.push(set);
      if (idx < skippingSets.length - 1) {
        const restDuration = (idx === 2 && skippingSets.length > 3) ? 30 : 15;
        plan.push({ type: 'transition', duration: restDuration });
        usedTime += restDuration;
      }
      usedTime += set.duration;
    });
    
    plan.push({ type: 'rest', duration: 60, afterSkipping: true });
    usedTime += 60;

    const otherExercises = sortedExercises.filter(ex => ex !== 'skipping');
    const remainingTime = targetDuration - usedTime;
    
    for (const exercise of otherExercises) {
      const exerciseData = exercises[exercise];
      const isBalance = balanceExercises.includes(exercise);
      const isPlank = exercise === 'plank';
      
      let exerciseSets = sets;
      let exerciseSetDuration = isBalance ? 90 : exerciseData.duration[fitnessLevel];
      
      if (targetDuration >= 30 * 60) {
        if (isBalance || isPlank) exerciseSets = sets + 2;
      } else if (targetDuration >= 25 * 60) {
        if (isBalance || isPlank) exerciseSets = sets + 1;
      } else if (targetDuration >= 20 * 60) {
        if (isBalance) exerciseSets = sets + 1;
      }
      
      const estimatedExerciseTime = (exerciseSets * exerciseSetDuration) + ((exerciseSets - 1) * 15) + 45;
      
      if (estimatedExerciseTime > remainingTime) {
        const minSets = (isBalance || isPlank) ? 2 : 1;
        exerciseSets = Math.max(minSets, Math.floor(remainingTime / (exerciseSetDuration + 15)));
      }
      
      for (let set = 1; set <= exerciseSets; set++) {
        const dur = isBalance ? 90 : exerciseData.duration[fitnessLevel];
        plan.push({ exercise: exercise, duration: dur, type: 'exercise', set, totalSets: exerciseSets });
        usedTime += dur;
        
        if (set < exerciseSets) {
          plan.push({ type: 'transition', duration: 15 });
          usedTime += 15;
        }
      }
      
      const exerciseIndex = otherExercises.indexOf(exercise);
      if (exerciseIndex < otherExercises.length - 1) {
        plan.push({ type: 'rest', duration: 45 });
        usedTime += 45;
      }
    }

    setWorkoutPlan(plan);
    setCurrentIndex(0);
    setCountdown(5);
    setStage('prep');
  };

  const startWorkout = () => {
    setStage('workout');
    setCountdown(5);
    setTimeLeft(45);
    setIsRunning(true);
    
    // Announce "Get ready!" - timer frozen at 5
    speak('Get ready!');
    
    // Announce first exercise immediately after "Go!" (no delay)
    // Use a flag to ensure we only announce once
    setTimeout(() => {
      const firstExercise = workoutPlan[0];
      const exerciseName = exercises[firstExercise.exercise].description;
      
      if (firstExercise.isSkipping) {
        const skipsEst = Math.round((firstExercise.duration / 45) * 105);
        speak(`${exerciseName}! Go for at least ${skipsEst} skips!`);
      } else {
        speak(`${exerciseName}! Let's go!`);
      }
    }, 6000);
  };

  const funPhrases = {
    breakStart: [
      'Quick breather! You\'re doing so well.',
      'Nice job! Take a moment to recover.',
      'Catch your breath. You\'ve earned this.',
      'Take a beat. You\'re crushing it.',
      'Breathing break! You\'re awesome.',
      'Recovery time. You\'re doing great.',
      'Shake out those muscles. You\'ve got this!',
      'Short break. Get ready for more!',
    ],
    restStart: [
      'You\'re doing amazing! Time to recover.',
      'Fantastic work! Shake it out.',
      'Wow, look at you go! Rest up.',
      'That was impressive! Recovery time now.',
      'You\'re absolutely crushing it! Take this rest.',
      'Such great effort! Time to breathe.',
      'You\'re a superstar! Let\'s recover.',
      'Keep it up! Nice rest break coming up.',
      'You\'re brilliant at this! Time to chill.',
      'Incredible form! Let those muscles rest.',
    ],
    nextExercise: [
      'Ready for round two?',
      'Here we go again!',
      'Let\'s keep this train rolling.',
      'You\'re on fire! Keep going.',
      'One more time, let\'s go!',
      'Same exercise, same energy!',
      'Time for a replay!',
      'Next round - you\'ve got this!',
    ],
    newExercise: [
      'Time to switch it up!',
      'New exercise! Let\'s do this!',
      'Fresh energy incoming.',
      'Ready for something new?',
      'Change of pace, same intensity!',
      'New level unlocked!',
      'Plot twist incoming!',
      'The adventure continues!',
      'In the land of fitness, you are legend!',
      'By Zeus! Time for the next challenge!',
    ],
    encouragement: [
      'Come on, show this exercise who\'s boss.',
      'You\'ve got this in the bag.',
      'Let\'s make it happen!',
      'Time to shine!',
      'This is your moment.',
      'Go get \'em!',
      'That\'s the spirit!',
      'Nice moves, legend!',
      'You\'re unstoppable!',
      'Victory awaits!',
      'Score! Ace! You\'re crushing it!',
      'Serve it up like a tennis pro!',
      'You\'re in the zone now!',
      'Not to be rude, but you\'re absolutely smashing it.',
      'Hobbits can be surprisingly tough, and so can you.',
      'The only thing we have to fear is running out of energy - and we won\'t!',
      'It was the best of times, it was the best of workouts.',
      'Carry on, you magnificent creature.',
      'Everything is awesome when you\'re working out!',
      'You\'ve got more power than a creeper explosion!',
      'Brawl hard, rest harder!',
      'Time to aim and fire like Colt!',
      'You\'ve got the grit of Rosa!',
      'Spin it to win it like Spike!',
      'You\'re as quick as a Shelly dash!',
      'Star power activated!',
      'That\'s a super move right there!',
      'You\'ve unlocked beast mode!',
      'Percy Jackson would be proud of you!',
      'This is your hero\'s journey!',
      'You\'re building blocks of greatness!',
      'Diamonds are made under pressure - you\'re becoming a diamond!',
      'Gems don\'t collect themselves - you\'re earning them!',
      'That\'s championship energy right there!',
    ],
    finished: [
      'You absolute legend! That was incredible!',
      'Done! You just crushed it like a pro!',
      'That\'s a wrap! You were amazing!',
      'Boom! Workout complete. You\'re unstoppable!',
      'You did it! And you looked good doing it!',
      'All done! You totally nailed that!',
      'Champion! That was absolutely brilliant!',
      'Stone the crows! You did that in style!',
      'The odds were in your favor - and you won!',
      'What a fantastical journey that was!',
      'You\'ve completed your quest! Level up!',
      'Checkmate, fitness! You won!',
      'Served and won! Like Wimbledon!',
      'That\'s one small step for you, one giant leap for fitness!',
      'So long, and thanks for the awesome workout!',
      'You\'ve earned your place in legend!',
      'You brawled through that like a champion!',
      'Victory royale! Workout edition!',
      'You collected all the stars today!',
      'That\'s a power play right there!',
      'You dominated that match like a true brawler!',
      'Gems earned, muscles burned - epic combo!',
    ],
  };

  const getRandomPhrase = (category) => {
    const phrases = funPhrases[category];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  const moveToNextExercise = () => {
    if (currentIndex < workoutPlan.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextItem = workoutPlan[nextIndex];
      setTimeLeft(nextItem.duration);
      
      if (nextItem.type === 'transition') {
        const breakPhrase = getRandomPhrase('breakStart');
        speak(`${breakPhrase}`, 0.9); // Slower for breaks
      } else if (nextItem.type === 'rest') {
        const restPhrase = getRandomPhrase('restStart');
        speak(`${restPhrase}`, 0.9); // Slower for rest periods
      } else if (nextItem.type === 'exercise') {
        const exerciseName = exercises[nextItem.exercise].description;
        
        // Check if this is a repeat of the previous exercise
        const previousExercise = currentIndex > 0 ? workoutPlan[currentIndex - 2]?.exercise : null;
        const isRepeat = previousExercise === nextItem.exercise;
        
        // Count how many times this exercise has appeared so far
        let setNumber = 1;
        for (let i = 0; i < currentIndex - 1; i++) {
          if (workoutPlan[i]?.exercise === nextItem.exercise && workoutPlan[i]?.type === 'exercise') {
            setNumber++;
          }
        }
        
        if (nextItem.isSkipping) {
          const skipsEst = Math.round((nextItem.duration / 45) * 105);
          setEstimatedSkips(skipsEst);
          
          if (isRepeat) {
            // Repeat set with set number
            speak(`Set ${setNumber} of ${exerciseName}! Try for the same number of skips or better!`, 1.0);
          } else {
            // First set of exercise
            speak(`${exerciseName}! Go for at least ${skipsEst} skips!`, 1.0);
          }
        } else {
          if (isRepeat) {
            // Repeat set with set number
            speak(`Set ${setNumber} of ${exerciseName}! Keep the same energy!`, 1.0);
          } else {
            // First set of non-skipping exercise
            speak(`${exerciseName}! Let's go!`, 1.0);
          }
        }
      }
    } else {
      if (skipGoal) {
        setSkipStats(prev => ({
          ...prev,
          daily: prev.daily + Math.round(estimatedSkips),
          weekly: prev.weekly + Math.round(estimatedSkips),
          monthly: prev.monthly + Math.round(estimatedSkips),
          total: prev.total + Math.round(estimatedSkips),
        }));
      }
      
      setStage('results');
      setIsRunning(false);
      const finishPhrase = getRandomPhrase('finished');
      speak(finishPhrase);
    }
  };

  // CONFIG SCREEN
  if (stage === 'config') {
    return (
      <div style={{ padding: '50px 40px', ...fontStyle, maxWidth: '900px', margin: '0 auto', minHeight: '100vh', background: colors.light }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`}</style>

        <h1 style={{ color: colors.primary, marginBottom: '5px', fontSize: '3.2em', fontWeight: '600', ...fontStyle }}>PowerUp!</h1>
        <p style={{ color: colors.textSecondary, fontSize: '1.2em', fontWeight: '500', marginBottom: '40px', ...fontStyle }}>Your Fitness Champion</p>

        <div style={{ marginBottom: '40px', padding: '20px', background: 'white', borderRadius: '12px', border: `2px solid ${colors.primary}` }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[15, 20, 25, 30, 35, 40].map(mins => (
              <button key={mins} onClick={() => setDuration(mins)} style={{ padding: '10px 16px', background: duration === mins ? colors.primary : 'white', color: duration === mins ? 'white' : colors.text, border: `2px solid ${duration === mins ? colors.primary : colors.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '500', ...fontStyle, fontSize: '0.95em', transition: 'all 0.2s ease' }}>
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <h2 style={{ color: colors.text, marginBottom: '20px', fontSize: '1.4em', fontWeight: '600', ...fontStyle }}>Saved Workouts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '50px' }}>
          {Object.entries(presets).map(([key, preset]) => {
            const dailyProgress = (skipStats.daily / preset.defaultSkipGoal) * 100;
            return (
              <div key={key} onClick={() => { setSelectedPreset(key); setSelectedGoal(null); setSelectedExercises([]); setShowSkipGoalModal(true); setSkipInput(preset.defaultSkipGoal.toString()); }} style={{ padding: '20px', background: selectedPreset === key ? colors.primary : 'white', color: selectedPreset === key ? 'white' : colors.text, border: `2px solid ${selectedPreset === key ? colors.primary : colors.border}`, borderRadius: '12px', cursor: 'pointer', ...fontStyle, transition: 'all 0.3s ease' }}>
                <div style={{ fontSize: '2em', marginBottom: '10px' }}>{preset.emoji}</div>
                <div style={{ fontWeight: '600', fontSize: '1.1em', marginBottom: '6px' }}>{preset.name}</div>
                <div style={{ fontSize: '0.95em', marginBottom: '8px', fontWeight: '500' }}>{preset.blurb}</div>
                <div style={{ fontSize: '0.85em', opacity: 0.85, marginBottom: '10px' }}>{preset.exercises}</div>
                <div style={{ fontSize: '0.85em', opacity: 0.8, marginBottom: '8px' }}>Today: {skipStats.daily}/{preset.defaultSkipGoal}</div>
                <div style={{ background: colors.border, height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ background: selectedPreset === key ? 'white' : colors.primary, height: '100%', width: `${Math.min(dailyProgress, 100)}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {showSkipGoalModal && (
          <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', maxWidth: '420px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', ...fontStyle }}>
              <h3 style={{ color: colors.primary, marginBottom: '20px', fontSize: '1.4em', fontWeight: '600' }}>Skip Goal</h3>
              <p style={{ color: colors.text, marginBottom: '15px', fontSize: '0.95em', fontWeight: '500' }}>How many skips today?</p>
              <input type="number" value={skipInput} onChange={(e) => setSkipInput(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '1em', marginBottom: '20px', boxSizing: 'border-box', color: colors.text, ...fontStyle, fontWeight: '400' }} />
              <style>{`input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type="number"] { -moz-appearance: textfield; }`}</style>
              
              <div style={{ background: colors.light, padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ color: colors.text, fontSize: '0.9em', marginBottom: '8px', fontWeight: '500' }}>Skipping Calories:</div>
                <div style={{ color: colors.primary, fontSize: '1.6em', fontWeight: '600', marginBottom: '6px' }}>~{calculateSkipsCalories(parseInt(skipInput || 250))}</div>
                <div style={{ color: colors.text, fontSize: '0.9em' }}>≈ {getCalorieContext(calculateSkipsCalories(parseInt(skipInput || 250)))}</div>
                <div style={{ color: colors.textSecondary, fontSize: '0.8em', marginTop: '8px', fontStyle: 'italic' }}>Full calorie breakdown shown in workout plan →</div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setShowSkipGoalModal(false); setSelectedPreset(null); }} style={{ flex: 1, padding: '12px', background: colors.border, color: colors.text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', ...fontStyle, fontSize: '0.95em' }}>Cancel</button>
                <button onClick={() => { setSkipGoal(parseInt(skipInput || 250)); setShowSkipGoalModal(false); generatePlan(); }} style={{ flex: 1, padding: '12px', background: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', ...fontStyle, fontSize: '0.95em' }}>Continue</button>
              </div>
            </div>
          </div>
        )}

        <h2 style={{ color: colors.text, marginBottom: '20px', fontSize: '1.4em', fontWeight: '600', ...fontStyle }}>Quick Goals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '50px' }}>
          {Object.keys(goals).map((goal) => (
            <button key={goal} onClick={() => { setSelectedGoal(goal); setSelectedExercises([]); setSelectedPreset(null); }} style={{ padding: '16px', background: selectedGoal === goal ? colors.primary : 'white', color: selectedGoal === goal ? 'white' : colors.text, border: `2px solid ${selectedGoal === goal ? colors.primary : colors.border}`, borderRadius: '8px', cursor: 'pointer', ...fontStyle, fontSize: '0.9em', fontWeight: selectedGoal === goal ? '600' : '500', transition: 'all 0.3s ease', textAlign: 'center', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '1.8em', marginBottom: '6px' }}>
                {goal === 'general' && '⭐'}{goal === 'core' && '💪'}{goal === 'cardio' && '🏃'}{goal === 'strength' && '💥'}{goal === 'balance' && '⚖️'}{goal === 'hiit' && '⚡'}
              </div>
              <div>{goal.charAt(0).toUpperCase() + goal.slice(1)}</div>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <button onClick={() => generatePlan()} style={{ width: '100%', padding: '14px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', ...fontStyle, fontSize: '1em', transition: 'all 0.3s ease' }}>
            Prepare Workout
          </button>
        </div>
      </div>
    );
  }

  // PREP SCREEN
  if (stage === 'prep') {
    const estimatedWorkoutCalories = calculateWorkoutCalories();
    
    return (
      <div style={{ padding: '40px', ...fontStyle, maxWidth: '700px', margin: '0 auto', minHeight: '100vh', background: colors.light, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <h2 style={{ color: colors.primary, marginBottom: '20px', fontSize: '2em', fontWeight: '600' }}>Your Workout Plan</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px' }}>
          <button onClick={() => startWorkout()} style={{ width: '100%', padding: '12px', fontSize: '1em', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', ...fontStyle, transition: 'all 0.3s ease' }}>
            Start Workout
          </button>
          <button onClick={() => { setStage('config'); setWorkoutPlan([]); setSelectedGoal(null); setSelectedExercises([]); setSelectedPreset(null); setSkipGoal(null); }} style={{ width: '100%', padding: '12px', fontSize: '1em', background: colors.border, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '600', ...fontStyle, transition: 'all 0.3s ease' }}>
            Back
          </button>
        </div>

        <div style={{ background: colors.primary, color: 'white', padding: '18px', borderRadius: '8px', marginBottom: '25px', textAlign: 'center', ...fontStyle }}>
          <div style={{ fontSize: '0.9em', marginBottom: '6px', opacity: 0.9, fontWeight: '500' }}>Total Calories</div>
          <div style={{ fontSize: '2.2em', fontWeight: '600', marginBottom: '6px' }}>~{estimatedWorkoutCalories}</div>
          <div style={{ fontSize: '0.9em', opacity: 0.95, fontWeight: '500' }}>≈ {getCalorieContext(estimatedWorkoutCalories)}</div>
        </div>

        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '6px' }}>
            {workoutPlan.map((item, idx) => (
              <div key={idx} style={{ padding: '8px', background: colors.light, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontWeight: item.type === 'exercise' ? '600' : '400', fontSize: '0.75em', textAlign: 'center', lineHeight: '1.3', ...fontStyle }}>
                {item.type === 'exercise' ? (
                  <>
                    <div>{exercises[item.exercise].description}</div>
                    <div style={{ fontSize: '0.7em', opacity: 0.7, marginTop: '3px', fontWeight: '500' }}>{item.duration}s</div>
                  </>
                ) : item.type === 'rest' ? (
                  <>
                    <div>Rest</div>
                    <div style={{ fontSize: '0.7em', opacity: 0.7, marginTop: '3px', fontWeight: '500' }}>{item.duration}s</div>
                  </>
                ) : (
                  <>
                    <div>Break</div>
                    <div style={{ fontSize: '0.7em', opacity: 0.7, marginTop: '3px', fontWeight: '500' }}>{item.duration}s</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // WORKOUT SCREEN
  if (stage === 'workout') {
    const current = workoutPlan[currentIndex];
    const exerciseData = current?.type === 'exercise' ? exercises[current.exercise] : null;

    return (
      <div style={{ padding: '40px', ...fontStyle, minHeight: '100vh', background: colors.light, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: colors.primary, marginBottom: '20px', ...fontStyle, fontSize: '1.8em', fontWeight: '600' }}>
            {countdown > 0 ? 'Get Ready!' : current?.type === 'rest' ? 'Rest Time' : exerciseData?.description}
          </h2>
          <div style={{ fontSize: countdown > 0 ? '20em' : '14em', color: colors.primary, marginBottom: '20px', fontWeight: '600', fontFamily: 'monospace', lineHeight: '1' }}>
            {countdown > 0 ? countdown : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
          </div>
          
          {current?.isSkipping && !countdown && (
            <p style={{ color: colors.primary, fontSize: '1em', fontWeight: '600', marginBottom: '20px', ...fontStyle }}>
              Est. Skips: {estimatedSkips}
            </p>
          )}
        </div>

        <div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {!isRunning ? (
              <button onClick={() => { setIsRunning(true); setCountdown(0); setIsPaused(false); }} style={{ padding: '12px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95em', ...fontStyle }}>
                <PlayIcon size={16} style={{ display: 'inline', marginRight: '6px' }} /> Play
              </button>
            ) : (
              <>
                <button onClick={() => setIsPaused(!isPaused)} style={{ padding: '12px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95em', ...fontStyle }}>
                  <Pause size={16} style={{ display: 'inline', marginRight: '6px' }} /> {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button onClick={() => { setIsRunning(false); setStage('config'); setWorkoutPlan([]); }} style={{ padding: '12px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95em', ...fontStyle }}>
                  <StopCircle size={16} style={{ display: 'inline', marginRight: '6px' }} /> Stop
                </button>
              </>
            )}
          </div>

          {exerciseData && (
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
              {exerciseData.tips.split('. ').map((sentence, idx) => (
                <p key={idx} style={{ color: colors.text, fontSize: '0.9em', marginBottom: idx === exerciseData.tips.split('. ').length - 1 ? '0' : '8px', lineHeight: '1.5', fontWeight: '400', ...fontStyle }}>
                  {sentence}{sentence.endsWith('.') ? '' : '.'}
                </p>
              ))}
            </div>
          )}
        </div>

        <p style={{ color: colors.text, marginBottom: '0', fontSize: '0.9em', ...fontStyle, fontWeight: '500' }}>
          Exercise {currentIndex + 1} of {workoutPlan.length}
        </p>
      </div>
    );
  }

  // RESULTS SCREEN
  if (stage === 'results') {
    const totalWorkoutCalories = calculateWorkoutCalories();
    
    return (
      <div style={{ padding: '50px 40px', textAlign: 'center', ...fontStyle, minHeight: '100vh', background: colors.light }}>
        <h1 style={{ fontSize: '2.8em', color: colors.primary, marginBottom: '20px', fontWeight: '600' }}>Awesome!</h1>
        <p style={{ fontSize: '1.1em', color: colors.text, marginBottom: '40px', fontWeight: '500' }}>You crushed {workoutPlan.length} exercises!</p>
        
        {skipGoal && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', border: `2px solid ${colors.primary}` }}>
            <h2 style={{ color: colors.primary, marginBottom: '15px', fontSize: '1.3em', fontWeight: '600' }}>Skips</h2>
            <p style={{ fontSize: '1.8em', color: colors.primary, fontWeight: '600', marginBottom: '8px' }}>{Math.round(estimatedSkips)}</p>
            <p style={{ color: colors.text, marginBottom: '12px', fontSize: '0.95em', fontWeight: '500' }}>Goal: {skipGoal}</p>
            <p style={{ color: colors.text, fontSize: '1em', fontWeight: '600' }}>
              Today's Total: {skipStats.daily}/{skipGoal} {skipStats.daily >= skipGoal ? '✓' : ''}
            </p>
          </div>
        )}

        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', border: `2px solid ${colors.primary}` }}>
          <h3 style={{ color: colors.primary, marginBottom: '15px', fontSize: '1.3em', fontWeight: '600' }}>Calories Burned</h3>
          <div style={{ fontSize: '2.2em', color: colors.primary, fontWeight: '600', marginBottom: '12px' }}>
            ~{totalWorkoutCalories}
          </div>
          <div style={{ color: colors.text, fontSize: '1em', fontWeight: '500' }}>
            ≈ {getCalorieContext(totalWorkoutCalories)}
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ color: colors.primary, marginBottom: '15px', fontSize: '1.1em', fontWeight: '600' }}>Skip Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.85em', marginBottom: '4px', fontWeight: '500' }}>Today</p>
              <p style={{ color: colors.primary, fontSize: '1.2em', fontWeight: '600' }}>{skipStats.daily}</p>
            </div>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.85em', marginBottom: '4px', fontWeight: '500' }}>Week</p>
              <p style={{ color: colors.primary, fontSize: '1.2em', fontWeight: '600' }}>{skipStats.weekly}</p>
            </div>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.85em', marginBottom: '4px', fontWeight: '500' }}>Month</p>
              <p style={{ color: colors.primary, fontSize: '1.2em', fontWeight: '600' }}>{skipStats.monthly}</p>
            </div>
            <div>
              <p style={{ color: colors.textSecondary, fontSize: '0.85em', marginBottom: '4px', fontWeight: '500' }}>Total</p>
              <p style={{ color: colors.primary, fontSize: '1.2em', fontWeight: '600' }}>{skipStats.total}</p>
            </div>
          </div>
        </div>

        <button onClick={() => { setStage('config'); setWorkoutPlan([]); setSelectedGoal(null); setSelectedExercises([]); setSelectedPreset(null); setSkipGoal(null); }} style={{ padding: '12px 32px', fontSize: '1em', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', ...fontStyle }}>
          Next Workout
        </button>
      </div>
    );
  }

  return null;
}
