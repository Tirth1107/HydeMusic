import React from 'react'
import { useAuth } from '@clerk/clerk-react'
import './App.css'
import ChatPage from './Components/Chat'
import SignInPage from './Components/SignInPage'

function App() {
  const { isSignedIn, isLoaded } = useAuth()

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // If not signed in, show sign-in page
  if (!isSignedIn) {
    return <SignInPage />
  }

  return (
    <div className="App">
      <ChatPage />
    </div>
  )
}

export default App
