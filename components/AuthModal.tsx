
'use client';

import React, { useState } from 'react';
import { User } from '../types';
import { dataStore } from '../services/dataStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const email = formData.email.trim();
    if (!email) {
      setError("Email address is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      let user: User | null = null;
      
      if (mode === 'signup') {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name.');
        }
        user = await dataStore.signup({
          name: formData.name.trim(),
          email: email.toLowerCase()
        });
      } else {
        user = await dataStore.login(email.toLowerCase());
        if (!user) {
          throw new Error('User account not found. Please sign up instead.');
        }
      }

      if (user) {
        dataStore.setCurrentUser(user);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      // More descriptive error messages for the user
      if (err.message.includes('fetch')) {
        setError('Network error: Is the server running?');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-slate-100">
        <div className="p-10 lg:p-12">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200 rotate-6 group hover:rotate-0 transition-transform duration-500">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 21V9m0 12l8-8m-8 8l-8-8M12 3v9" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
              {mode === 'login' ? 'Welcome Back' : 'Quick Join'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium text-sm">Ambrose Alli University Portal</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => { setMode('login'); setError(''); }} 
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Log In
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setError(''); }} 
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider border border-red-100 flex items-center animate-in slide-in-from-top-2">
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div className="relative group">
                <input 
                  required 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
                <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}

            <div className="relative group">
              <input 
                required 
                type="email" 
                placeholder="AAU Student Email" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
              <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className={`w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-95'}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Connecting...
                </span>
              ) : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
