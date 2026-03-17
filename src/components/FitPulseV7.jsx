'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Volume2, Settings, RotateCcw, ChevronRight } from 'lucide-react';

export default function FitPulseV7() {
  const [stage, setStage] = useState('home');
  const [ageGroup, setAgeGroup] = useState('13-17');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [duration, setDuration] = useState(20);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [workoutPlanGenerated, setWorkoutPlanGenerated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.2);
  const [selectedVoice, setSelectedVoice] = useState('Google US English Female');
  const synth = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0) {
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
  }, [isRunning, isPaused, timeLeft, currentIndex, workoutPlan]);

  const exercises = {
    skipping: {
      caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 },
      description: 'Skipping',
      videoUrl: 'https://www.youtube.com/embed/N5RqJqG5K6c?autoplay=1',
      tips: 'Keep steady rhythm. Land softly on the balls of your feet.',
    },
    plank: {
      caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 },
      description: 'Plank Hold',
      videoUrl: 'https://www.youtube.com/embed/QoGhk0FkkIU?autoplay=1',
      tips: 'Keep your body straight like a board. Engage your core!',
    },
    sidePlank: {
      caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 },
      description: 'Side Plank',
      videoUrl: 'https://www.youtube.com/embed/qFj-xc3u5y0?autoplay=1',
      tips: 'Stack your feet and keep your hips high. You\'ve got this!',
    },
    crunches: {
      caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 },
      description: 'Crunches',
      videoUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU?autoplay=1',
      tips: 'Hands behind your head. Lift your shoulders only.',
    },
    bicycleCrunches: {
      caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 },
      description: 'Bicycle Crunches',
      videoUrl: 'https://www.youtube.com/embed/kzdnR6H-F1k?autoplay=1',
      tips: 'Bring opposite elbow to knee. Alternate sides smoothly.',
    },
    mountainClimbers: {
      caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 },
      description: 'Mountain Climbers',
      videoUrl: 'https://www.youtube.com/embed/nmwgirgblLw?autoplay=1',
      tips: 'Start in plank. Bring knees to chest quickly. Keep hips level!',
    },
    legRaises: {
      caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 },
      description: 'Leg Raises',
      videoUrl: 'https://www.youtube.com/embed/RgMvXYQUhLs?autoplay=1',
      tips: 'Lie flat. Lift legs slowly without bending knees.',
    },
    balanceBoard: {
      caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 },
      description: 'Balance Board',
      videoUrl: 'https://www.youtube.com/embed/Z9aXvC5BjD0?autoplay=1',
      tips: 'Focus on stability. Small adjustments help! Stand on one foot for more challenge.',
    },
    jumpingJacks: {
      caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 },
      description: 'Jumping Jacks',
      videoUrl: 'https://www.youtube.com/embed/3mClXukeKxg?autoplay=1',
      tips: 'Keep a steady pace. Your feet apart, arms up!',
    },
    marchingInPlace: {
      caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5 },
      description: 'Marching in Place',
      videoUrl: 'https://www.youtube.com/embed/i2YmwJvGvmU?autoplay=1',
      tips: 'Lift your knees up high. Keep your arms moving.',
    },
    walkingLunges: {
      caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 },
      description: 'Walking Lunges',
      videoUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U?autoplay=1',
      tips: 'Step forward and bend your back knee. Keep your torso upright.',
    },
    highKnees: {
      caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 },
      description: 'High Knees',
      videoUrl: 'https://www.youtube.com/embed/nPvJZI5fYMM?autoplay=1',
      tips: 'Pump your knees up to hip height. Keep moving fast!',
    },
    burpees: {
      caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 },
      description: 'Burpees',
      videoUrl: 'https://www.youtube.com/embed/JZQA8BlU2fg?autoplay=1',
      tips: 'Go at your own pace. Quality over speed!',
    },
    pushups: {
      caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 },
      description: 'Push-ups',
      videoUrl: 'https://www.youtube.com/embed/Eh00_rniF8E?autoplay=1',
      tips: 'Lower yourself until chest nearly touches the ground. Keep elbows close!',
    },
    squats: {
      caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 },
      description: 'Squats',
      videoUrl: 'https://www.youtube.com/embed/xqvCmoLUGkQ?autoplay=1',
      tips: 'Bend your knees and lower your hips. Keep your chest up!',
    },
    jumpSquats: {
      caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 },
      description: 'Jump Squats',
      videoUrl: 'https://www.youtube.com/embed/GSO8jVMkfXA?autoplay=1',
      tips: 'Squat down then jump explosively. Land softly.',
    },
    gluteBridges: {
      caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 },
      description: 'Glute Bridges',
      videoUrl: 'https://www.youtube.com/embed/wPM8ic32ufQ?autoplay=1',
      tips: 'Lie on your back. Push through heels. Squeeze glutes at top!',
    },
    childsPose: {
      caloriesPerMin: { light: 1, intermediate: 1.5, vigorous: 2 },
      description: 'Child\'s Pose',
      videoUrl: 'https://www.youtube.com/embed/TaP3C9xwMSI?autoplay=1',
      tips: 'Kneel and sit back on your heels. Relax and breathe.',
    },
    downwardDog: {
      caloriesPerMin: { light: 2.5, intermediate: 3.5, vigorous: 5 },
      description: 'Downward Dog',
      videoUrl: 'https://www.youtube.com/embed/TaP3C9xwMSI?autoplay=1',
      tips: 'Hands and feet on ground. Push your hips up high.',
    },
    armCircles: {
      caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 },
      description: 'Arm Circles',
      videoUrl: 'https://www.youtube.com/embed/O7JDKL-Vszg?autoplay=1',
      tips: 'Small circles first, then larger. Both directions!',
    },
    tricepDips: {
      caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 },
      description: 'Tricep Dips',
      videoUrl: 'https://www.youtube.com/embed/4qzUBwC9VlI?autoplay=1',
      tips: 'Use a chair or bench. Lower your body slowly.',
    },
  };

  const goals = {
    general: ['skipping', 'pushups', 'squats', 'mountainClimbers'],
    core: ['plank', 'sidePlank', 'mountainClimbers', 'crunches', 'bicycleCrunches', 'legRaises'],
    cardio: ['skipping', 'jumpingJacks', 'highKnees', 'burpees', 'jumpSquats'],
    strength: ['pushups', 'squats', 'gluteBridges', 'tricepDips', 'plank'],
    balance: ['balanceBoard', 'sidePlank', 'childsPose', 'downwardDog'],
    hiit: ['burpees', 'jumpSquats', 'jumpingJacks', 'mountainClimbers'],
  };

  const colors = {
    primary: '#1e40af',
    primaryLight: '#3b82f6',
    primaryDark: '#1e3a8a',
    light: '#eff6ff',
    lightBorder: '#dbeafe',
    text: '#0f172a',
    textSecondary: '#334155',
    success: '#059669',
    error: '#dc2626',
    warning: '#f59e0b',
  };

  const generatePlan = () => {
    const exercisesToUse = selectedGoal ? goals[selectedGoal] : selectedExercises.length > 0 ? selectedExercises : Object.keys(exercises).slice(0, 5);
    const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
    const plan = [];

    for (let set = 1; set <= sets; set++) {
      for (const ex of exercisesToUse) {
        plan.push({ exercise: ex, duration: 45, type: 'exercise', set, totalSets: sets });
      }
      if (set < sets) {
        plan.push({ type: 'rest', duration: 45 });
      }
    }

    setWorkoutPlan(plan);
    setWorkoutPlanGenerated(true);
    setCurrentIndex(0);
    setTimeLeft(plan[0]?.duration || 45);
  };

  const beginWorkout = () => {
    generatePlan();
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setIsRunning(true);
    speak('Starting workout. Get ready!');
  };

  const moveToNextExercise = () => {
    if (currentIndex < workoutPlan.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTimeLeft(workoutPlan[nextIndex].duration);
      const nextItem = workoutPlan[nextIndex];
      if (nextItem.type === 'exercise') {
        speak(`Next: ${exercises[nextItem.exercise].description}`);
      } else {
        speak('Rest time');
      }
    } else {
      setStage('results');
      setIsRunning(false);
      speak('Workout complete! Great job!');
    }
  };

  const speak = (text) => {
    if (synth.current) {
      synth.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      synth.current.speak(utterance);
    }
  };

  // HOME SCREEN
  if (stage === 'home') {
    return (
      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        fontFamily: '"Playfair Display", serif',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.light} 0%, #f0f9ff 100%)`,
      }}>
        <h1 style={{ fontSize: '4em', color: colors.primary, marginBottom: '10px', letterSpacing: '-1px' }}>FitPulse</h1>
        <p style={{ fontSize: '1.3em', color: colors.textSecondary, marginBottom: '50px', fontFamily: 'Lora, Georgia, serif' }}>Your Personal Fitness Coach</p>
        
        <button
          onClick={() => setStage('setup')}
          style={{
            padding: '16px 40px',
            fontSize: '1.2em',
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
            transition: 'all 0.3s ease',
            fontFamily: 'Lora, Georgia, serif',
          }}
          onMouseEnter={(e) => e.target.style.background = colors.primaryDark}
          onMouseLeave={(e) => e.target.style.background = colors.primary}
        >
          Start Workout <ChevronRight style={{ display: 'inline', marginLeft: '8px' }} />
        </button>
      </div>
    );
  }

  // SETUP SCREEN
  if (stage === 'setup') {
    return (
      <div style={{
        padding: '40px',
        fontFamily: 'Lora, Georgia, serif',
        maxWidth: '700px',
        margin: '0 auto',
        minHeight: '100vh',
        background: colors.light,
      }}>
        <h2 style={{ color: colors.primary, marginBottom: '30px', fontFamily: '"Playfair Display", serif', fontSize: '2.5em' }}>Configure Your Workout</h2>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text }}>Age Group:</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1em',
              border: `2px solid ${colors.lightBorder}`,
              borderRadius: '6px',
              background: 'white',
              color: colors.text,
              fontFamily: 'Lora, Georgia, serif',
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

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text }}>Fitness Level:</label>
          <select
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1em',
              border: `2px solid ${colors.lightBorder}`,
              borderRadius: '6px',
              background: 'white',
              color: colors.text,
              fontFamily: 'Lora, Georgia, serif',
            }}
          >
            <option value="light">Light</option>
            <option value="intermediate">Intermediate</option>
            <option value="vigorous">Vigorous</option>
          </select>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text }}>Duration: {duration} minutes</label>
          <input
            type="range"
            min="5"
            max="60"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ width: '100%', height: '8px', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: colors.text, fontSize: '1.1em' }}>Select a Goal:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.keys(goals).map((goal) => (
              <button
                key={goal}
                onClick={() => {
                  setSelectedGoal(goal);
                  setSelectedExercises([]);
                }}
                style={{
                  padding: '12px',
                  background: selectedGoal === goal ? colors.primary : 'white',
                  color: selectedGoal === goal ? 'white' : colors.text,
                  border: `2px solid ${selectedGoal === goal ? colors.primary : colors.lightBorder}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95em',
                  fontFamily: 'Lora, Georgia, serif',
                  transition: 'all 0.2s ease',
                }}
              >
                {goal === 'general' && '⭐ General'}
                {goal === 'core' && '💪 Core'}
                {goal === 'cardio' && '🏃 Cardio'}
                {goal === 'strength' && '💥 Strength'}
                {goal === 'balance' && '⚖️ Balance'}
                {goal === 'hiit' && '⚡ HIIT'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => beginWorkout()}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.1em',
            background: colors.success,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'Lora, Georgia, serif',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          📋 Prepare Workout
        </button>
      </div>
    );
  }

  // WORKOUT PREP SCREEN
  if (stage === 'setup' && workoutPlanGenerated && !workoutStarted) {
    return (
      <div style={{
        padding: '40px',
        fontFamily: 'Lora, Georgia, serif',
        maxWidth: '700px',
        margin: '0 auto',
        minHeight: '100vh',
        background: colors.light,
      }}>
        <h2 style={{ color: colors.primary, marginBottom: '30px', fontFamily: '"Playfair Display", serif', fontSize: '2.5em' }}>Your Workout Plan</h2>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', maxHeight: '400px', overflowY: 'auto' }}>
          {workoutPlan.map((item, idx) => (
            <div key={idx} style={{
              padding: '12px',
              borderBottom: `1px solid ${colors.lightBorder}`,
              color: item.type === 'rest' ? colors.textSecondary : colors.text,
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
            fontFamily: 'Lora, Georgia, serif',
          }}
        >
          🚀 Start Now
        </button>
      </div>
    );
  }

  // WORKOUT SCREEN
  if (stage === 'setup' && workoutStarted) {
    const current = workoutPlan[currentIndex];
    const exerciseData = current?.type === 'exercise' ? exercises[current.exercise] : null;
    const isRest = current?.type === 'rest';

    return (
      <div style={{
        padding: '40px',
        fontFamily: 'Lora, Georgia, serif',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${isRest ? '#f0fdf4' : colors.light} 0%, ${isRest ? '#dcfce7' : '#f0f9ff'} 100%)`,
        textAlign: 'center',
      }}>
        <h2 style={{
          color: colors.primary,
          marginBottom: '30px',
          fontFamily: '"Playfair Display", serif',
          fontSize: '2.5em',
        }}>
          {isRest ? '😤 Rest' : `💪 ${exerciseData?.description}`}
        </h2>

        <div style={{
          fontSize: '5em',
          color: isRest ? colors.success : colors.primary,
          marginBottom: '30px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}>
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </div>

        <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isRunning ? (
            <button
              onClick={() => {
                setIsRunning(true);
                setIsPaused(false);
                speak(isRest ? 'Rest time' : `Starting ${exerciseData?.description}`);
              }}
              style={{
                padding: '12px 24px',
                background: colors.success,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1em',
                fontFamily: 'Lora, Georgia, serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Play size={20} /> Play
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  padding: '12px 24px',
                  background: colors.warning,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  fontFamily: 'Lora, Georgia, serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Pause size={20} /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setWorkoutStarted(false);
                  setWorkoutPlanGenerated(false);
                  setStage('home');
                }}
                style={{
                  padding: '12px 24px',
                  background: colors.error,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  fontFamily: 'Lora, Georgia, serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <StopCircle size={20} /> Stop
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
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
            <p style={{ color: colors.text, fontSize: '1.1em', fontStyle: 'italic' }}>💡 {exerciseData.tips}</p>
          </div>
        )}

        {/* Exercise List Sidebar */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '30px',
          maxHeight: '200px',
          overflowY: 'auto',
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
              {item.type === 'exercise' ? `💪 ${exercises[item.exercise].description}` : '😤 Rest'}
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
        fontFamily: 'Lora, Georgia, serif',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.light} 0%, #f0fdf4 100%)`,
      }}>
        <h1 style={{ fontSize: '3.5em', color: colors.success, marginBottom: '20px', fontFamily: '"Playfair Display", serif' }}>🎉 Workout Complete!</h1>
        <p style={{ fontSize: '1.3em', color: colors.text, marginBottom: '30px' }}>Great job! You completed {workoutPlan.length} exercises.</p>
        <button
          onClick={() => {
            setStage('home');
            setWorkoutStarted(false);
            setWorkoutPlanGenerated(false);
          }}
          style={{
            padding: '14px 40px',
            fontSize: '1.1em',
            background: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'Lora, Georgia, serif',
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return null;
}
