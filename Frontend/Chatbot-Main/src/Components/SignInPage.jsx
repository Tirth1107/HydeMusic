import React from 'react';
import Auth from './Auth';
import './SignInPage.css';

export default function SignInPage() {
  return (
    <div className="signin-wrapper">
      {/* Background visual elements */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <div className="signin-content">
        <div className="brand-header">
          <h1 className="brand-title">
            Hyde Music <span className="beta-tag">BETA</span>
          </h1>
          <p className="brand-subtitle">
            Open source streaming powered by <span className="hyde-org">Hyde Organization</span>
          </p>
        </div>

        <div className="clerk-container"> {/* Keep class for layout but using Auth component */}
          <Auth />
        </div>
      </div>
    </div>
  );
}