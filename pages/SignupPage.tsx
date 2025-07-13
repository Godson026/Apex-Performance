

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthImagePanel from '../components/layout/AuthImagePanel';
import { ICONS, APP_NAME } from '../constants';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, error: authHookError, isLoadingAuth } = useAuth(); // Renamed authError
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSignupMessage(null);

    if (!username || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setFormError('Please enter a valid email address.');
        return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Simple password policy
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    
    const { success, error, message } = await signup(email, password, username);
    if (success) {
      setSignupMessage(message || 'Signup successful! Redirecting to dashboard...');
      // In a real Supabase app, you might not redirect immediately if email confirmation is required.
      // For this app's flow, we'll navigate after a delay.
      setTimeout(() => navigate('/dashboard'), 2500); 
    } else if (error) {
        setFormError(error.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex-1 lg:flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 bg-slate-950">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <ICONS.APP_LOGO_ICON className="h-16 w-auto text-primary-light mx-auto" />
            <p className="mt-2 text-center text-sm text-slate-400">{APP_NAME}</p>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Create your account
            </h2>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username" 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Choose a username" 
                required
                autoComplete="username" 
                icon={<ICONS.USER_CIRCLE className="text-slate-400"/>} 
                wrapperClassName="mb-4"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-light focus:border-primary-light"
                labelClassName="text-slate-300"
              />
              <Input
                label="Email"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                icon={<ICONS.EMAIL_FORM className="text-slate-400"/>}
                wrapperClassName="mb-4"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-light focus:border-primary-light"
                labelClassName="text-slate-300"
              />
              <Input
                label="Password"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                required
                autoComplete="new-password"
                icon={<ICONS.LOCK_CLOSED_FORM className="text-slate-400"/>}
                wrapperClassName="mb-4"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-light focus:border-primary-light"
                labelClassName="text-slate-300"
              />
              <Input
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                icon={<ICONS.LOCK_CLOSED_FORM className="text-slate-400"/>}
                wrapperClassName="mb-4"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-light focus:border-primary-light"
                labelClassName="text-slate-300"
              />

              {(authHookError?.message || formError) && (
                <p className="text-sm text-danger text-center p-2 bg-danger/10 rounded-md border border-danger/30">
                  {formError || authHookError?.message}
                </p>
              )}
               {signupMessage && !formError && (
                 <div className="text-sm text-success p-3 bg-success/10 rounded-md border border-success/30 flex items-start">
                  <ICONS.CHECK_SQUARE_FILLED className="w-5 h-5 inline mr-2 text-success shrink-0 mt-0.5" />
                  <span className="text-emerald-300">{signupMessage}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" isLoading={isLoadingAuth} disabled={isLoadingAuth || !!signupMessage}>
                {isLoadingAuth ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-light hover:text-primary-DEFAULT">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImagePanel />
    </div>
  );
};

export default SignupPage;
