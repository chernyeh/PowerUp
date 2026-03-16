import './globals.css';

export const metadata = {
  title: 'FitPulse — Personal AI Fitness Coach',
  description: 'Smart workout planner with voice guidance, countdown timers, calorie tracking, and Spotify integration.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
