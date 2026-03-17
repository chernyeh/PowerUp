// src/lib/spotify.js
// Spotify API integration for music playback during workouts

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
];

export const initiateSpotifyAuth = (clientId, redirectUri) => {
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', SPOTIFY_SCOPES.join(' '));
  authUrl.searchParams.append('show_dialog', 'true');
  return authUrl.toString();
};

export const extractTokenFromUrl = () => {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash;
  if (!hash) return null;
  
  const params = new URLSearchParams(hash.substring(1));
  const token = params.get('access_token');
  
  if (token) {
    window.location.hash = ''; // Clean URL
  }
  
  return token;
};

export const searchTrack = async (query, accessToken) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    if (!response.ok) {
      throw new Error('Spotify search failed');
    }
    
    const data = await response.json();
    return data.tracks?.items?.[0];
  } catch (error) {
    console.error('❌ Spotify search error:', error);
    return null;
  }
};

export const getAvailableDevices = async (accessToken) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }
    
    const data = await response.json();
    return data.devices || [];
  } catch (error) {
    console.error('❌ Spotify devices error:', error);
    return [];
  }
};

export const startPlayback = async (accessToken, deviceId, trackUri) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [trackUri] }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Playback failed');
    }
    
    console.log('✅ Spotify playback started');
    return true;
  } catch (error) {
    console.error('❌ Spotify playback error:', error);
    return false;
  }
};

export const pausePlayback = async (accessToken, deviceId) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('❌ Spotify pause error:', error);
    return false;
  }
};

export const playSpotifyTrack = async (query, accessToken) => {
  try {
    // 1. Search for track
    const track = await searchTrack(query, accessToken);
    if (!track) {
      console.error('❌ No track found for:', query);
      return null;
    }
    
    // 2. Get available devices
    const devices = await getAvailableDevices(accessToken);
    if (devices.length === 0) {
      console.error('❌ No Spotify devices found. Open Spotify on another device.');
      return null;
    }
    
    // 3. Get first active device or use the first available
    const activeDevice = devices.find((d) => d.is_active) || devices[0];
    if (!activeDevice) {
      console.error('❌ No active Spotify device');
      return null;
    }
    
    // 4. Start playback
    const success = await startPlayback(accessToken, activeDevice.id, track.uri);
    
    if (success) {
      console.log(`🎵 Now playing: ${track.name} by ${track.artists[0]?.name}`);
      return {
        trackId: track.id,
        trackName: track.name,
        artist: track.artists[0]?.name,
        deviceId: activeDevice.id,
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error playing track:', error);
    return null;
  }
};

// Validate token freshness
export const isTokenValid = (token) => {
  if (!token) return false;
  // Tokens are valid for 1 hour, simple check
  const tokenTime = localStorage.getItem('spotify_token_time');
  if (!tokenTime) return true; // Assume valid if no time stored
  
  const elapsed = Date.now() - parseInt(tokenTime);
  const oneHour = 60 * 60 * 1000;
  
  return elapsed < oneHour;
};

// Store token with timestamp
export const storeSpotifyToken = (token) => {
  localStorage.setItem('spotify_token', token);
  localStorage.setItem('spotify_token_time', Date.now().toString());
};

// Get stored token if still valid
export const getStoredSpotifyToken = () => {
  const token = localStorage.getItem('spotify_token');
  if (token && isTokenValid(token)) {
    return token;
  }
  // Clear if expired
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_token_time');
  return null;
};
