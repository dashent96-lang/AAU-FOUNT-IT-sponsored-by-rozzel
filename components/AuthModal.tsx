'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setError('');
  }, [mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = formData.email.trim();
    if (!email) { setError("Email is required."); return; }
    
    setIsSubmitting(true);
    try {
      let user: User | null = null;
      if (mode === 'signup') {
        user = await dataStore.signup({ name: formData.name.trim(), email: email.toLowerCase() });
      } else {
        user = await dataStore.login(email.toLowerCase());
        if (!user) throw new Error('Account not found.');
      }
      if (user) onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/5 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 21V9m0 12l8-8m-8 8l-8-8M12 3v9" /></svg>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Join AAUPortal'}</h2>
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
            <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Sign In</button>
            <button type="button" onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-[10px] font-bold text-center">{error}</div>}
            
            {mode === 'signup' && (
              <div className="relative">
                <input required type="text" placeholder="Full Legal Name" className={inputStyles} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <svg className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            )}

            <div className="relative">
              <input required type="email" placeholder="Campus Email" className={inputStyles} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <svg className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-lg transition-all active:scale-95">
              {isSubmitting ? '...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
            <button type="button" onClick={onClose} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;