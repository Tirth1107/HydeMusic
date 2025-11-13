import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { LogOut, User } from 'lucide-react';

export default function AuthButton() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="auth-button">
      {user && (
        <div className="user-info">
          <div className="user-avatar">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt="User avatar" className="avatar-img" />
            ) : (
              <User className="icon" />
            )}
          </div>
          <span className="user-name">{user.firstName || user.emailAddresses[0]?.emailAddress}</span>
        </div>
      )}
      <button 
        onClick={handleSignOut}
        className="btn btn--ghost"
        title="Sign out"
      >
        <LogOut className="icon" />
        Sign Out
      </button>
    </div>
  );
}
