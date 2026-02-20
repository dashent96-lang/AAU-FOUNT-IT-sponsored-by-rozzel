import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
  onViewGuide: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onViewGuide }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Official AAU Recovery Network</span>
          </div>

          <h1 className="text-4xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.85] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Lost it? Found it?<br />
            <span className="text-blue-600">Recover it.</span>
          </h1>

          <p className="max-w-2xl text-slate-500 text-sm lg:text-lg font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The most secure way to find missing items on campus. 
            Built exclusively for Ambrose Alli University students and staff.
            Verification-backed, community-driven, and lightning fast.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <button 
              onClick={onEnter}
              className="px-12 py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-900/30"
            >
              Enter Recovery Hub
            </button>
            <button 
              onClick={onViewGuide}
              className="px-12 py-6 bg-white text-slate-900 border-2 border-slate-100 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all"
            >
              Learn How It Works
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="hidden lg:block absolute left-20 top-1/2 -translate-y-1/2 -rotate-12 animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center space-x-4 w-64">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status: Found</p>
                <p className="text-sm font-black text-slate-800">Physics Textbook</p>
              </div>
            </div>
        </div>
        
        <div className="hidden lg:block absolute right-20 top-1/3 rotate-12 animate-in fade-in zoom-in duration-1000 delay-700">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 flex items-center space-x-4 w-64">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status: Lost</p>
                <p className="text-sm font-black text-slate-800">Apple Airpods</p>
              </div>
            </div>
        </div>
      </section>

      <footer className="fixed bottom-10 left-0 right-0 text-center px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Ambrose Alli University • Recovery Network Portal</p>
      </footer>
    </div>
  );
};

export default LandingPage;