
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// useAuth import might not be strictly necessary if isLoadingAuth is removed, but kept for consistency
import { useAuth } from '../hooks/useAuth'; 
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuthImagePanel from '../components/layout/AuthImagePanel';
import { ICONS, APP_NAME } from '../constants';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  // isLoadingAuth can be used to disable button during mock "processing"
  const { isLoadingAuth } = useAuth(); 
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMessage(null);

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setFormError('Please enter a valid email address.');
        return;
    }
    
    // Simulate processing
    // In a client-side only app, actual password reset is not possible.
    setMessage("Password reset functionality is not available in this client-side version. Please manage your credentials locally.");
  };

  return (
    <div className="flex min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex-1 lg:flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 bg-slate-950">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-6 text-left">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
              aria-label="Back to login"
            >
              <ICONS.CHEVRON_LEFT className="w-5 h-5 text-slate-300" />
            </Link>
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-bold text-white">
              Forgot password?
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your email address below.
            </p>
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
                icon={<ICONS.EMAIL_FORM className="text-slate-400"/>}
                wrapperClassName="mb-4"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-primary-light focus:border-primary-light"
                labelClassName="text-slate-300"
              />

              {formError && (
                <p className="text-sm text-danger text-center p-2 bg-danger/10 rounded-md border border-danger/30">
                  {formError}
                </p>
              )}
              {message && !formError && (
                 <div className={`text-sm p-3 rounded-md border ${message.includes("not available") ? "text-amber-300 bg-amber-500/10 border-amber-500/30" : "text-success bg-success/10 border-success/30"} flex items-start`}>
                   {message.includes("not available") ? <ICONS.WARNING_ALT_ICON className="w-5 h-5 inline mr-2 shrink-0 mt-0.5" /> : <ICONS.CHECK_SQUARE_FILLED className="w-5 h-5 inline mr-2 text-success shrink-0 mt-0.5" /> }
                  <span>{message}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" isLoading={isLoadingAuth} disabled={isLoadingAuth || !!message}>
                {isLoadingAuth ? 'Processing...' : (message ? 'Instruction Displayed' : 'Request Reset')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
                <span className="text-slate-400">Remembered it? </span>
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

export default ForgotPasswordPage;
