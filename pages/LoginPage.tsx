
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox'; 
import AuthImagePanel from '../components/layout/AuthImagePanel'; 
import { ICONS, APP_NAME } from '../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error: authHookError, isLoadingAuth } = useAuth(); // Renamed authError to authHookError
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setFormError('Please enter a valid email address.');
        return;
    }

    // For client-side, password check is illustrative.
    // Actual validation against a stored hash isn't feasible without more complexity.
    const { success, error } = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else if (error) {
      setFormError(error.message || 'Login failed. Please try again.');
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
              Sign in to your account
            </h2>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email" 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required
                autoComplete="email" 
                icon={<ICONS.EMAIL_FORM className="text-slate-400" />} 
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
                icon={<ICONS.LOCK_CLOSED_FORM className="text-slate-400" />}
                wrapperClassName="mb-2" 
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-light focus:border-primary-light"
                labelClassName="text-slate-300"
              />
              
              <div className="flex items-center justify-between mb-4">
                <Checkbox
                  id="remember-me"
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  labelClassName="text-slate-400"
                />
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-light hover:text-primary-DEFAULT">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {(authHookError?.message || formError) && (
                <p className="text-sm text-danger text-center p-2 bg-danger/10 rounded-md border border-danger/30">
                  {formError || authHookError?.message}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" isLoading={isLoadingAuth} disabled={isLoadingAuth}>
                {isLoadingAuth ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary-light hover:text-primary-DEFAULT">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImagePanel />
    </div>
  );
};

export default LoginPage;
