'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, Award, History,
  Music, Video, Settings, Trash2, Download, Zap, Volume2,
  VolumeX, ArrowLeft, Timer, Flame, Heart, X,
} from 'lucide-react';

import { exercises, goals, getRandomMessage } from '@/lib/exercises';
import { generateWorkoutPlan, calculateResults, calculateCalorieOptions, formatTime, formatDuration } from '@/lib/workout';
import { getWorkoutHistory, saveWorkout, deleteWorkout as removeWorkout, getStats, exportHistoryCSV } from '@/lib/storage';
import { getSpotifyAuthUrl, getStoredToken, extractTokenFromHash, startWorkoutMusic, clearToken } from '@/lib/spotify';
import { useVoice } from '@/hooks/useVoice';
import { useTimer } from '@/hooks/useTimer';

export default function FitPulse() {
  // --- State ---
  const [stage, setStage] = useState('home');
  const [ageRange, setAgeRange] = useState('25-35');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [duration, setDuration] = useState(25);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [calorieTarget, setCalorieTarget] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [completedResults, setCompletedResults] = useState({});
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] = useState(null);
  const [selectedDemoExercise, setSelectedDemoExercise] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalCalories: 0, totalTime: 0 });
  const [currentMotivation, setCurrentMotivation] = useState('');

  const planRef = useRef([]);
  const exerciseIndexRef = useRef(0);

  // --- Hooks ---
  const { speak, stop: stopVoice } = useVoice(voiceEnabled);

  const onTimerComplete = useCallback(() => {
    const plan = planRef.current;
    const nextIdx = exerciseIndexRef.current + 1;

    if (nextIdx < plan.length) {
      const nextItem = plan[nextIdx];
      exerciseIndexRef.current = nextIdx;
      setCurrentExerciseIndex(nextIdx);

      if (nextItem.type === 'rest') {
        speak(getRandomMessage('rest'));
        setCurrentMotivation(getRandomMessage('rest'));
      } else {
        const exName = exercises[nextItem.exercise]?.description;
        const progress = nextIdx / plan.length;
        const phase = progress > 0.8 ? 'almostDone' : progress > 0.4 ? 'midway' : 'start';
        speak(`Next up: ${exName}. Set ${nextItem.set} of ${nextItem.totalSets}. ${getRandomMessage(phase)}`);
        setCurrentMotivation(getRandomMessage(phase));
      }

      timer.start(nextItem.duration);
    } else {
      // Workout complete
      speak(getRandomMessage('complete'));
      setCurrentMotivation(getRandomMessage('complete'));
      finishWorkout();
    }
  }, [speak]);

  const onTimerTick = useCallback((remaining) => {
    setTotalTimeUsed(prev => prev + 1);
    // Announce at key moments
    if (remaining === 10) speak('10 seconds left!');
    if (remaining === 3) speak('3... 2... 1...');
  }, [speak]);

  const timer = useTimer(onTimerTick, onTimerComplete);

  // --- Initialize ---
  useEffect(() => {
    setWorkoutHistory(getWorkoutHistory());
    setStats(getStats());

    // Check for Spotify token in URL hash (OAuth callback)
    const token = extractTokenFromHash() || getStoredToken();
    if (token) setSpotifyToken(token);
  }, []);

  // --- Workout Actions ---
  function startWorkout() {
    const plan = generateWorkoutPlan(selectedGoal, selectedExercises, duration, fitnessLevel);
    if (plan.length === 0) return;

    setWorkoutPlan(plan);
    planRef.current = plan;
    setCurrentExerciseIndex(0);
    exerciseIndexRef.current = 0;
    setTotalTimeUsed(0);
    setCompletedResults({});
    setStage('workout');

    const firstItem = plan[0];
    const exName = firstItem.type === 'rest' ? 'Rest' : exercises[firstItem.exercise]?.description;
    speak(`Workout starting! First exercise: ${exName}. ${getRandomMessage('start')}`);
    setCurrentMotivation(getRandomMessage('start'));
    timer.start(firstItem.duration);

    if (musicEnabled && spotifyToken) {
      startWorkoutMusic(spotifyToken);
    }
  }

  function finishWorkout() {
    timer.reset();
    const results = calculateResults(planRef.current, fitnessLevel);
    setCompletedResults(results);

    const totalCal = Object.values(results).reduce((sum, ex) => sum + ex.totalCalories, 0);
    const workout = {
      date: new Date().toISOString(),
      fitnessLevel,
      duration,
      goal: selectedGoal,
      totalCalories: totalCal,
      totalTime: totalTimeUsed,
      exercises: results,
      calorieTarget,
    };

    const updated = saveWorkout(workout);
    setWorkoutHistory(updated);
    setStats(getStats());
    setStage('results');
  }

  function handleTogglePause() {
    timer.toggle();
    if (!timer.isRunning) {
      const item = workoutPlan[currentExerciseIndex];
      if (item?.type === 'rest') {
        speak('Resuming rest.');
      } else if (item) {
        speak(`Continuing with ${exercises[item.exercise]?.description}`);
      }
    }
  }

  function resetApp() {
    timer.reset();
    stopVoice();
    setStage('home');
    setSelectedExercises([]);
    setSelectedGoal(null);
    setCalorieTarget(null);
    setCurrentExerciseIndex(0);
    setTotalTimeUsed(0);
    setCompletedResults({});
    setWorkoutPlan([]);
    setCurrentMotivation('');
  }

  function handleDeleteWorkout(index) {
    const updated = removeWorkout(index);
    setWorkoutHistory(updated);
    setStats(getStats());
  }

  function replayWorkout(historyItem) {
    setFitnessLevel(historyItem.fitnessLevel || 'intermediate');
    setSelectedGoal(historyItem.goal);
    setDuration(historyItem.duration);
    setSelectedExercises([]);
    setStage('config');
  }

  // --- Shared UI Components ---
  function BackButton({ onClick }) {
    return (
      <button onClick={onClick} className="mb-6 text-cyan-300 hover:text-cyan-100 flex items-center gap-2 transition group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>
    );
  }

  function PageTitle({ children }) {
    return (
      <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-8" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.1em' }}>
        {children}
      </h1>
    );
  }

  // ========== HOME ==========
  if (stage === 'home') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-10 animate-slide-in">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-1" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.15em' }}>
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-glow-pulse inline-block">
                  FITPULSE
                </span>
              </h1>
              <p className="text-cyan-300/70 text-sm md:text-base font-light tracking-wide">v2.0 — Personal AI Fitness Coach</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-slate-800/60 backdrop-blur rounded-xl hover:bg-slate-700/80 transition border border-slate-700/50"
            >
              <Settings size={22} className="text-cyan-400" />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-slate-800/50 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6 mb-8 animate-slide-in">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-cyan-300 font-semibold text-lg">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Voice Guidance</p>
                    <p className="text-gray-400 text-sm">Spoken instructions during workout</p>
                  </div>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors relative ${voiceEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${voiceEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Workout Music</p>
                    <p className="text-gray-400 text-sm">Play music via Spotify</p>
                  </div>
                  <button
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors relative ${musicEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${musicEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                {musicEnabled && (
                  <div className="bg-slate-700/50 rounded-xl p-4 mt-2">
                    <div className="flex items-center gap-3">
                      <Music size={20} className="text-green-400" />
                      {spotifyToken ? (
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-green-400 font-medium">Spotify Connected</span>
                          <button
                            onClick={() => { clearToken(); setSpotifyToken(null); }}
                            className="text-sm text-gray-400 hover:text-red-400 transition"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => window.location.href = getSpotifyAuthUrl()}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                        >
                          Connect Spotify
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {stats.totalWorkouts > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8 animate-float-up">
              <div className="bg-gradient-to-br from-cyan-600/90 to-blue-700/90 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stats.totalWorkouts}</div>
                <p className="text-cyan-200/80 text-xs mt-1">Workouts</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600/90 to-pink-700/90 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stats.totalCalories.toLocaleString()}</div>
                <p className="text-purple-200/80 text-xs mt-1">Calories</p>
              </div>
              <div className="bg-gradient-to-br from-orange-600/90 to-red-700/90 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{formatDuration(stats.totalTime)}</div>
                <p className="text-orange-200/80 text-xs mt-1">Total Time</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setStage('setup')}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-lg flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Zap size={24} /> Start New Workout
            </button>

            {workoutHistory.length > 0 && (
              <button
                onClick={() => setStage('history')}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-purple-500/30 transition-all text-lg flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <History size={24} /> Workout History ({workoutHistory.length})
              </button>
            )}

            <button
              onClick={() => setStage('demos')}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all text-lg flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Video size={24} /> Exercise Demos & Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== SETUP ==========
  if (stage === 'setup') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <BackButton onClick={resetApp} />
          <PageTitle>NEW WORKOUT</PageTitle>

          <div className="space-y-6">
            {/* Age Range */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <label className="block text-cyan-300 font-semibold mb-4 text-xs uppercase tracking-widest">Age Range</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['18-24', '25-35', '36-50', '50+'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setAgeRange(range)}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      ageRange === range
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-700/60 text-gray-300 hover:bg-slate-600/80'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Fitness Level */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <label className="block text-cyan-300 font-semibold mb-4 text-xs uppercase tracking-widest">Fitness Level</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'light', label: 'Light', desc: 'Getting started' },
                  { key: 'intermediate', label: 'Moderate', desc: 'Regular exerciser' },
                  { key: 'vigorous', label: 'Vigorous', desc: 'Advanced athlete' },
                ].map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setFitnessLevel(key)}
                    className={`py-3 px-2 rounded-xl font-semibold transition-all text-center ${
                      fitnessLevel === key
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-700/60 text-gray-300 hover:bg-slate-600/80'
                    }`}
                  >
                    <div className="text-sm">{label}</div>
                    <div className={`text-xs mt-0.5 ${fitnessLevel === key ? 'text-cyan-100' : 'text-gray-500'}`}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <label className="block text-cyan-300 font-semibold mb-4 text-xs uppercase tracking-widest">Duration</label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full mb-3"
              />
              <div className="text-center">
                <span className="text-4xl font-bold text-cyan-400 font-display">{duration}</span>
                <span className="text-cyan-300/60 ml-2 text-lg">minutes</span>
              </div>
            </div>

            <button
              onClick={() => setStage('config')}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== CONFIG ==========
  if (stage === 'config') {
    const calorieOptions = calculateCalorieOptions(duration, fitnessLevel);

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <BackButton onClick={() => setStage('setup')} />
          <PageTitle>BUILD YOUR WORKOUT</PageTitle>

          <div className="space-y-6">
            {/* Goals */}
            <div>
              <h2 className="text-cyan-300 font-semibold mb-4 text-xs uppercase tracking-widest">Quick Goals</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(goals).map(([key, goal]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedGoal(key); setSelectedExercises([]); }}
                    className={`p-4 rounded-2xl font-semibold transition-all text-left ${
                      selectedGoal === key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-slate-800/60 text-gray-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{goal.icon}</div>
                    <div className="font-bold">{goal.name}</div>
                    <div className={`text-xs mt-1 ${selectedGoal === key ? 'text-pink-100' : 'text-gray-500'}`}>
                      {goal.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Exercises */}
            <div>
              <h2 className="text-cyan-300 font-semibold mb-4 text-xs uppercase tracking-widest">Or Pick Exercises</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(exercises).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedGoal(null);
                      setSelectedExercises(prev =>
                        prev.includes(key) ? prev.filter(e => e !== key) : [...prev, key]
                      );
                    }}
                    className={`p-3 rounded-xl font-semibold transition-all text-center ${
                      selectedExercises.includes(key)
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-800/60 text-gray-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    <div className="text-xl mb-1">{data.icon}</div>
                    <div className="text-sm">{data.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calorie Target */}
            <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-cyan-300 font-semibold mb-4 text-xs uppercase tracking-widest">Target Calories (optional)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {calorieOptions.map((cal) => (
                  <button
                    key={cal}
                    onClick={() => setCalorieTarget(calorieTarget === cal ? null : cal)}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      calorieTarget === cal
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-slate-700/60 text-gray-300 hover:bg-slate-600/80'
                    }`}
                  >
                    {cal} cal
                  </button>
                ))}
              </div>
            </div>

            {/* Start */}
            <button
              onClick={startWorkout}
              disabled={!selectedGoal && selectedExercises.length === 0}
              className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-green-500/30 transition-all text-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Zap size={24} /> Start Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== WORKOUT ==========
  if (stage === 'workout') {
    const currentItem = workoutPlan[currentExerciseIndex];
    const isRest = currentItem?.type === 'rest';
    const exerciseName = isRest ? 'REST' : (exercises[currentItem?.exercise]?.description || 'Exercise');
    const progress = workoutPlan.length > 0 ? Math.round(((currentExerciseIndex + 1) / workoutPlan.length) * 100) : 0;
    const exerciseIcon = isRest ? '' : (exercises[currentItem?.exercise]?.icon || '');
    const exerciseTips = isRest ? '' : (exercises[currentItem?.exercise]?.tips || '');

    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-slate-700/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{progress}% Complete</span>
              <span>Step {currentExerciseIndex + 1} / {workoutPlan.length}</span>
            </div>
          </div>

          {/* Exercise Name */}
          <div className="text-center mb-4">
            {!isRest && currentItem && (
              <p className="text-gray-400 text-sm mb-1">
                Set {currentItem.set} of {currentItem.totalSets}
              </p>
            )}
            <div className={`text-4xl md:text-6xl font-bold ${isRest ? 'text-green-400' : 'text-cyan-400'}`} style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>
              {exerciseIcon && <span className="mr-3">{exerciseIcon}</span>}
              {exerciseName}
            </div>
          </div>

          {/* Countdown */}
          <div className={`text-center mb-8 ${timer.isRunning ? 'countdown-active' : ''}`}>
            <div className={`text-8xl md:text-9xl font-bold tabular-nums tracking-tight ${isRest ? 'text-green-400' : 'text-cyan-400'}`} style={{ fontFamily: 'Space Mono' }}>
              {formatTime(timer.timeRemaining)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={handleTogglePause}
              className={`px-10 py-4 rounded-2xl font-bold text-white transition-all flex items-center gap-2 text-lg active:scale-95 ${
                timer.isRunning
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30'
              }`}
            >
              {timer.isRunning ? <Pause size={24} /> : <Play size={24} />}
              {timer.isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={resetApp}
              className="px-6 py-4 bg-slate-700/60 text-gray-300 rounded-2xl hover:bg-red-600/30 hover:text-red-300 transition-all"
              title="End workout"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tips / Motivation */}
          <div className={`rounded-2xl p-5 text-center ${isRest ? 'bg-green-900/20 border border-green-500/20' : 'bg-slate-800/40 border border-slate-700/50'}`}>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed">
              {isRest ? currentMotivation || 'Deep breaths. You\'re doing great.' : exerciseTips}
            </p>
          </div>

          {/* Voice & Music status */}
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
            {voiceEnabled && (
              <span className="flex items-center gap-1"><Volume2 size={14} /> Voice ON</span>
            )}
            {musicEnabled && spotifyToken && (
              <span className="flex items-center gap-1"><Music size={14} /> Music ON</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== RESULTS ==========
  if (stage === 'results') {
    const totalCalories = Object.values(completedResults).reduce((sum, ex) => sum + ex.totalCalories, 0);
    const fatBurnLbs = (totalCalories / 3500).toFixed(3);

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-slide-in">
            <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>
              WORKOUT COMPLETE!
            </h1>
            <p className="text-gray-400 mt-2">{currentMotivation}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-gradient-to-br from-cyan-600/90 to-blue-700/90 rounded-2xl p-5 text-center">
              <Flame className="w-6 h-6 text-cyan-200 mx-auto mb-1" />
              <div className="text-3xl font-bold text-white">{totalCalories}</div>
              <div className="text-cyan-200/80 text-xs">Calories</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600/90 to-pink-700/90 rounded-2xl p-5 text-center">
              <Timer className="w-6 h-6 text-purple-200 mx-auto mb-1" />
              <div className="text-3xl font-bold text-white">{formatDuration(totalTimeUsed)}</div>
              <div className="text-purple-200/80 text-xs">Duration</div>
            </div>
            <div className="bg-gradient-to-br from-green-600/90 to-emerald-700/90 rounded-2xl p-5 text-center">
              <Heart className="w-6 h-6 text-green-200 mx-auto mb-1" />
              <div className="text-3xl font-bold text-white">{fatBurnLbs}</div>
              <div className="text-green-200/80 text-xs">lbs fat equiv.</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 mb-8">
            <h2 className="text-cyan-300 font-bold text-sm uppercase tracking-widest mb-5">Exercise Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(completedResults).map(([key, data]) => (
                <div key={key} className="flex justify-between items-center pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{exercises[key]?.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{data.name}</p>
                      <p className="text-xs text-gray-400">{data.sets} sets &middot; {formatDuration(data.totalTime)}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-orange-400">{data.totalCalories} <span className="text-xs font-normal text-gray-400">cal</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={resetApp}
              className="py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98]"
            >
              New Workout
            </button>
            <button
              onClick={() => { setSelectedHistoryWorkout(null); setStage('history'); }}
              className="py-4 bg-slate-700/60 text-white font-bold rounded-2xl hover:bg-slate-600/80 transition-all active:scale-[0.98]"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== HISTORY ==========
  if (stage === 'history') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <BackButton onClick={resetApp} />

          <div className="flex justify-between items-center mb-8">
            <PageTitle>WORKOUT HISTORY</PageTitle>
            {workoutHistory.length > 0 && (
              <button
                onClick={exportHistoryCSV}
                className="px-4 py-2 bg-cyan-600/80 text-white rounded-xl hover:bg-cyan-600 transition flex items-center gap-2 text-sm"
              >
                <Download size={16} /> CSV
              </button>
            )}
          </div>

          {selectedHistoryWorkout ? (
            <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-slide-in">
              <BackButton onClick={() => setSelectedHistoryWorkout(null)} />

              <h2 className="text-2xl font-bold text-cyan-400 mb-1">
                {new Date(selectedHistoryWorkout.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {new Date(selectedHistoryWorkout.date).toLocaleTimeString()}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/40 rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase">Duration</p>
                  <p className="text-cyan-400 font-bold text-lg">{selectedHistoryWorkout.duration} mins</p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase">Calories</p>
                  <p className="text-orange-400 font-bold text-lg">{selectedHistoryWorkout.totalCalories} cal</p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase">Fitness Level</p>
                  <p className="text-purple-400 font-bold text-lg capitalize">{selectedHistoryWorkout.fitnessLevel}</p>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase">Goal</p>
                  <p className="text-blue-400 font-bold text-lg">
                    {selectedHistoryWorkout.goal ? goals[selectedHistoryWorkout.goal]?.name : 'Custom'}
                  </p>
                </div>
              </div>

              {/* Exercises */}
              {selectedHistoryWorkout.exercises && (
                <div className="bg-slate-700/30 rounded-xl p-5 mb-6">
                  <h3 className="text-cyan-300 font-semibold mb-4 text-sm uppercase tracking-widest">Exercises</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedHistoryWorkout.exercises).map(([key, data]) => (
                      <div key={key} className="flex justify-between items-center pb-3 border-b border-slate-600/50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span>{exercises[key]?.icon}</span>
                          <div>
                            <p className="font-medium text-white">{data.name}</p>
                            <p className="text-xs text-gray-400">{data.sets} sets</p>
                          </div>
                        </div>
                        <p className="text-orange-400 font-bold">{data.totalCalories} cal</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => replayWorkout(selectedHistoryWorkout)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <RotateCcw size={18} className="inline mr-2" /> Replay This Workout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workoutHistory.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-10 text-center">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No workouts yet. Complete your first workout to see history!</p>
                </div>
              ) : (
                workoutHistory.map((workout, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/30 transition cursor-pointer flex justify-between items-center group"
                  >
                    <div onClick={() => setSelectedHistoryWorkout(workout)} className="flex-1">
                      <h3 className="font-bold text-cyan-400 mb-1 text-sm">
                        {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {workout.duration} mins &middot; {workout.totalCalories} cal &middot; {workout.goal ? goals[workout.goal]?.name : 'Custom'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(idx); }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 rounded-lg transition-all ml-3"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== EXERCISE DEMOS ==========
  if (stage === 'demos') {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <BackButton onClick={() => { setSelectedDemoExercise(null); resetApp(); }} />
          <PageTitle>EXERCISE DEMOS</PageTitle>

          {!selectedDemoExercise ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(exercises).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDemoExercise(key)}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-cyan-500/30 transition-all text-left group"
                >
                  <div className="text-3xl mb-2">{data.icon}</div>
                  <h3 className="font-bold text-cyan-400 mb-1 group-hover:text-cyan-300">{data.description}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{data.tips}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {data.muscles.map(m => (
                      <span key={m} className="text-[10px] bg-slate-700/60 text-gray-400 px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-slide-in">
              <BackButton onClick={() => setSelectedDemoExercise(null)} />

              <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3" style={{ fontFamily: 'Bebas Neue' }}>
                <span className="text-4xl">{exercises[selectedDemoExercise].icon}</span>
                {exercises[selectedDemoExercise].description}
              </h2>

              {/* YouTube Embed */}
              <div className="mb-6 aspect-video bg-black rounded-2xl overflow-hidden shadow-lg shadow-black/40">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${exercises[selectedDemoExercise].videoId}`}
                  title={exercises[selectedDemoExercise].description}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Form Tips */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-6">
                <h3 className="text-cyan-300 font-semibold mb-3 text-sm uppercase tracking-widest">Form Tips</h3>
                <p className="text-gray-300 leading-relaxed">{exercises[selectedDemoExercise].tips}</p>
              </div>

              {/* Muscles */}
              <div className="flex flex-wrap gap-2 mb-6">
                {exercises[selectedDemoExercise].muscles.map(m => (
                  <span key={m} className="text-sm bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded-full border border-cyan-700/30">{m}</span>
                ))}
              </div>

              {/* Calorie rates */}
              <div className="grid grid-cols-3 gap-3">
                {['light', 'intermediate', 'vigorous'].map(level => (
                  <div key={level} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-xs capitalize mb-2">{level}</p>
                    <p className="text-cyan-400 font-bold text-xl">
                      {exercises[selectedDemoExercise].caloriesPerMin[level]}
                    </p>
                    <p className="text-gray-500 text-xs">cal/min</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
