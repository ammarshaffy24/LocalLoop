import React, { useState } from 'react';
import { X, Mail, LogIn, Sparkles } from 'lucide-react';
import { signInWithMagicLink } from '../lib/auth';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Magic link request timed out after 10 seconds')), 10000);
      });
      
      const authPromise = signInWithMagicLink(email);
      
      const success = await Promise.race([authPromise, timeoutPromise]) as boolean;
      
      if (success) {
        setEmailSent(true);
        toast.success('Magic link sent! Check your email 📧', {
          duration: 5000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link';
      toast.error(errorMessage);
    } finally {
      // CRITICAL: Always clear the loading state
      console.log('🏁 FINALLY: Clearing auth loading state');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <LogIn className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
              <p className="text-sm text-gray-500">Manage your tips</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!emailSent ? (
            <>
              {/* Benefits */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="bg-emerald-100 p-1 rounded">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span>View and manage all your submitted tips</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="bg-emerald-100 p-1 rounded">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span>Edit or delete your tips anytime</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="bg-emerald-100 p-1 rounded">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span>Anonymous users can still browse and add tips</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed btn-hover shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending Magic Link...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Send Magic Link</span>
                    </div>
                  )}
                </button>
              </form>

              {/* Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600">
                  <strong>Magic Link Authentication:</strong> We'll send you a secure link to sign in. 
                  No passwords needed! Click the link in your email to access your account.
                </p>
              </div>
            </>
          ) : (
            /* Email Sent State */
            <div className="text-center space-y-4">
              <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Click the link in your email to sign in. The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Try Different Email
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;