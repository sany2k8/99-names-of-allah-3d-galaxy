import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, UserPlus, LogOut, ShieldAlert, Sparkles, Chrome } from 'lucide-react';
import { audio } from '../audio';

interface AuthDialogProps {
  currentUser: User | null;
  onClose?: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ currentUser, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    audio.playSparkle('click');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onClose) onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Authentication failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError(null);
    setLoading(true);
    audio.playSparkle('click');
    try {
      await signInAnonymously(auth);
      if (onClose) onClose();
    } catch (err: any) {
      console.error(err);
      setError('Guest login failed. Please try email login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    audio.playSparkle('click');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      if (onClose) onClose();
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in cancelled.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    audio.playSparkle('click');
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  if (currentUser) {
    return (
      <div id="auth-panel" className="bg-[#0b0f19]/90 border border-white/5 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-sans font-medium text-lg leading-tight">Spiritual Sync Status</h3>
            <p className="font-mono text-xs text-slate-400">
              {currentUser.isAnonymous ? 'Logged in as Guest' : currentUser.email}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Your spiritual progress, memorized names, and marked favorites are currently synced to your cloud account. You can log in on any device to resume your journey.
        </p>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 py-2.5 rounded-lg font-mono text-xs tracking-wider uppercase transition-all duration-200"
        >
          <LogOut size={14} />
          Disconnect Cloud Sync
        </button>
      </div>
    );
  }

  return (
    <div id="auth-panel" className="bg-[#0b0f19]/90 border border-white/5 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100 flex flex-col gap-4">
      <div className="text-center">
        <h3 className="font-sans font-semibold text-xl tracking-tight text-amber-200">
          {isSignUp ? 'Create Spiritual Account' : 'Connect Cloud Sync'}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isSignUp ? 'Sign up to backup your recitation progress' : 'Log in to synchronize your progress across devices'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="flex flex-col gap-3">
        {error && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs text-rose-300">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-950/60 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400/50 transition-all"
            placeholder="name@example.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-950/60 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400/50 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-800 text-slate-950 font-sans font-medium py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
          {loading ? 'Authenticating...' : isSignUp ? 'Register & Connect' : 'Log In & Sync'}
        </button>
      </form>

      <div className="flex items-center gap-2 my-1">
        <div className="h-[1px] bg-white/5 flex-grow" />
        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500">or use google</span>
        <div className="h-[1px] bg-white/5 flex-grow" />
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 border border-white/10 hover:border-amber-500/30 text-white font-sans font-medium py-2.5 rounded-lg text-sm transition-all shadow-lg cursor-pointer"
      >
        <Chrome size={16} className="text-amber-400" />
        <span>Continue with Google</span>
      </button>

      <div className="flex items-center justify-between mt-1 text-xs">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-amber-400 hover:underline font-medium"
        >
          {isSignUp ? 'Already have an account? Log In' : 'New user? Create Account'}
        </button>

        <span className="text-slate-500">or</span>

        <button
          onClick={handleAnonymous}
          disabled={loading}
          className="text-slate-400 hover:text-slate-200 underline"
        >
          Skip as Guest
        </button>
      </div>

      <div className="border-t border-white/5 pt-3 text-[10px] text-slate-500 text-center font-mono leading-normal">
        Your data is encrypted securely and stored with strict privacy controls.
      </div>
    </div>
  );
};
