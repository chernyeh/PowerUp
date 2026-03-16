// Spotify OAuth callback handler
// This route handles the redirect from Spotify after user authorization.
// For the implicit grant flow, the token is in the URL hash (client-side).
// This page simply redirects to the home page so the client JS can extract the token.

import { NextResponse } from 'next/server';

export async function GET(request) {
  // For implicit grant flow, Spotify appends the token as a hash fragment.
  // Hash fragments are NOT sent to the server, so we redirect to the homepage
  // where client-side JS (extractTokenFromHash) picks it up.
  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}
