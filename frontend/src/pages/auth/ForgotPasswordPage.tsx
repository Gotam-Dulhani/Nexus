import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { forgotPassword } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      setError((error as Error).message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient-bg relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-2xl rotate-12 auth-float-1" />
        <div className="absolute bottom-24 right-20 w-12 h-12 bg-white/10 rounded-full auth-float-2" />
        <div className="absolute top-1/3 right-16 w-14 h-14 bg-white/5 rounded-xl -rotate-12 auth-float-3" />

        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold">Business Nexus</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-6">
            Forgot Your<br />Password?
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            No worries. We'll send you a secure link to reset your password and get you back on track.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Business Nexus</span>
          </div>

          {isSubmitted ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  We've sent password reset instructions to<br />
                  <span className="font-medium text-gray-900 dark:text-white">{email}</span>
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button variant="outline" fullWidth onClick={() => setIsSubmitted(false)}>
                  Try again
                </Button>
                <Link to="/login">
                  <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={18} />}>
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 mb-4">
                  <KeyRound className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  Forgot password?
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  startAdornment={<Mail size={18} />}
                />
                
                <Button type="submit" fullWidth isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>
                  Send reset link
                </Button>

                <Link to="/login">
                  <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={18} />}>
                    Back to login
                  </Button>
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
