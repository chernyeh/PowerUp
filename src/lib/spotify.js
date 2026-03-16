// Spotify API integration utilities
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
];

const TOKEN_KEY = 'fitpulse_spotify_token';
const TOKEN_EXPIRY_KEY = 'fitpulse_spotify_expiry';

export function getSpotifyAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
    || `${window.location.origin}/api/spotify/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    show_dialog: 'false',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token;
  }
  // Token expired, clean up
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  return null;
}

export function storeToken(token, expiresIn = 3600) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function extractTokenFromHash() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const token = params.get('access_token');
  const expiresIn = parseInt(params.get('expires_in') || '3600');

  if (token) {
    storeToken(token, expiresIn);
    // Clean up URL
    window.history.replaceState(null, '', window.location.pathname);
    return token;
  }
  return null;
}

export async function searchTracks(token, query, limit = 5) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.tracks?.items || [];
}

export async function getDevices(token) {
  const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get devices');
  const data = await res.json();
  return data.devices || [];
}

export async function playTrack(token, trackUri, deviceId) {
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
}

export async function pausePlayback(token) {
  await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function startWorkoutMusic(token) {
  try {
    const tracks = await searchTracks(token, 'workout motivation energy', 10);
    if (tracks.length === 0) return;

    const devices = await getDevices(token);
    const device = devices.find(d => d.is_active) || devices[0];
    if (!device) return;

    // Play a random workout track
    const track = tracks[Math.floor(Math.random() * tracks.length)];
    await playTrack(token, track.uri, device.id);
    return track;
  } catch (err) {
    console.error('Spotify playback error:', err);
    return null;
  }
}
