// src/AuthButton.js

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings } from "lucide-react";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";
// Make sure this CSS is imported, either here or in your main index.js/App.js
import './HydeMusicPremium.css'; 

export default function AuthButton() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useUser();
  const { signOut, openSignIn } = useClerk();

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSignOut = () => {
    signOut();
    setIsProfileOpen(false);
  };

  return (
    <>
      <SignedOut>
        <button 
          className="auth-button-signin"
          onClick={() => openSignIn()}
        >
          Sign In
        </button>
      </SignedOut>

      <SignedIn>
        <div className="auth-button-container" ref={dropdownRef}>
          <button 
            className="auth-button-trigger"
            onClick={() => setIsProfileOpen(prev => !prev)}
          >
            <img src={user?.imageUrl} alt="Profile" className="auth-avatar" />
            {/* Use user.firstName for a cleaner look */}
            <span className="auth-name" style={{ color: '#FF6D00' }}>{user?.firstName || 'User'}</span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                className="profile-dropdown"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <div className="profile-dropdown-header">
                  <img src={user?.imageUrl} alt="Profile" className="auth-avatar" />
                  <div className="profile-dropdown-info">
                    <span className="profile-dropdown-name" style={{ color: '#FF6D00' }}>{user?.fullName}</span>
                    <span className="profile-dropdown-email" style={{ color: '#FF6D00' }}>
                      {user?.primaryEmailAddress.emailAddress}
                    </span>
                  </div>
                </div>
                {/* <button 
                className="profile-dropdown-item"
                style={{ color: '#FF6D00' }}
                onClick={() => window.location.href = "/Settings"}>
                    <Settings size={16} />
                    <span>Settings</span>
                </button> */}
                <button 
                  className="profile-dropdown-item"
                  style={{ color: '#FF6D00' }}
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SignedIn>
    </>
  );
}