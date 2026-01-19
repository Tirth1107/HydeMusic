import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";
import './HydeMusicPremium.css';

export default function AuthButton() {
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
  };

  if (!user) return null;

  return (
    <div className="auth-button-container" ref={dropdownRef}>
      <button
        className="auth-button-trigger"
        onClick={() => setIsProfileOpen(prev => !prev)}
      >
        <img
          src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.email}
          alt="Profile"
          className="auth-avatar"
        />
        <span className="auth-name" style={{ color: '#FF6D00' }}>
          {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
        </span>
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
              <img
                src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.email}
                alt="Profile"
                className="auth-avatar"
              />
              <div className="profile-dropdown-info">
                <span className="profile-dropdown-name" style={{ color: '#FF6D00' }}>
                  {user.user_metadata?.full_name || 'User'}
                </span>
                <span className="profile-dropdown-email" style={{ color: '#FF6D00' }}>
                  {user.email}
                </span>
              </div>
            </div>
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
  );
}