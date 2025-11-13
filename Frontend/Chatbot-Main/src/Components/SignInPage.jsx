import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Bot, Sparkles, Shield, Zap } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="signin-page">
      <div className="signin-container">
        {/* Left Side - Branding */}
        <div className="signin-brand">
          <div className="brand-header">
            <div className="brand-logo">
              <Bot className="brand-icon" />
            </div>
            <h1 className="brand-title">VibeEra</h1>
            <p className="brand-subtitle">Your intelligent conversation partner</p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <Sparkles className="feature-icon" />
              <div className="feature-content">
                <h3>Smart Conversations</h3>
                <p>Engage in natural, intelligent discussions with advanced AI</p>
              </div>
            </div>
            
            <div className="feature-item">
              <Shield className="feature-icon" />
              <div className="feature-content">
                <h3>Secure & Private</h3>
                <p>Your conversations are protected with enterprise-grade security</p>
              </div>
            </div>
            
            <div className="feature-item">
              <Zap className="feature-icon" />
              <div className="feature-content">
                <h3>Lightning Fast</h3>
                <p>Get instant responses powered by cutting-edge AI technology</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="signin-form">
          <div className="signin-card">
            <div className="signin-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue your AI conversations</p>
            </div>
            
            <div className="clerk-signin">
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
      </div>
    </div>
  );
}
