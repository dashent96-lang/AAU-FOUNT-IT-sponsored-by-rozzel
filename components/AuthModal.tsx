
import React, { useState } from 'react';
import { dataStore } from '../services/dataStore';
import { User } from '../types';

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
    department: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!formData.name || !formData.email || !formData.department) {
          setError('Please fill in all fields');
          setIsSubmitting(false);
          return;
        }
        const user = await dataStore.signup({
          name: formData.name,
          email: formData.email,
          department: formData.department
        });
        onAuthSuccess(user);
        onClose();
      } else {
        const user = await dataStore.login(formData.email);
        if (user) {
          onAuthSuccess(user);
          onClose();
        } else {
          setError('User not found in database.');
        }
      }
    } catch (err) {
      setError('Connection to MongoDB failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 lg:p-10">
          <div className="text-center mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
              {mode === 'login' ? 'AAU Login' : 'Atlas Enrollment'}
            </h2>
            <p className="text-sm lg:text-base text-slate-500 mt-1 lg:mt-2 font-medium">
              Securely syncing with MongoDB
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl lg:rounded-2xl mb-6 lg:mb-8">
            <button 
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-bold transition-all ${mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">{error}</div>}

            {mode === 'signup' && (
              <>
                <input 
                  type="text" 
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none text-xs transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Department"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none text-xs transition-all"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </>
            )}

            <input 
              type="email" 
              placeholder="AAU Email"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none text-xs transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 lg:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl lg:rounded-2xl font-black shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? 'Authenticating...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
