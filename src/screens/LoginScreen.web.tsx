import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import { useToastStore } from '../store/toastStore';
import { getTestProps } from '../utils/react-native-web-polyfills';

type AuthMode = 'signin' | 'signup';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn, signUp, isLoading } = useAuthStore();
  const { showToast } = useToastStore();
  
  // * Form state
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  
  // Validation
  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Enter a valid email');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  // * Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    try {
      let result;
      
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
      }
      
      if (result.success) {
        if (mode === 'signup') {
          showToast({
            type: 'success',
            title: 'Account Created!',
            message: 'Please check your email to verify your account. You can start using the app right away.',
          });
        }
        navigation.navigate('Projects' as never);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    }
  };
  
  
  // * Switch between sign in and sign up
  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };
  
  // ! SECURITY: * Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setError('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      const { error } = await authService.resetPassword(forgotPasswordEmail);
      
      if (error) {
        setError(error.message);
        showToast({
          type: 'error',
          title: 'Password Reset Failed',
          message: error.message,
        });
      } else {
        setForgotPasswordSent(true);
        showToast({
          type: 'success',
          title: 'Password Reset Email Sent',
          message: 'Check your email for instructions to reset your password.',
        });
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordSent(false);
          setForgotPasswordEmail('');
        }, 3000);
      }
    } catch {
      setError('An error occurred. Please try again.');
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to send password reset email. Please try again.',
      });
    }
  };
  
  return (
    <div {...getTestProps('login-page')} className="min-h-screen bg-parchment-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-cinzel font-medium bg-gradient-to-r from-metals-gold to-metals-copper bg-clip-text text-transparent">
            Fantasy Element Builder
          </h1>
          <p className="text-ink-secondary mt-2">Build Your Fictional Worlds</p>
        </div>
        
        {/* Auth Card */}
        <div className="bg-parchment-300 border border-parchment-400 rounded-lg p-8">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-parchment-200/50 rounded-lg p-1">
            <button
              {...getTestProps('signin-tab')}
              onClick={() => mode !== 'signin' && switchMode()}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-parchment-400 text-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Sign In
            </button>
            <button
              {...getTestProps('signup-link')}
              onClick={() => mode !== 'signup' && switchMode()}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-parchment-400 text-ink-primary'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div {...getTestProps('login-error')} className="mb-4 p-3 bg-dragonfire-100/20 border border-dragonfire-700/50 rounded-lg flex items-center text-dragonfire text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-secondary mb-1">
                Email
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="email"
                  {...getTestProps('email-input')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-parchment-200 border border-parchment-400 rounded-lg focus:border-metals-gold focus:outline-none focus:ring-1 focus:ring-metals-gold text-ink-primary placeholder-ink-secondary"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error && error.toLowerCase().includes('email') && (
                <div {...getTestProps('email-error')} className="text-xs text-dragonfire mt-1">{error}</div>
              )}
            </div>
            
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  {...getTestProps('password-input')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-parchment-200 border border-parchment-400 rounded-lg focus:border-metals-gold focus:outline-none focus:ring-1 focus:ring-metals-gold text-ink-primary placeholder-ink-secondary"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && error.toLowerCase().includes('password') && (
                <div {...getTestProps('password-error')} className="text-xs text-dragonfire mt-1">{error}</div>
              )}
            </div>
            
            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-secondary mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-parchment-200 border border-parchment-400 rounded-lg focus:border-metals-gold focus:outline-none focus:ring-1 focus:ring-metals-gold text-ink-primary placeholder-ink-secondary"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Remember Me & Forgot Password (Sign In only) */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-parchment-200 border-parchment-400 rounded focus:ring-metals-gold focus:ring-2 text-metals-gold"
                  />
                  <span className="ml-2 text-sm text-ink-secondary">Remember me</span>
                </label>
                <button
                  {...getTestProps('forgot-password-link')}
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-metals-gold hover:text-metals-brass"
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              {...getTestProps('login-button')}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-might to-dragonfire text-white font-cinzel font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-metals-gold focus:ring-offset-2 focus:ring-offset-parchment-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {mode === 'signin' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Account
                    </>
                  )}
                </span>
              )}
            </button>
          </form>
          
          
          {/* Benefits Message */}
          <div className="mt-6 text-center text-sm text-ink-secondary">
            <p>Create an account to:</p>
            <ul className="mt-2 space-y-1">
              <li>• Save your worlds in the cloud</li>
              <li>• Access from any device</li>
              <li>• Collaborate with others</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-parchment-300 rounded-lg p-6 max-w-md w-full border border-parchment-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-cinzel font-medium text-ink-primary">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                  setForgotPasswordSent(false);
                  setError(null);
                }}
                className="text-ink-secondary hover:text-ink-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {!forgotPasswordSent ? (
              <form onSubmit={handleForgotPassword}>
                <p className="text-ink-secondary mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-dragonfire-100/20 border border-dragonfire rounded-lg flex items-start space-x-2">
                    <svg className="w-5 h-5 text-dragonfire-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-dragonfire">{error}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-ink-secondary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-parchment-200 border border-parchment-400 rounded-lg text-ink-primary placeholder-ink-secondary focus:outline-none focus:ring-2 focus:ring-metals-gold focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-might to-dragonfire text-white font-cinzel font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-metals-gold focus:ring-offset-2 focus:ring-offset-parchment-100 transition-all"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setError(null);
                    }}
                    className="px-4 py-2 bg-parchment-200 text-ink-secondary font-cinzel font-medium rounded-lg hover:bg-parchment-300 focus:outline-none focus:ring-2 focus:ring-ink-primary focus:ring-offset-2 focus:ring-offset-parchment-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-might rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-cinzel font-medium text-ink-primary mb-2">Check Your Email</h3>
                <p className="text-ink-secondary">
                  We've sent password reset instructions to {forgotPasswordEmail}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}