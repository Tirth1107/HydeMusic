import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import './App.css'
import MusicPage from './Components/Music'
import SignInPage from './Components/SignInPage'

const funnyMessages = [
  "Dropping the beat... 🎧",
  "Charging the bass... 🔊",
  "Tuning the vibe... ✨",
  "Setting the stage... 🎤",
  "Loading the red magic... 🔴",
  "Waking up the drummer... 🥁",
  "Fixing the reverb... 🎸",
  "Perfecting the playlist... 🎶"
]

function App() {
  const { isSignedIn, isLoaded } = useAuth()
  const [isAppReady, setIsAppReady] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(funnyMessages[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => {
        let nextIndex
        do {
          nextIndex = Math.floor(Math.random() * funnyMessages.length)
        } while (funnyMessages[nextIndex] === prev)
        return funnyMessages[nextIndex]
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setIsAppReady(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isLoaded])

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Initializing Hyde Music...</p>
      </div>
    )
  }

  if (!isAppReady) {
    return (
      <div className="loading-container premium">
        <div className="loading-spinner premium"></div>
        <p className="loading-text premium animate-fade">{currentMessage}</p>
        <div className="music-bars">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <SignInPage />
  }

  return (
    <div className="App dark-theme">
      <MusicPage />
    </div>
  )
}

export default App