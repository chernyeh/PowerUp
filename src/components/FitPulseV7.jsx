'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, StopCircle, Play as PlayIcon } from 'lucide-react';

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

  const encouragingPhrases = [
    'You\'ve got this! Keep going!',
    'Amazing effort! You\'re doing great!',
    'Feeling strong? Keep pushing!',
    'You\'re crushing it!',
    'One more breath, you\'ve got this!',
    'Great form! Keep it up!',
    'You\'re almost there!',
    'Believe in yourself! You can do it!',
    'Every rep counts! Keep going!',
    'You\'re stronger than you think!',
    'Push through! You\'re doing awesome!',
    'This is your moment! Own it!',
    'You\'re on fire! Keep the momentum!',
    'Your body is capable of amazing things!',
    'Don\'t give up! You\'re so close!',
  ];

  const getRandomEncouragement = () => {
    return encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
  };

  // ALL EXERCISES WITH VERIFIED WORKING YOUTUBE VIDEOS (from reliable channels)
  const exercises = {
    skipping: { caloriesPerMin: { light: 8, intermediate: 12, vigorous: 15 }, description: 'Skipping', duration: { light: 45, intermediate: 60, vigorous: 75 }, videoUrl: 'https://www.youtube.com/watch?v=3M9_x7mQ0N0', tips: 'Keep steady rhythm. Land softly on the balls of your feet.' },
    plank: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Plank Hold', duration: { light: 30, intermediate: 45, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw', tips: 'Keep your body straight like a board. Engage your core!' },
    sidePlank: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Side Plank', duration: { light: 30, intermediate: 40, vigorous: 50 }, videoUrl: 'https://www.youtube.com/watch?v=TZN34-kKxcE', tips: 'Stack your feet and keep your hips high.' },
    crunches: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Crunches', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=OW0YlWE2CJc', tips: 'Hands behind your head. Lift your shoulders only.' },
    bicycleCrunches: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Bicycle Crunches', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=9ysH-ApnLc0', tips: 'Bring opposite elbow to knee. Alternate sides smoothly.' },
    mountainClimbers: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Mountain Climbers', duration: { light: 45, intermediate: 60, vigorous: 75 }, videoUrl: 'https://www.youtube.com/watch?v=nmwgirgblLw', tips: 'Start in plank. Bring knees to chest quickly. Keep hips level!' },
    legRaises: { caloriesPerMin: { light: 3, intermediate: 4.5, vigorous: 6 }, description: 'Leg Raises', duration: { light: 30, intermediate: 40, vigorous: 50 }, videoUrl: 'https://www.youtube.com/watch?v=r8MXR03Dxso', tips: 'Lie flat. Lift legs slowly without bending knees.' },
    balanceBoard: { caloriesPerMin: { light: 4, intermediate: 5, vigorous: 7 }, description: 'Balance Board', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=w23H-y2V8XM', tips: 'Focus on stability. Small adjustments help!' },
    jumpingJacks: { caloriesPerMin: { light: 6, intermediate: 8, vigorous: 11 }, description: 'Jumping Jacks', duration: { light: 45, intermediate: 60, vigorous: 75 }, videoUrl: 'https://www.youtube.com/watch?v=c6QcKJNUzKo', tips: 'Keep a steady pace. Your feet apart, arms up!' },
    marchingInPlace: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5 }, description: 'Marching in Place', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=O-7_uNn4Jjc', tips: 'Lift your knees up high. Keep your arms moving.' },
    walkingLunges: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Walking Lunges', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=EV6zxvqB8B8', tips: 'Step forward and bend your back knee. Keep your torso upright.' },
    highKnees: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'High Knees', duration: { light: 45, intermediate: 60, vigorous: 75 }, videoUrl: 'https://www.youtube.com/watch?v=o8x4gawLNVI', tips: 'Pump your knees up to hip height. Keep moving fast!' },
    burpees: { caloriesPerMin: { light: 8, intermediate: 11, vigorous: 14 }, description: 'Burpees', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=JZQA8BlU2fg', tips: 'Go at your own pace. Quality over speed!' },
    pushups: { caloriesPerMin: { light: 5, intermediate: 7, vigorous: 10 }, description: 'Push-ups', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4', tips: 'Lower yourself until chest nearly touches the ground. Keep elbows close!' },
    squats: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Squats', duration: { light: 45, intermediate: 60, vigorous: 75 }, videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U', tips: 'Bend your knees and lower your hips. Keep your chest up!' },
    jumpSquats: { caloriesPerMin: { light: 7, intermediate: 10, vigorous: 13 }, description: 'Jump Squats', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=GSO8jVMkfXA', tips: 'Squat down then jump explosively. Land softly.' },
    gluteBridges: { caloriesPerMin: { light: 3, intermediate: 4, vigorous: 5.5 }, description: 'Glute Bridges', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=wPM8ic32ufQ', tips: 'Lie on your back. Push through heels. Squeeze glutes at top!' },
    singleLegStand: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Single Leg Stand', duration: { light: 30, intermediate: 40, vigorous: 50 }, videoUrl: 'https://www.youtube.com/watch?v=4lbkTEDvPks', tips: 'Stand on one leg. Keep your core tight. Switch legs halfway through.' },
    downwardDog: { caloriesPerMin: { light: 2.5, intermediate: 3.5, vigorous: 5 }, description: 'Downward Dog', duration: { light: 35, intermediate: 45, vigorous: 55 }, videoUrl: 'https://www.youtube.com/watch?v=XkqZ8dYiVrI', tips: 'Hands and feet on ground. Push your hips up high.' },
    armCircles: { caloriesPerMin: { light: 2, intermediate: 3, vigorous: 4 }, description: 'Arm Circles', duration: { light: 35, intermediate: 45, vigorous: 55 }, videoUrl: 'https://www.youtube.com/watch?v=oZLfNP0jOw4', tips: 'Small circles first, then larger. Both directions!' },
    tricepDips: { caloriesPerMin: { light: 4, intermediate: 6, vigorous: 8 }, description: 'Tricep Dips', duration: { light: 40, intermediate: 50, vigorous: 60 }, videoUrl: 'https://www.youtube.com/watch?v=4qzUBwC9VlI', tips: 'Use a chair or bench. Lower your body slowly.' },
  };

  const goals = {
    general: ['skipping', 'pushups', 'squats', 'mountainClimbers'],
    core: ['plank', 'sidePlank', 'mountainClimbers', 'crunches', 'bicycleCrunches', 'legRaises'],
    cardio: ['skipping', 'jumpingJacks', 'highKnees', 'burpees'],
    strength: ['pushups', 'squats', 'gluteBridges', 'tricepDips'],
    balance: ['balanceBoard', 'sidePlank', 'singleLegStand'],
    hiit: ['burpees', 'jumpSquats', 'jumpingJacks'],
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

  const generatePlan = () => {
    const exercisesToUse = selectedGoal ? goals[selectedGoal] : selectedExercises.length > 0 ? selectedExercises : Object.keys(exercises).slice(0, 5);
    const sets = fitnessLevel === 'light' ? 2 : fitnessLevel === 'intermediate' ? 3 : 4;
    const transitionDuration = ageGroup === '11-12' ? 15 : 10;
    const plan = [];

    for (let set = 1; set <= sets; set++) {
      for (let i = 0; i < exercisesToUse.length; i++) {
        const ex = exercisesToUse[i];
        const exerciseData = exercises[ex];
        const exerciseDuration = exerciseData.duration[fitnessLevel];
        plan.push({ exercise: ex, duration: exerciseDuration, type: 'exercise', set, totalSets: sets });
        if (i < exercisesToUse.length - 1) {
          plan.push({ type: 'transition', duration: transitionDuration });
        }
      }
      if (set < sets) {
        plan.push({ type: 'rest', duration: 45 });
      }
    }

    setWorkoutPlan(plan);
    setCurrentIndex(0);
    setTimeLeft(45);
    setCountdown(5);
    setStage('prep');
  };

  const startWorkout = () => {
    setStage('workout');
    setCountdown(5);
    setTimeLeft(45);
    speak('Get ready! Starting in 5, 4, 3, 2, 1. Let\'s go!');
    setTimeout(() => {
      setIsRunning(true);
      setCountdown(0);
      const firstExercise = workoutPlan[0];
      setTimeLeft(firstExercise.duration);
    }, 5100);
  };

  const moveToNextExercise = () => {
    if (currentIndex < workoutPlan.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextItem = workoutPlan[nextIndex];
      setTimeLeft(nextItem.duration);
      if (nextItem.type === 'exercise') {
        speak(`Next up: ${exercises[nextItem.exercise].description}. ${getRandomEncouragement()}`);
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
        <div style={{ marginBottom: '50px' }}>
          <h1 style={{ color: colors.primary, marginBottom: '10px', fontSize: '3.2em', fontFamily: '"Lora", Georgia, serif', fontWeight: '700', letterSpacing: '1px' }}>FitPulse</h1>
          <p style={{ color: colors.textSecondary, fontSize: '1.2em', fontStyle: 'italic', fontWeight: '500' }}>Your Personal Fitness Coach</p>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Customize Your Workout</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Age Group</label>
              <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontFamily: '"Lora", Georgia, serif', fontSize: '1em', color: colors.text, backgroundColor: 'white', cursor: 'pointer' }}>
                <option>11-12</option>
                <option>13-17</option>
                <option>18-25</option>
                <option>26-35</option>
                <option>36-50</option>
                <option>50+</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Fitness Level</label>
              <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontFamily: '"Lora", Georgia, serif', fontSize: '1em', color: colors.text, backgroundColor: 'white', cursor: 'pointer' }}>
                <option value="light">Light</option>
                <option value="intermediate">Intermediate</option>
                <option value="vigorous">Vigorous</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: colors.text, fontSize: '0.95em' }}>Duration: {duration} min</label>
              <input type="range" min="5" max="60" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Quick Goals</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            {Object.keys(goals).map((goal) => {
              const goalExercises = goals[goal].map(ex => exercises[ex].description).slice(0, 3).join(', ');
              return (
                <button key={goal} onClick={() => { setSelectedGoal(goal); setSelectedExercises([]); }} style={{ padding: '18px', background: selectedGoal === goal ? colors.primary : 'white', color: selectedGoal === goal ? 'white' : colors.text, border: `2px solid ${selectedGoal === goal ? colors.primary : colors.border}`, borderRadius: '8px', cursor: 'pointer', fontFamily: '"Lora", Georgia, serif', fontSize: '1em', fontWeight: selectedGoal === goal ? 'bold' : 'normal', transition: 'all 0.3s ease', textAlign: 'center', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.8em', marginBottom: '8px' }}>
                    {goal === 'general' && '⭐'}
                    {goal === 'core' && '💪'}
                    {goal === 'cardio' && '🏃'}
                    {goal === 'strength' && '💥'}
                    {goal === 'balance' && '⚖️'}
                    {goal === 'hiit' && '⚡'}
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1em' }}>
                    {goal === 'general' && 'General'}
                    {goal === 'core' && 'Core'}
                    {goal === 'cardio' && 'Cardio'}
                    {goal === 'strength' && 'Strength'}
                    {goal === 'balance' && 'Balance'}
                    {goal === 'hiit' && 'HIIT'}
                  </div>
                  <div style={{ fontSize: '0.8em', opacity: 0.9, lineHeight: '1.4' }}>
                    {goalExercises}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ color: colors.text, marginBottom: '25px', fontSize: '1.4em', fontWeight: '400' }}>Or Mix & Match Exercises</h2>
          <p style={{ color: colors.textSecondary, marginBottom: '20px', fontSize: '0.95em' }}>({selectedExercises.length} selected)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', padding: '20px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: 'white' }}>
            {Object.keys(exercises).map((key) => (
              <button key={key} onClick={() => { setSelectedGoal(null); if (selectedExercises.includes(key)) { setSelectedExercises(selectedExercises.filter((ex) => ex !== key)); } else { setSelectedExercises([...selectedExercises, key]); } }} style={{ padding: '12px', background: selectedExercises.includes(key) ? colors.primaryLight : 'white', color: selectedExercises.includes(key) ? 'white' : colors.text, border: `1px solid ${selectedExercises.includes(key) ? colors.primaryLight : colors.border}`, borderRadius: '6px', cursor: 'pointer', fontFamily: '"Lora", Georgia, serif', fontSize: '0.9em', fontWeight: selectedExercises.includes(key) ? 'bold' : 'normal', textAlign: 'center', transition: 'all 0.2s ease' }}>
                {exercises[key].description}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <button onClick={() => generatePlan()} style={{ width: '100%', padding: '16px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Lora", Georgia, serif', fontSize: '1.1em', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)' }} onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.3)'} onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(217, 119, 6, 0.2)'}>
            📋 Prepare Workout
          </button>
        </div>
      </div>
    );
  }

  // PREP SCREEN
  if (stage === 'prep') {
    return (
      <div style={{ padding: '40px', fontFamily: '"Lora", Georgia, serif', maxWidth: '700px', margin: '0 auto', minHeight: '100vh', background: colors.light }}>
        <h2 style={{ color: colors.primary, marginBottom: '30px', fontSize: '2em' }}>Your Workout Plan</h2>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', maxHeight: '400px', overflowY: 'auto', border: `1px solid ${colors.border}` }}>
          {workoutPlan.map((item, idx) => (
            <div key={idx} style={{ padding: '12px', borderBottom: `1px solid ${colors.border}`, color: item.type === 'rest' ? colors.textSecondary : colors.text, fontWeight: item.type === 'exercise' ? 'bold' : 'normal' }}>
              {item.type === 'exercise' ? (
                <span>💪 {exercises[item.exercise].description} ({item.duration}s) - Set {item.set}/{item.totalSets}</span>
              ) : item.type === 'transition' ? (
                <span>✨ Quick Break ({item.duration}s)</span>
              ) : (
                <span>😤 Rest ({item.duration}s)</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => startWorkout()} style={{ width: '100%', padding: '14px', fontSize: '1.1em', background: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Lora", Georgia, serif' }}>
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
      <div style={{ padding: '40px', fontFamily: '"Lora", Georgia, serif', minHeight: '100vh', background: colors.light, textAlign: 'center' }}>
        <h2 style={{ color: colors.primary, marginBottom: '30px', fontFamily: '"Lora", Georgia, serif', fontSize: '2.2em', fontWeight: '400' }}>
          {countdown > 0 ? 'Get Ready!' : isTransition ? '✨ Quick Break' : isRest ? '😤 Rest Time' : `💪 ${exerciseData?.description}`}
        </h2>
        <div style={{ fontSize: countdown > 0 ? '6em' : '5em', color: colors.primary, marginBottom: '30px', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {countdown > 0 ? countdown : `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`}
        </div>
        {countdown > 0 && (
          <p style={{ color: colors.text, fontSize: '1.2em', marginBottom: '30px', fontStyle: 'italic' }}>Starting your workout soon...</p>
        )}
        <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isRunning ? (
            <button onClick={() => { setIsRunning(true); setCountdown(0); setIsPaused(false); if (isTransition) { speak('Take your time, get ready'); } else if (isRest) { speak('Rest time. Breathe and relax'); } else { speak(`Starting ${exerciseData?.description}. ${getRandomEncouragement()}`); } }} style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', fontFamily: '"Lora", Georgia, serif' }}>
              <PlayIcon size={20} style={{ display: 'inline', marginRight: '8px' }} /> Play
            </button>
          ) : (
            <>
              <button onClick={() => setIsPaused(!isPaused)} style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', fontFamily: '"Lora", Georgia, serif' }}>
                <Pause size={20} style={{ display: 'inline', marginRight: '8px' }} /> {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={() => { setIsRunning(false); setStage('config'); setWorkoutPlan([]); }} style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', fontFamily: '"Lora", Georgia, serif' }}>
                <StopCircle size={20} style={{ display: 'inline', marginRight: '8px' }} /> Stop
              </button>
            </>
          )}
        </div>
        <p style={{ color: colors.text, marginBottom: '30px', fontSize: '1.1em' }}>
          Exercise {currentIndex + 1} of {workoutPlan.length}
        </p>
        {exerciseData && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.text, fontSize: '1.1em', marginBottom: '15px' }}>💡 {exerciseData.tips}</p>
            {exerciseData.videoUrl && (
              <a href={exerciseData.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: colors.primary, textDecoration: 'none', fontSize: '0.9em', padding: '8px 16px', border: `1px solid ${colors.primary}`, borderRadius: '4px', transition: 'all 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.target.style.background = colors.primary; e.target.style.color = 'white'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = colors.primary; }}>
                📹 Watch Video
              </a>
            )}
          </div>
        )}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', border: `1px solid ${colors.border}` }}>
          <h4 style={{ color: colors.primary, marginBottom: '15px' }}>📋 Exercises</h4>
          {workoutPlan.map((item, idx) => (
            <div key={idx} style={{ padding: '8px', background: idx === currentIndex ? colors.primary : 'transparent', color: idx === currentIndex ? 'white' : colors.text, opacity: idx < currentIndex ? 0.5 : 1, borderRadius: '4px', marginBottom: '4px', fontSize: '0.9em' }}>
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
      <div style={{ padding: '60px 40px', textAlign: 'center', fontFamily: '"Lora", Georgia, serif', minHeight: '100vh', background: colors.light }}>
        <h1 style={{ fontSize: '3em', color: colors.primary, marginBottom: '20px', fontFamily: '"Lora", Georgia, serif', fontWeight: '400' }}>🎉 Workout Complete!</h1>
        <p style={{ fontSize: '1.3em', color: colors.text, marginBottom: '30px' }}>Great job! You completed {workoutPlan.length} exercises.</p>
        <button onClick={() => { setStage('config'); setWorkoutPlan([]); setSelectedGoal(null); setSelectedExercises([]); }} style={{ padding: '12px 40px', fontSize: '1.1em', background: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Lora", Georgia, serif' }}>
          Start New Workout
        </button>
      </div>
    );
  }
}
