import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import MusicPage from './Components/Music';
import SignInPage from './Components/SignInPage';
import './App.css';

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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(funnyMessages[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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


  // Unified Loading Screen
  if (loading) {
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
  if (!loading && !session) {
    return <SignInPage />;
  }

  return (
    <div className="App dark-theme">
      {/* Pass session to MusicPage */}
      <MusicPage key={session?.user.id} session={session} />
    </div>
  );
}

export default App;