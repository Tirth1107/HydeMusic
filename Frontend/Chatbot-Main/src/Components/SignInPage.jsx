import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes'; // Optional: Use if you have @clerk/themes installed
import './SignInPage.css'; // Make sure to create this file

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

        <div className="clerk-container">
          <SignIn
            appearance={{
              baseTheme: dark, // Remove this line if you don't have @clerk/themes
              variables: {
                colorPrimary: '#ff3e3e', // Matches your red accent
                colorText: 'white',
                colorBackground: 'rgba(255, 255, 255, 0.05)',
                colorInputBackground: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '12px',
              },
              elements: {
                card: "custom-clerk-card",
                headerTitle: "clerk-header-title",
                headerSubtitle: "clerk-header-subtitle",
                socialButtonsBlockButton: "clerk-social-btn",
                formButtonPrimary: "clerk-primary-btn",
                footerActionLink: "clerk-link"
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}