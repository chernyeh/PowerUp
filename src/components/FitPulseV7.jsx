import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, ChevronRight, Award, History, Music, Video, Settings, BarChart3, Trash2, Download, Zap, Heart, Flame, Target, Clock, Dumbbell, Square } from 'lucide-react';

export default function FitPulseV6() {
  const [stage, setStage] = useState('home');
  const [ageGroup, setAgeGroup] = useState('13-17');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [duration, setDuration] = useState(20);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [calorieTarget, setCalorieTarget] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [spotifyAuth, setSpotifyAuth] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutPlanGenerated, setWorkoutPlanGenerated] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedDemoExercise, setSelectedDemoExercise] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalCalories: 0, totalTime: 0 });
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.2);
  const [selectedVoice, setSelectedVoice] = useState('Google US English Female');
  const [availableVoices, setAvailableVoices] = useState([]);

  const synth = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const timerRef = useRef(null);

  // Voice options - warmer, more natural voices
  const voiceOptions = [
    'Google US English Female',
    'Google UK English Female',
    'Microsoft Zira',
    'Natural Female',
    'Warm Female',
    'Standard Female'
  ];

  // Fixed professional blue color scheme
  const colors = {
    primary: '#1e40af',
    primaryLight: '#3b82f6',
    primaryDark: '#1e3a8a',
    light: '#eff6ff',
    lightBorder: '#dbeafe',
    text: '#0f172a',
    textSecondary: '#334155',
    textLight: '#ffffff',
    success: '#059669',
    error: '#dc2626',
    bg: 'from-blue-50 via-slate-50 to-blue-50'
  };

  // Beginner-friendly exercise library
  const exercises = {
    skipping: { 
      caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 }, 
      description: 'Skipping',
      videoUrl: 'https://www.youtube.com/embed/N5RqJqG5K6c?autoplay=1',
      tips: 'Keep steady rhythm. Land softly on the balls of your feet.' 
    },
    plank: { 
      caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, 
      description: 'Plank Hold',
      videoUrl: 'https://www.youtube.com/embed/QoGhk0FkkIU?autoplay=1',
      tips: 'Keep your body straight like a board. Engage your core!' 
    },
    sidePlank: { 
      caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, 
      description: 'Side Plank',
      videoUrl: 'https://www.youtube.com/embed/qFj-xc3u5y0?autoplay=1',
      tips: 'Stack your feet and keep your hips high. You\'ve got this!' 
    },
    crunches: { 
      caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, 
      description: 'Crunches',
      videoUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU?autoplay=1',
      tips: 'Hands behind your head. Lift your shoulders only.' 
    },
    bicycleCrunches: { 
      caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, 
      description: 'Bicycle Crunches',
      videoUrl: 'https://www.youtube.com/embed/kzdnR6H-F1k?autoplay=1',
      tips: 'Bring opposite elbow to knee. Alternate sides smoothly.' 
    },
    mountainClimbers: { 
      caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, 
      description: 'Mountain Climbers',
      videoUrl: 'https://www.youtube.com/embed/nmwgirgblLw?autoplay=1',
      tips: 'Start in plank. Bring knees to chest quickly. Keep hips level!' 
    },
    legRaises: { 
      caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, 
      description: 'Leg Raises',
      videoUrl: 'https://www.youtube.com/embed/RgMvXYQUhLs?autoplay=1',
      tips: 'Lie flat. Lift legs slowly without bending knees.' 
    },
    balanceBoard: { 
      caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 }, 
      description: 'Balance Board',
      videoUrl: 'https://www.youtube.com/embed/Z9aXvC5BjD0?autoplay=1',
      tips: 'Focus on stability. Small adjustments help! Stand on one foot for more challenge.' 
    },
    jumpingJacks: { 
      caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 }, 
      description: 'Jumping Jacks',
      videoUrl: 'https://www.youtube.com/embed/3mClXukeKxg?autoplay=1',
      tips: 'Keep a steady pace. Your feet apart, arms up!' 
    },
    marchingInPlace: { 
      caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5 }, 
      description: 'Marching in Place',
      videoUrl: 'https://www.youtube.com/embed/i2YmwJvGvmU?autoplay=1',
      tips: 'Lift your knees up high. Keep your arms moving.' 
    },
    walkingLunges: { 
      caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, 
      description: 'Walking Lunges',
      videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U?autoplay=1',
      tips: 'Step forward and bend your back knee. Keep your torso upright.' 
    },
    highKnees: { 
      caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, 
      description: 'High Knees',
      videoUrl: 'https://www.youtube.com/embed/nPvJZI5fYMM?autoplay=1',
      tips: 'Pump your knees up to hip height. Keep moving fast!' 
    },
    burpees: { 
      caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 }, 
      description: 'Burpees',
      videoUrl: 'https://www.youtube.com/embed/JZQA8BlU2fg?autoplay=1',
      tips: 'Go at your own pace. Quality over speed!' 
    },
    pushups: { 
      caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 }, 
      description: 'Push-ups',
      videoUrl: 'https://www.youtube.com/embed/Eh00_rniF8E?autoplay=1',
      tips: 'Lower yourself until chest nearly touches the ground. Keep elbows close!' 
    },
    squats: { 
      caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, 
      description: 'Squats',
      videoUrl: 'https://www.youtube.com/embed/xqvCmoLUGkQ?autoplay=1',
      tips: 'Bend your knees and lower your hips. Keep your chest up!' 
    },
    jumpSquats: { 
      caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, 
      description: 'Jump Squats',
      videoUrl: 'https://www.youtube.com/embed/GSO8jVMkfXA?autoplay=1',
      tips: 'Squat down then jump explosively. Land softly.' 
    },
    gluteBridges: { 
      caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, 
      description: 'Glute Bridges',
      videoUrl: 'https://www.youtube.com/embed/wPM8ic32ufQ?autoplay=1',
      tips: 'Lie on your back. Push through heels. Squeeze glutes at top!' 
    },
    childsPose: { 
      caloriesPerMin: { light: 1, intermediate: 1.5, vigorous: 2 }, 
      description: 'Child\'s Pose',
      videoUrl: 'https://www.youtube.com/embed/TaP3C9xwMSI?autoplay=1',
      tips: 'Kneel and sit back on your heels. Relax and breathe.' 
    },
    downwardDog: { 
      caloriesPerMin: { light: 2.5, intermediate: 3.5, vigorous: 5 }, 
      description: 'Downward Dog',
      videoUrl: 'https://www.youtube.com/embed/TaP3C9xwMSI?autoplay=1',
      tips: 'Hands and feet on ground. Push your hips up high.' 
    },
    armCircles: { 
      caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, 
      description: 'Arm Circles',
      videoUrl: 'https://www.youtube.com/embed/O7JDKL-Vszg?autoplay=1',
      tips: 'Small circles first, then larger. Both directions!' 
    },
    tricepDips: { 
      caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, 
      description: 'Tricep Dips',
      videoUrl: 'https://www.youtube.com/embed/4qzUBwC9VlI?autoplay=1',
      tips: 'Use a chair or bench. Lower your body slowly.' 
    },
  };

  const goals = {
    general: {
      name: '⭐ General Fitness',
      icon: '💪',
      exercises: ['jumpingJacks', 'pushups', 'squats', 'mountainClimbers'],
      distribution: [1.5, 1.5, 1.5, 1.5],
    },
    core: {
      name: '🔥 Core Strength',
      icon: '⚡',
      exercises: ['plank', 'sidePlank', 'mountainClimbers', 'crunches'],
      distribution: [2, 1.5, 1.5, 1],
    },
    cardio: {
      name: '🏃 Cardio Blast',
      icon: '❤️',
      exercises: ['jumpingJacks', 'highKnees', 'burpees', 'mountainClimbers'],
      distribution: [1.5, 1.5, 1.5, 1.5],
    },
    strength: {
      name: '💪 Strength Building',
      icon: '🦾',
      exercises: ['pushups', 'squats', 'gluteBridges', 'planksToDownwardDog'],
      distribution: [2, 2, 1.5, 1],
    },
    balance: {
      name: '🧘 Balance & Flexibility',
      icon: '🌳',
      exercises: ['balanceBoard', 'childsPose', 'downwardDog', 'catCowStretch'],
      distribution: [2, 1.5, 1.5, 1],
    },
    hiit: {
      name: '⚡ HIIT Training',
      icon: '🔥',
      exercises: ['burpees', 'jumpSquats', 'highKnees', 'boxJumps'],
      distribution: [1.5, 1.5, 1.5, 1.5],
    },
  };

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await window.storage.list('workout:');
        if (result?.keys) {
          const historyData = [];
          for (const key of result.keys) {
            const data = await window.storage.get(key);
            if (data?.value) {
              historyData.push(JSON.parse(data.value));
            }
          }
          historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
          setWorkoutHistory(historyData);
          
          const totalWorkouts = historyData.length;
          const totalCalories = historyData.reduce((sum, w) => sum + w.totalCalories, 0);
          const totalTime = historyData.reduce((sum, w) => sum + w.totalTime, 0);
          setStats({ totalWorkouts, totalCalories, totalTime });
        }
      } catch (error) {
        console.log('No history yet');
      }
    };
    loadHistory();
  }, []);

  // Get available voices
  useEffect(() => {
    if (!synth.current) return;
    
    const getVoices = () => {
      const voices = synth.current.getVoices();
      setAvailableVoices(voices.map(v => v.name).slice(0, 6));
    };

    synth.current.onvoiceschanged = getVoices;
    getVoices();
  }, []);

  // Spotify initialization
  const initiateSpotifyAuth = () => {
    const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || window.location.origin;
    const SPOTIFY_SCOPES = ['streaming', 'user-read-email', 'user-read-private', 'user-modify-playback-state', 'user-read-playback-state'];
    
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
    authUrl.searchParams.append('scope', SPOTIFY_SCOPES.join(' '));
    window.location.href = authUrl.toString();
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) {
        setSpotifyAuth(token);
        localStorage.setItem('spotify_token', token);
        window.location.hash = '';
      }
    } else {
      const stored = localStorage.getItem('spotify_token');
      if (stored) setSpotifyAuth(stored);
    }
  }, []);

  const playSpotifyTrack = async (query) => {
    if (!spotifyAuth) return;
    try {
      const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
        headers: { Authorization: `Bearer ${spotifyAuth}` },
      });
      const searchData = await searchRes.json();
      const trackUri = searchData.tracks?.items?.[0]?.uri;
      if (!trackUri) return;

      const devicesRes = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: `Bearer ${spotifyAuth}` },
      });
      const devicesData = await devicesRes.json();
      const device = devicesData.devices?.[0];
      if (!device) return;

      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${spotifyAuth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: [trackUri] }),
      });
    } catch (error) {
      console.error('Spotify error:', error);
    }
  };

  // Warm, natural voice guidance with voice selection
  const speak = (text) => {
    if (!voiceEnabled || !synth.current) return;
    synth.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;
    utterance.volume = 1;
    
    const voices = synth.current.getVoices();
    let selectedVoiceObj = voices.find(v => v.name.includes(selectedVoice)) || 
                           voices.find(v => v.name.includes('Female')) || 
                           voices[1];
    
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }
    
    synth.current.speak(utterance);
  };

  const calculateCalorieOptions = () => {
    const ageMultiplier = {
      '11-12': 0.6,
      '13-17': 0.8,
      '18-24': 1.0,
      '25-35': 1.0,
      '36-50': 0.9,
      '50+': 0.8,
    };
    const fitnessMultiplier = { light: 0.7, intermediate: 1, vigorous: 1.3 };
    const baseCalories = duration * fitnessMultiplier[fitnessLevel] * ageMultiplier[ageGroup] * 5;
    return [
      Math.round(baseCalories * 0.6),
      Math.round(baseCalories * 0.8),
      Math.round(baseCalories),
      Math.round(baseCalories * 1.2),
    ];
  };

  const generateWorkoutPlan = () => {
    let plan = [];
    let exerciseList = selectedExercises;
    let totalMinutes = duration;

    if (selectedGoal && exerciseList.length === 0) {
      const goal = goals[selectedGoal];
      const totalRatio = goal.distribution.reduce((a, b) => a + b, 0);
      exerciseList = goal.exercises;
      const timePerExercise = goal.distribution.map((dist) => (dist / totalRatio) * totalMinutes);

      exerciseList.forEach((exName, idx) => {
        const minutes = Math.round(timePerExercise[idx] * 2) / 2;
        const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
        const secondsPerSet = (minutes / sets) * 60;

        for (let i = 0; i < sets; i++) {
          plan.push({
            exercise: exName,
            duration: secondsPerSet,
            set: i + 1,
            totalSets: sets,
          });
          if (i < sets - 1) {
            plan.push({ type: 'rest', duration: 45 });
          }
        }
      });
    }

    setWorkoutPlan(plan);
    if (plan.length > 0) {
      setTimeRemaining(Math.ceil(plan[0].duration));
      setCurrentExerciseIndex(0);
      setWorkoutPlanGenerated(true);
    }
  };

  // Main workout timer
  useEffect(() => {
    if (!isRunning || isPaused || workoutPlan.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        
        // Voice countdown for last 3 seconds of rest
        const currentItem = workoutPlan[currentExerciseIndex];
        if (currentItem?.type === 'rest' && newTime > 0 && newTime <= 3) {
          speak(`${newTime}`);
        }

        if (newTime <= 0) {
          const nextIndex = currentExerciseIndex + 1;
          if (nextIndex < workoutPlan.length) {
            const nextItem = workoutPlan[nextIndex];
            setCurrentExerciseIndex(nextIndex);

            if (nextItem.type === 'rest') {
              speak('Time to rest. Catch your breath and get ready.');
            } else {
              const exName = exercises[nextItem.exercise]?.description;
              speak(`Next up: ${exName}. You\'ve got this! Let\'s go!`);
            }

            return Math.ceil(nextItem.duration);
          } else {
            setIsRunning(false);
            speak('Workout complete! Fantastic job! You should be so proud of yourself!');
            setTimeout(() => completeWorkout(), 2000);
            return 0;
          }
        }
        return newTime;
      });

      setTotalTimeUsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused, currentExerciseIndex, workoutPlan]);

  const beginWorkout = () => {
    generateWorkoutPlan();
    setStage('workout');
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setIsRunning(true);
    if (musicEnabled) {
      playSpotifyTrack('workout motivation mix');
    }
    speak('Let\'s get started! You\'re going to do amazing!');
  };

  const completeWorkout = async () => {
    const results = calculateWorkoutResults();
    setCompletedExercises(results);
    
    const workout = {
      date: new Date().toISOString(),
      ageGroup,
      fitnessLevel,
      duration,
      goal: selectedGoal,
      totalCalories: Object.values(results).reduce((sum, ex) => sum + ex.totalCalories, 0),
      totalTime: totalTimeUsed,
      exercises: results,
    };

    try {
      await window.storage.set(`workout:${Date.now()}`, JSON.stringify(workout));
      setWorkoutHistory([workout, ...workoutHistory]);
      
      setStats(prev => ({
        totalWorkouts: prev.totalWorkouts + 1,
        totalCalories: prev.totalCalories + workout.totalCalories,
        totalTime: prev.totalTime + totalTimeUsed,
      }));
    } catch (error) {
      console.error('Error saving workout:', error);
    }

    setStage('results');
  };

  const calculateWorkoutResults = () => {
    const results = {};

    workoutPlan.forEach((item) => {
      if (item.type !== 'rest') {
        const exKey = item.exercise;
        const exData = exercises[exKey];
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
      }
    });

    return results;
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      speak(`Paused. Resume whenever you\'re ready.`);
    } else {
      speak(`Resuming. Let\'s keep going!`);
    }
  };

  const stopWorkout = () => {
    setIsRunning(false);
    setIsPaused(false);
    setWorkoutStarted(false);
    setWorkoutPlanGenerated(false);
    speak('Workout stopped. Great effort!');
    resetApp();
  };

  const resetApp = () => {
    setStage('home');
    setSelectedExercises([]);
    setSelectedGoal(null);
    setCurrentExerciseIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    setWorkoutStarted(false);
    setWorkoutPlanGenerated(false);
    setTimeRemaining(0);
    setTotalTimeUsed(0);
    setCompletedExercises([]);
    setWorkoutPlan([]);
  };

  // ===== HOME STAGE =====
  if (stage === 'home') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Georgia', 'Garamond', serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Lora:wght@400;500;600&display=swap');
          
          * {
            font-family: 'Lora', Georgia, serif;
          }
          
          .title {
            font-family: 'Playfair Display', serif;
            letter-spacing: -0.02em;
          }
          
          .slide-in {
            animation: slideIn 0.6s ease-out;
          }
          
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .hover-lift {
            transition: all 0.3s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(30, 64, 175, 0.15);
          }
        `}</style>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="slide-in">
              <h1 className="text-6xl font-bold mb-2 title" style={{ color: colors.primaryDark }}>
                FitPulse
              </h1>
              <p className="text-lg font-light" style={{ color: colors.textSecondary }}>Your Personal Fitness Coach</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-lg hover:bg-gray-200 transition"
              style={{ backgroundColor: '#ffffff' }}
              title="Settings"
            >
              <Settings size={24} style={{ color: colors.primary }} />
            </button>
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="rounded-xl p-6 mb-8 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <h3 className="font-semibold mb-4 title" style={{ color: colors.primaryDark, fontSize: '1.125rem' }}>Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.text }}>Voice Guidance</span>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="px-4 py-2 rounded-lg font-semibold transition text-white"
                    style={{ backgroundColor: voiceEnabled ? colors.primary : '#9ca3af' }}
                  >
                    {voiceEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Voice Type</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 transition"
                    style={{ borderColor: colors.lightBorder, color: colors.text }}
                  >
                    <option>Google US English Female</option>
                    <option>Google UK English Female</option>
                    <option>Microsoft Zira</option>
                    <option>Natural Female</option>
                    <option>Warm Female</option>
                    <option>Standard Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Voice Speed: {voiceRate.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: colors.primary }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Voice Pitch: {voicePitch.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.5"
                    step="0.1"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: colors.primary }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span style={{ color: colors.text }}>Spotify Integration</span>
                  <button
                    onClick={initiateSpotifyAuth}
                    className={`px-4 py-2 rounded-lg font-semibold transition`}
                    style={{ backgroundColor: spotifyAuth ? '#059669' : '#d1d5db', color: 'white' }}
                  >
                    {spotifyAuth ? '✓ Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {stats.totalWorkouts > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl p-4 text-center shadow-sm hover-lift" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats.totalWorkouts}</div>
                <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Workouts</p>
              </div>
              <div className="rounded-xl p-4 text-center shadow-sm hover-lift" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats.totalCalories}</div>
                <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Calories</p>
              </div>
              <div className="rounded-xl p-4 text-center shadow-sm hover-lift" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>{Math.round(stats.totalTime / 60)}h</div>
                <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Total Time</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setStage('setup')}
              className="w-full py-4 text-white font-semibold rounded-xl hover-lift text-lg flex items-center justify-center gap-2 shadow-md transition"
              style={{ backgroundColor: colors.primary }}
            >
              <Zap size={24} /> Start New Workout
            </button>

            {workoutHistory.length > 0 && (
              <button
                onClick={() => setStage('history')}
                className="w-full py-4 bg-white font-semibold rounded-xl hover-lift border-2 text-lg flex items-center justify-center gap-2 transition"
                style={{ borderColor: colors.primary, color: colors.primaryDark }}
              >
                <History size={24} /> View History ({workoutHistory.length})
              </button>
            )}

            <button
              onClick={() => setStage('demos')}
              className="w-full py-4 bg-white font-semibold rounded-xl hover-lift border-2 text-lg flex items-center justify-center gap-2 transition"
              style={{ borderColor: colors.primary, color: colors.primaryDark }}
            >
              <Video size={24} /> Exercise Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== SETUP STAGE =====
  if (stage === 'setup') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Lora', Georgia, serif" }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={resetApp}
            className="mb-6 font-semibold flex items-center gap-2 transition"
            style={{ color: colors.primary }}
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold mb-8 title" style={{ color: colors.primaryDark }}>New Workout</h1>

          <div className="space-y-6">
            {/* Age Group */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <label className="block font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Age Group</label>
              <div className="grid grid-cols-3 gap-3">
                {['11-12', '13-17', '18-24', '25-35', '36-50', '50+'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setAgeGroup(range)}
                    className={`py-3 rounded-lg font-semibold transition text-white`}
                    style={{
                      backgroundColor: ageGroup === range ? colors.primary : '#e5e7eb'
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Fitness Level */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <label className="block font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Fitness Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'intermediate', 'vigorous'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFitnessLevel(level)}
                    className={`py-3 rounded-lg font-semibold transition text-white`}
                    style={{
                      backgroundColor: fitnessLevel === level ? colors.primary : '#e5e7eb'
                    }}
                  >
                    {level === 'light' ? '🐢 Light' : level === 'intermediate' ? '🚶 Steady' : '⚡ Intense'}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <label className="block font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Duration: {duration} min</label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: colors.primary,
                  backgroundColor: colors.light
                }}
              />
              <div className="flex justify-between text-sm mt-2" style={{ color: colors.textSecondary }}>
                <span>10 min</span>
                <span>60 min</span>
              </div>
            </div>

            <button
              onClick={() => setStage('config')}
              className="w-full py-4 text-white font-semibold rounded-xl hover-lift text-lg transition"
              style={{ backgroundColor: colors.primary }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== CONFIG STAGE =====
  if (stage === 'config') {
    const calorieOptions = calculateCalorieOptions();

    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Lora', Georgia, serif" }}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setStage('setup')}
            className="mb-6 font-semibold flex items-center gap-2 transition"
            style={{ color: colors.primary }}
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold mb-8 title" style={{ color: colors.primaryDark }}>Choose Your Workout</h1>

          <div className="space-y-6">
            {/* Goals */}
            <div>
              <h2 className="font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Quick Goals</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(goals).map(([key, goal]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedGoal(key);
                      setSelectedExercises([]);
                    }}
                    className={`p-4 rounded-xl font-semibold transition text-white`}
                    style={{
                      backgroundColor: selectedGoal === key ? colors.primary : '#ffffff',
                      color: selectedGoal === key ? 'white' : colors.primaryDark,
                      border: selectedGoal === key ? 'none' : `2px solid ${colors.light}`
                    }}
                  >
                    <div className="text-2xl mb-1">{goal.icon}</div>
                    {goal.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div>
              <h2 className="font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Or Mix & Match Exercises</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(exercises).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedGoal(null);
                      setSelectedExercises((prev) =>
                        prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
                      );
                    }}
                    className={`p-3 rounded-xl font-semibold text-sm transition text-white`}
                    style={{
                      backgroundColor: selectedExercises.includes(key) ? colors.primary : '#ffffff',
                      color: selectedExercises.includes(key) ? 'white' : colors.primaryDark,
                      border: selectedExercises.includes(key) ? 'none' : `2px solid ${colors.light}`
                    }}
                  >
                    {data.description}
                  </button>
                ))}
              </div>
            </div>

            {/* Calorie Target */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <h2 className="font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Target Calories</h2>
              <div className="grid grid-cols-2 gap-3">
                {calorieOptions.map((cal) => (
                  <button
                    key={cal}
                    onClick={() => setCalorieTarget(cal)}
                    className={`py-3 rounded-lg font-bold transition text-white`}
                    style={{
                      backgroundColor: calorieTarget === cal ? colors.primary : '#e5e7eb'
                    }}
                  >
                    {cal} cal
                  </button>
                ))}
              </div>
            </div>

            {/* Music Toggle */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: colors.text }}>Play Music During Workout</span>
                <button
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`px-4 py-2 rounded-lg font-semibold transition text-white`}
                  style={{ backgroundColor: musicEnabled ? colors.primary : '#9ca3af' }}
                >
                  {musicEnabled ? '🎵 ON' : 'OFF'}
                </button>
              </div>
            </div>

            <button
              onClick={beginWorkout}
              disabled={!selectedGoal && selectedExercises.length === 0}
              className="w-full py-4 text-white font-semibold rounded-xl hover-lift text-lg disabled:opacity-50 transition"
              style={{ backgroundColor: colors.primary }}
            >
              Prepare Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== DEMOS STAGE =====
  if (stage === 'demos') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Lora', Georgia, serif" }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={resetApp}
            className="mb-6 font-semibold flex items-center gap-2 transition"
            style={{ color: colors.primary }}
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold mb-8 title" style={{ color: colors.primaryDark }}>Exercise Guides</h1>

          {!selectedDemoExercise ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(exercises).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDemoExercise(key)}
                  className="bg-white border-2 rounded-xl p-6 hover-lift transition text-left"
                  style={{ borderColor: colors.light }}
                >
                  <h3 className="font-bold mb-2 title" style={{ color: colors.primary }}>{data.description}</h3>
                  <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>{data.tips}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-sm" style={{ borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <button
                onClick={() => setSelectedDemoExercise(null)}
                className="mb-6 font-semibold flex items-center gap-2 transition"
                style={{ color: colors.primary }}
              >
                ← Back
              </button>

              <h2 className="text-3xl font-bold mb-6 title" style={{ color: colors.primaryDark }}>
                {exercises[selectedDemoExercise].description}
              </h2>

              <div className="mb-8 aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={exercises[selectedDemoExercise].videoUrl}
                  title={exercises[selectedDemoExercise].description}
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <div className="rounded-lg p-6 mb-6 border-l-4" style={{ backgroundColor: colors.light, borderColor: colors.primary }}>
                <h3 className="font-semibold mb-3 title" style={{ color: colors.primaryDark }}>Form Tips</h3>
                <p style={{ color: colors.text }}>{exercises[selectedDemoExercise].tips}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {['light', 'intermediate', 'vigorous'].map(level => (
                  <div key={level} className="rounded-lg p-4 text-center border-2" style={{ borderColor: colors.light, backgroundColor: colors.light }}>
                    <p className="text-sm capitalize mb-2" style={{ color: colors.textSecondary }}>{level}</p>
                    <p className="font-bold text-lg" style={{ color: colors.primary }}>
                      {exercises[selectedDemoExercise].caloriesPerMin[level]} cal/min
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== HISTORY STAGE =====
  if (stage === 'history') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Lora', Georgia, serif" }}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={resetApp}
            className="mb-6 font-semibold flex items-center gap-2 transition"
            style={{ color: colors.primary }}
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold mb-8 title" style={{ color: colors.primaryDark }}>Workout History</h1>

          {workoutHistory.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center" style={{ borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <p style={{ color: colors.textSecondary }}>No workouts yet. Complete your first workout to see history!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workoutHistory.map((workout, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 rounded-xl p-6 hover-lift transition cursor-pointer"
                  style={{ borderColor: colors.light }}
                >
                  <h3 className="font-bold mb-1 title" style={{ color: colors.primary }}>
                    {new Date(workout.date).toLocaleDateString()}
                  </h3>
                  <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    {workout.duration} mins • {workout.totalCalories} cal • {goals[workout.goal]?.name || 'Custom'}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkout(idx);
                    }}
                    className="mt-3 text-sm font-semibold transition"
                    style={{ color: colors.error }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const deleteWorkout = async (index) => {
    const updatedHistory = workoutHistory.filter((_, i) => i !== index);
    setWorkoutHistory(updatedHistory);
    
    try {
      const keys = (await window.storage.list('workout:'))?.keys || [];
      if (keys[index]) {
        await window.storage.delete(keys[index]);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // ===== WORKOUT STAGE (PREPARATION) =====
  if (stage === 'workout' && workoutPlanGenerated && !workoutStarted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Lora', Georgia, serif" }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setStage('config');
              setWorkoutPlanGenerated(false);
            }}
            className="mb-6 font-semibold flex items-center gap-2 transition"
            style={{ color: colors.primary }}
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 title" style={{ color: colors.primaryDark }}>Ready?</h1>
            <p style={{ color: colors.textSecondary, fontSize: '1.125rem' }}>Your workout plan is ready</p>
          </div>

          {/* Exercise List */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm" style={{ borderColor: colors.lightBorder, borderWidth: '2px' }}>
            <h2 className="font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Your Workout Plan</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {workoutPlan.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg transition"
                  style={{
                    backgroundColor: item.type === 'rest' ? '#fef3c7' : '#f0f9ff',
                    borderLeft: `4px solid ${item.type === 'rest' ? '#f59e0b' : colors.primary}`
                  }}
                >
                  <p className="font-semibold" style={{ color: colors.text }}>
                    {item.type === 'rest' 
                      ? `Rest - ${Math.ceil(item.duration)}s` 
                      : `${exercises[item.exercise]?.description || 'Exercise'} (Set ${item.set}/${item.totalSets})`
                    }
                  </p>
                  <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                    {Math.ceil(item.duration)}s
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startWorkout}
            className="w-full py-4 text-white font-semibold rounded-xl hover-lift text-lg transition"
            style={{ backgroundColor: colors.primary }}
          >
            🚀 Start Now
          </button>
        </div>
      </div>
    );
  }

  // ===== WORKOUT STAGE (DURING) =====
  if (stage === 'workout' && workoutStarted) {
    const currentItem = workoutPlan[currentExerciseIndex];
    const isRest = currentItem?.type === 'rest';
    const exerciseName = isRest ? 'Rest Time' : exercises[currentItem?.exercise]?.description;
    const progress = Math.round(((currentExerciseIndex + 1) / workoutPlan.length) * 100);
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Lora', Georgia, serif" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Main Workout Display */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.light }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: colors.primary
                  }}
                />
              </div>
              <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>{progress}% Complete</p>
            </div>

            {/* Exercise Name & Timer */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Exercise Name */}
              <div className="text-center mb-12">
                <div className={`text-5xl font-bold mb-4 title`} style={{ color: isRest ? colors.success : colors.primaryDark }}>
                  {exerciseName}
                </div>
                {!isRest && (
                  <p style={{ color: colors.textSecondary }}>
                    Set {currentItem?.set || 1} of {currentItem?.totalSets || 1}
                  </p>
                )}
              </div>

              {/* Big Timer */}
              <div className="mb-12 text-center">
                <div className={`text-9xl font-bold font-mono mb-4 title`} style={{ color: isRest ? colors.success : colors.primary }}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <p style={{ color: colors.textSecondary, fontSize: '1.125rem' }}>
                  {isRest ? '💪 Great work! Recover and get ready.' : '💯 You\'ve got this! Keep pushing!'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex gap-4 justify-center mb-8">
                <button
                  onClick={togglePlayPause}
                  className="px-8 py-4 text-white rounded-xl font-bold hover-lift flex items-center gap-2 transition"
                  style={{ backgroundColor: colors.primary }}
                >
                  {!isPaused ? <Pause size={24} /> : <Play size={24} />}
                  {!isPaused ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={stopWorkout}
                  className="px-8 py-4 text-white rounded-xl font-bold hover-lift flex items-center gap-2 transition"
                  style={{ backgroundColor: colors.error }}
                >
                  <Square size={24} /> Stop
                </button>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-xl p-6 text-center w-full" style={{ borderColor: colors.lightBorder, borderWidth: '2px' }}>
                <p className="font-semibold" style={{ color: colors.text }}>
                  {isRest
                    ? '🌟 You\'re crushing this workout!'
                    : exercises[currentItem?.exercise]?.tips}
                </p>
              </div>
            </div>
          </div>

          {/* Exercise List Sidebar */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-6" style={{ borderColor: colors.lightBorder, borderWidth: '2px' }}>
            <h3 className="font-semibold mb-4 title" style={{ color: colors.primaryDark }}>Remaining</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workoutPlan.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg transition border-l-4"
                  style={{
                    backgroundColor: idx === currentExerciseIndex 
                      ? colors.primary 
                      : item.type === 'rest' 
                      ? '#fef3c7' 
                      : '#f0f9ff',
                    borderColor: idx === currentExerciseIndex 
                      ? colors.primary 
                      : item.type === 'rest' 
                      ? '#f59e0b' 
                      : colors.light,
                    opacity: idx < currentExerciseIndex ? 0.5 : 1
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: idx === currentExerciseIndex ? colors.textLight : colors.text }}>
                    {item.type === 'rest' 
                      ? `Rest ${Math.ceil(item.duration)}s` 
                      : exercises[item.exercise]?.description || 'Exercise'
                    }
                  </p>
                  {!item.type === 'rest' && (
                    <p style={{ color: idx === currentExerciseIndex ? colors.textLight : colors.textSecondary, fontSize: '0.75rem' }}>
                      Set {item.set}/{item.totalSets}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RESULTS STAGE =====
  if (stage === 'results') {
    const totalCalories = Object.values(completedExercises).reduce((sum, ex) => sum + ex.totalCalories, 0);

    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} p-6`} style={{ fontFamily: "'Lora', Georgia, serif" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-5xl font-bold mb-2 title" style={{ color: colors.primaryDark }}>You Did It!</h1>
            <p style={{ color: colors.textSecondary }}>Fantastic effort today!</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>{totalCalories}</div>
              <div style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Calories Burned</div>
            </div>
            <div className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>{Math.floor(totalTimeUsed / 60)}</div>
              <div style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Minutes</div>
            </div>
            <div className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: colors.lightBorder, borderWidth: '2px' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.primary }}>{Object.keys(completedExercises).length}</div>
              <div style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Exercises</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl p-8 shadow-sm mb-8" style={{ borderColor: colors.lightBorder, borderWidth: '2px' }}>
            <h2 className="font-bold text-lg mb-6 title" style={{ color: colors.primaryDark }}>Workout Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(completedExercises).map(([key, data]) => (
                <div key={key} className="flex justify-between items-center pb-4 last:border-0" style={{ borderBottomColor: colors.light, borderBottomWidth: '1px' }}>
                  <div>
                    <p className="font-semibold" style={{ color: colors.text }}>{data.name}</p>
                    <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>{data.sets} sets</p>
                  </div>
                  <p className="text-xl font-bold" style={{ color: colors.primary }}>{data.totalCalories} cal</p>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Message */}
          <div className="rounded-xl p-6 mb-8 text-center border-2" style={{ backgroundColor: colors.light, borderColor: colors.primary }}>
            <p className="font-semibold text-lg title" style={{ color: colors.primaryDark }}>🌟 Keep it up!</p>
            <p style={{ color: colors.text }} className="mt-2">
              You burned roughly {Math.round(totalCalories / 3500)}.{Math.round((totalCalories % 3500) / 350)} lbs of fat today. Keep crushing it!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={resetApp}
              className="flex-1 py-4 text-white font-semibold rounded-xl hover-lift transition"
              style={{ backgroundColor: colors.primary }}
            >
              New Workout
            </button>
            <button
              onClick={() => setStage('history')}
              className="flex-1 py-4 bg-white font-semibold rounded-xl border-2 hover-lift transition"
              style={{ borderColor: colors.primary, color: colors.primaryDark }}
            >
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }
}
