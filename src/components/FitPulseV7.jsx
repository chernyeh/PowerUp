'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle } from 'lucide-react';

export default function FitPulseV7() {
  const [stage, setStage] = useState('config');
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
  const [voiceRate, setVoiceRate] = useState(0.9);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [countdown, setCountdown] = useState(0);
  const synth = useRef(null);

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
    } else if (countdown === 0 && isRunning && stage === 'workout') {
      // Countdown finished, start normal timer
    }
    return () => clearInterval(interval);
  }, [countdown, isRunning, stage]);

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

  // ALL EXERCISES - organized by category
  const exercises = {
    skipping: { caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 }, description: 'Skipping', tips: 'Keep steady rhythm.' },
    plank: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Plank Hold', tips: 'Keep your body straight.' },
    sidePlank: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Side Plank', tips: 'Keep your hips high.' },
    crunches: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Crunches', tips: 'Lift your shoulders only.' },
    bicycleCrunches: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Bicycle Crunches', tips: 'Alternate sides smoothly.' },
    mountainClimbers: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Mountain Climbers', tips: 'Keep hips level!' },
    legRaises: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Leg Raises', tips: 'Lift legs slowly.' },
    balanceBoard: { caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 }, description: 'Balance Board', tips: 'Focus on stability.' },
    jumpingJacks: { caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 }, description: 'Jumping Jacks', tips: 'Keep a steady pace.' },
    marchingInPlace: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5 }, description: 'Marching in Place', tips: 'Lift your knees high.' },
    walkingLunges: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Walking Lunges', tips: 'Keep your torso upright.' },
    highKnees: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'High Knees', tips: 'Keep moving fast!' },
    burpees: { caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 }, description: 'Burpees', tips: 'Quality over speed!' },
    pushups: { caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 }, description: 'Push-ups', tips: 'Keep elbows close!' },
    squats: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Squats', tips: 'Keep your chest up!' },
    jumpSquats: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Jump Squats', tips: 'Land softly.' },
    gluteBridges: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Glute Bridges', tips: 'Squeeze glutes at top!' },
    childsPose: { caloriesPerMin: { light: 1, intermediate: 1.5, vigorous: 2 }, description: 'Child\'s Pose', tips: 'Relax and breathe.' },
    downwardDog: { caloriesPerMin: { light: 2.5, intermediate: 3.5, vigorous: 5 }, description: 'Downward Dog', tips: 'Push your hips up high.' },
    armCircles: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Arm Circles', tips: 'Both directions!' },
    tricepDips: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Tricep Dips', tips: 'Lower your body slowly.' },
  };

  const goals = {
    general: ['skipping', 'pushups', 'squats', 'mountainClimbers'],
    core: ['plank', 'sidePlank', 'mountainClimbers', 'crunches', 'bicycleCrunches', 'legRaises'],
    cardio: ['skipping', 'jumpingJacks', 'highKnees', 'burpees'],
    strength: ['pushups', 'squats', 'gluteBridges', 'tricepDips'],
    balance: ['balanceBoard', 'sidePlank', 'childsPose'],
    hiit: ['burpees', 'jumpSquats', 'jumpingJacks'],
  };

  const colors = {
    primary: '#1e40af',
    primaryLight: '#3b82f6',
    dark: '#0f172a',
    text: '#1f2937',
    border: '#e5e7eb',
    light: '#f9fafb',
  };

  const generatePlan = () => {
    const exercisesToUse = selectedGoal ? goals[selectedGoal] : selectedExercises.length > 0 ? selectedExercises : Object.keys(exercises).slice(0, 5);
    const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
    const plan = [];

    for (let set = 1; set <= sets; set++) {
      for (let i = 0; i < exercisesToUse.length; i++) {
        const ex = exercisesToUse[i];
        plan.push({ exercise: ex, duration: 45, type: 'exercise', set, totalSets: sets });
        // Add 10s transition rest between exercises
        if (i < exercisesToUse.length - 1) {
          plan.push({ type: 'transition', duration: 10 });
        }
      }
      // Add 45s rest between sets
      if (set < sets) {
        plan.push({ type: 'rest', duration: 45 });
      }
    }

    setWorkoutPlan(plan);
    setCurrentIndex(0);
    setTimeLeft(5);
    setCountdown(5);
    setStage('prep');
  };

  const startWorkout = () => {
    setStage('workout');
    setCountdown(5);
    setTimeLeft(45); // Set proper duration, countdown will override display
    speak('Get ready! Starting in 5, 4, 3, 2, 1. Let\'s go!');
    // Start actual workout after countdown
    setTimeout(() => {
      setIsRunning(true);
      setCountdown(0);
      setTimeLeft(45); // Reset to proper exercise duration
    }, 5100);
  };

  const moveToNextExercise = () => {
    if (currentIndex < workoutPlan.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTimeLeft(workoutPlan[nextIndex].duration);
      const nextItem = workoutPlan[nextIndex];
      if (nextItem.type === 'exercise') {
        speak(`Next up: ${exercises[nextItem.exercise].description}. You've got this!`);
      } else if (nextItem.type === 'transition') {
        speak('Take a breath, get ready for the next one');
      } else if (nextItem.type === 'rest') {
        speak('Time to rest. Catch your breath!');
      }
    } else {
      setStage('results');
      setIsRunning(false);
      speak('Amazing! You did it! Great workout!');
    }
  };

  const speak = (text) => {
    if (synth.current) {
      synth.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      // Try to use a female voice for warmer tone
      const voices = synth.current.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('female') || v.name.includes('Female') || v.name.includes('woman'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      synth.current.speak(utterance);
    }
  };

  // CONFIG SCREEN
  if (stage === 'config') {
    return (
      <div style={{
        padding: '50px 40px',
        fontFamily: '"Lora", Georgia, serif',
        maxWidth: '900px',
        margin: '0 auto',
        minHeight: '100vh',
        background: colors.light,
      }}>
        {/* HEADER */}
        <div style={{ marginBottom: '50px' }}>
          <h1 style={{ color: colors.primary, marginBottom: '10px', fontSize: '2.8em', fontFamily: '"Lora", Georgia, serif', fontWeight: '400', letterSpacing: '0.5px' }}>FitPulse</h1>
          <p style={{ color: colors.textSecondary, fontSize: '1.1em' }}>Your Personal Fitness Coach</p>
        </div>

        {/* SETTINGS SECTION */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Customize Your Workout</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginBottom: '30px' }}>
            {/* Age Group */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Age Group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontFamily: '"Lora", Georgia, serif',
                  fontSize: '1em',
                  color: colors.text,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option>11-12</option>
                <option>13-17</option>
                <option>18-25</option>
                <option>26-35</option>
                <option>36-50</option>
                <option>50+</option>
              </select>
            </div>

            {/* Fitness Level */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Fitness Level</label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontFamily: '"Lora", Georgia, serif',
                  fontSize: '1em',
                  color: colors.text,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="light">Light</option>
                <option value="intermediate">Intermediate</option>
                <option value="vigorous">Vigorous</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Duration: {duration} min</label>
              <input
                type="range"
                min="5"
                max="60"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* QUICK GOALS */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Quick Goals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            {Object.keys(goals).map((goal) => (
              <button
                key={goal}
                onClick={() => {
                  setSelectedGoal(goal);
                  setSelectedExercises([]);
                }}
                style={{
                  padding: '18px',
                  background: selectedGoal === goal ? colors.primary : 'white',
                  color: selectedGoal === goal ? 'white' : colors.text,
                  border: `2px solid ${selectedGoal === goal ? colors.primary : colors.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: '"Lora", Georgia, serif',
                  fontSize: '1em',
                  fontWeight: selectedGoal === goal ? 'bold' : 'normal',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                }}
              >
                {goal === 'general' && '⭐\nGeneral'}
                {goal === 'core' && '💪\nCore'}
                {goal === 'cardio' && '🏃\nCardio'}
                {goal === 'strength' && '💥\nStrength'}
                {goal === 'balance' && '⚖️\nBalance'}
                {goal === 'hiit' && '⚡\nHIIT'}
              </button>
            ))}
          </div>
        </div>

        {/* EXERCISES */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Or Mix & Match Exercises</h2>
          <p style={{ color: colors.textSecondary, marginBottom: '20px', fontSize: '0.95em' }}>({selectedExercises.length} selected)</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px',
            padding: '20px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            background: 'white',
          }}>
            {Object.keys(exercises).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedGoal(null);
                  if (selectedExercises.includes(key)) {
                    setSelectedExercises(selectedExercises.filter((ex) => ex !== key));
                  } else {
                    setSelectedExercises([...selectedExercises, key]);
                  }
                }}
                style={{
                  padding: '12px',
                  background: selectedExercises.includes(key) ? colors.primaryLight : 'white',
                  color: selectedExercises.includes(key) ? 'white' : colors.text,
                  border: `1px solid ${selectedExercises.includes(key) ? colors.primaryLight : colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: '"Lora", Georgia, serif',
                  fontSize: '0.9em',
                  fontWeight: selectedExercises.includes(key) ? 'bold' : 'normal',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                {exercises[key].description}
              </button>
            ))}
          </div>
        </div>

        {/* START BUTTON */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => generatePlan()}
            style={{
              width: '100%',
              padding: '16px',
              background: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: '"Lora", Georgia, serif',
              fontSize: '1.1em',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)',
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(30, 64, 175, 0.2)'}
          >
            📋 Prepare Workout
          </button>
        </div>
      </div>
    );
  }

  // PREP SCREEN
  if (stage === 'prep') {
    return (
      <div style={{
        padding: '40px',
        fontFamily: '"Lora", Georgia, serif',
        maxWidth: '700px',
        margin: '0 auto',
        minHeight: '100vh',
        background: colors.light,
      }}>
        <h2 style={{ color: colors.primary, marginBottom: '30px', fontSize: '2em' }}>Your Workout Plan</h2>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          maxHeight: '400px',
          overflowY: 'auto',
          border: `1px solid ${colors.border}`,
        }}>
          {workoutPlan.map((item, idx) => (
            <div key={idx} style={{
              padding: '12px',
              borderBottom: `1px solid ${colors.border}`,
              color: item.type === 'rest' ? '#9ca3af' : colors.text,
              fontWeight: item.type === 'exercise' ? 'bold' : 'normal',
            }}>
              {item.type === 'exercise' ? (
                <span>💪 {exercises[item.exercise].description} ({item.duration}s) - Set {item.set}/{item.totalSets}</span>
              ) : (
                <span>😤 Rest ({item.duration}s)</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => startWorkout()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.1em',
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: '"Lora", Georgia, serif',
          }}
        >
          🚀 Start Workout
        </button>
      </div>
    );
  }

  // WORKOUT SCREEN
  if (stage === 'workout') {
    const current = workoutPlan[currentIndex];
    const exerciseData = current?.type === 'exercise' ? exercises[current.exercise] : null;
    const isRest = current?.type === 'rest';
    const isTransition = current?.type === 'transition';

    return (
      <div style={{
        padding: '40px',
        fontFamily: '"Lora", Georgia, serif',
        minHeight: '100vh',
        background: colors.light,
        textAlign: 'center',
      }}>
        <h2 style={{
          color: colors.primary,
          marginBottom: '30px',
          fontFamily: '"Lora", Georgia, serif',
          fontSize: '2.2em',
          fontWeight: '400',
        }}>
          {countdown > 0 ? 'Get Ready!' : isTransition ? '✨ Quick Break' : isRest ? '😤 Rest Time' : `💪 ${exerciseData?.description}`}
        </h2>

        <div style={{
          fontSize: countdown > 0 ? '6em' : '5em',
          color: colors.primary,
          marginBottom: '30px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}>
          {countdown > 0 ? countdown : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
        </div>

        {countdown > 0 && (
          <p style={{ color: colors.text, fontSize: '1.2em', marginBottom: '30px', fontStyle: 'italic' }}>Starting your workout soon...</p>
        )}

        <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isRunning ? (
            <button
              onClick={() => {
                setIsRunning(true);
                setCountdown(0);
                setIsPaused(false);
                if (isTransition) {
                  speak('Take your time, get ready');
                } else if (isRest) {
                  speak('Rest time. Breathe and relax');
                } else {
                  speak(`Starting ${exerciseData?.description}. You can do it!`);
                }
              }}
              style={{
                padding: '12px 24px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1em',
                fontFamily: '"Lora", Georgia, serif',
              }}
            >
              <Play size={20} style={{ display: 'inline', marginRight: '8px' }} /> Play
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  padding: '12px 24px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  fontFamily: '"Lora", Georgia, serif',
                }}
              >
                <Pause size={20} style={{ display: 'inline', marginRight: '8px' }} /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setStage('config');
                  setWorkoutPlan([]);
                }}
                style={{
                  padding: '12px 24px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  fontFamily: '"Lora", Georgia, serif',
                }}
              >
                <StopCircle size={20} style={{ display: 'inline', marginRight: '8px' }} /> Stop
              </button>
            </>
          )}
        </div>

        <p style={{ color: colors.text, marginBottom: '30px', fontSize: '1.1em' }}>
          Exercise {currentIndex + 1} of {workoutPlan.length}
        </p>

        {exerciseData && (
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${colors.border}`,
          }}>
            <p style={{ color: colors.text, fontSize: '1.1em' }}>💡 {exerciseData.tips}</p>
          </div>
        )}

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxHeight: '200px',
          overflowY: 'auto',
          border: `1px solid ${colors.border}`,
        }}>
          <h4 style={{ color: colors.primary, marginBottom: '15px' }}>📋 Exercises</h4>
          {workoutPlan.map((item, idx) => (
            <div key={idx} style={{
              padding: '8px',
              background: idx === currentIndex ? colors.primary : 'transparent',
              color: idx === currentIndex ? 'white' : colors.text,
              opacity: idx < currentIndex ? 0.5 : 1,
              borderRadius: '4px',
              marginBottom: '4px',
              fontSize: '0.9em',
            }}>
              {item.type === 'exercise' ? `💪 ${exercises[item.exercise].description}` : item.type === 'rest' ? '😤 Rest' : '✨ Quick Break'}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (stage === 'results') {
    return (
      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        fontFamily: '"Lora", Georgia, serif',
        minHeight: '100vh',
        background: colors.light,
      }}>
        <h1 style={{ fontSize: '3em', color: colors.primary, marginBottom: '20px', fontFamily: '"Playfair Display", serif' }}>🎉 Workout Complete!</h1>
        <p style={{ fontSize: '1.3em', color: colors.text, marginBottom: '30px' }}>Great job! You completed {workoutPlan.length} exercises.</p>
        <button
          onClick={() => {
            setStage('config');
            setWorkoutPlan([]);
            setSelectedGoal(null);
            setSelectedExercises([]);
          }}
          style={{
            padding: '12px 40px',
            fontSize: '1.1em',
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: '"Lora", Georgia, serif',
          }}
        >
          Start New Workout
        </button>
      </div>
    );
  }
}
