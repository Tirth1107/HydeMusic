import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="signin-page" align="center">
      <h1 style={{ textAlign: "center" }}>Hyde Music Beta Testing Version</h1>
      <h4 style={{ textAlign: "center" }}>Sign in to continue</h4>
      <h5 style={{ color: "yellow" }}>Hyde Music is an open source music streaming platform under <span style={{color: "red"}}>Hyde Organization</span></h5>
      <div className="signin-container">
        <div className="clerk-signin" align="center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "signin-root",
                card: "signin-clerk-card",
                headerTitle: "signin-title",
                headerSubtitle: "signin-subtitle",
                socialButtonsBlockButton: "signin-social-btn",
                formButtonPrimary: "signin-primary-btn",
                footerActionLink: "signin-link"
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}
