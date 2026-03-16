# FitPulse v2 — Personal AI Fitness Coach

A production-ready Next.js fitness app with voice coaching, countdown timers, calorie tracking, workout history, exercise video demos, and Spotify integration.

## Quick Start

```bash
cd fitpulse
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Spotify Setup (optional)

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create an app called "FitPulse"
3. Add redirect URI: `http://localhost:3000/api/spotify/callback`
4. Copy `.env.local.example` to `.env.local` and fill in your Client ID:

```bash
cp .env.local.example .env.local
```

## Deploy to Vercel

```bash
npx vercel
```

Set environment variables in Vercel dashboard and update Spotify redirect URI to your production URL.

## Project Structure

```
src/
  app/
    page.js              # Main app (all stages: home, setup, config, workout, results, history, demos)
    layout.js            # Root layout with metadata
    globals.css          # Tailwind + custom styles
    api/spotify/callback # Spotify OAuth redirect handler
  lib/
    exercises.js         # Exercise definitions, goals, motivational messages
    workout.js           # Plan generation, calorie calculations
    storage.js           # localStorage persistence for workout history
    spotify.js           # Spotify OAuth + playback API
  hooks/
    useVoice.js          # Web Speech API hook for voice guidance
    useTimer.js          # Countdown timer hook with callbacks
```

## Features

- Age range, fitness level, and duration selection
- 4 preset goals (General Fitness, Core, Cardio, Balance) or custom exercise picking
- Smart calorie targets based on profile
- Real-time countdown timer with voice coaching
- Motivational messages throughout workout
- Persistent workout history with replay and CSV export
- YouTube exercise demo videos with form tips
- Spotify music integration via OAuth
- Fully responsive (mobile + desktop)
