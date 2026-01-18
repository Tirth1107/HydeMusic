import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './App.css';
import MusicPage from './Components/Music';
import SignInPage from './Components/SignInPage';

const funnyMessages = [
  "Dropping the beat... 🎧",
  "Charging the bass... 🔊",
  "Tuning the vibe... ✨",
  "Setting the stage... 🎤",
  "Loading the red magic... 🔴",
  "Waking up the drummer... 🥁",
  "Fixing the reverb... 🎸",
  "Perfecting the playlist... 🎶"
];

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(funnyMessages[0]);
  const [fade, setFade] = useState(true); // For smooth text transitions

  // Handle message rotation with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Fade out
      setTimeout(() => {
        setCurrentMessage(prev => {
          let nextIndex;
          do {
            nextIndex = Math.floor(Math.random() * funnyMessages.length);
          } while (funnyMessages[nextIndex] === prev);
          return funnyMessages[nextIndex];
        });
        setFade(true); // Fade in
      }, 500); // Wait for fade out to finish
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Handle artificial loading delay for "premium feel"
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setIsAppReady(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Unified Loading Screen
  if (!isLoaded || !isAppReady) {
    return (
      <div className="app-loading-container">
        {/* Ambient Background Glows (Consistent with SignIn) */}
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>

        <div className="loading-content">
          <h1 className="loading-logo">Hyde Music</h1>
          
          {/* Custom Audio Wave Loader */}
          <div className="audio-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>

          <p className={`loading-text ${fade ? 'fade-in' : 'fade-out'}`}>
            {currentMessage}
          </p>
        </div>
      </div>
    );
  }

  // Main App Logic
  if (!isSignedIn) {
    return <SignInPage />;
  }

  return (
    <div className="App dark-theme">
      <MusicPage />
    </div>
  );
}

export default App;