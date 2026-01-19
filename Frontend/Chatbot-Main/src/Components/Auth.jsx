import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import './SignInPage.css'; // Reuse existing styles or add new ones

export default function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) setError(error.message);
    };

    return (
        <div className="auth-form-container">
            <h2 className="auth-title">{isSignUp ? 'Join the Vibe' : 'Welcome Back'}</h2>
            <p className="auth-subtitle">
                {isSignUp ? 'Create an account to start listening' : 'Login to access your playlist'}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleAuth} className="auth-form">
                <div className="input-group">
                    <Mail size={18} className="input-icon" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth-input"
                    />
                </div>
                <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="auth-input"
                    />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <Loader className="animate-spin" /> : (isSignUp ? 'Sign Up' : 'Log In')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="auth-divider">
                <span>OR</span>
            </div>

            <button onClick={handleGoogleLogin} className="google-auth-btn">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
                Continue with Google
            </button>

            <div className="auth-footer">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle-btn">
                    {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
            </div>
        </div>
    );
}
