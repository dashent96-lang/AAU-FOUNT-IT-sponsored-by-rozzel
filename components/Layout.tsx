
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'messages' | 'myposts';
  setActiveTab: (tab: 'home' | 'messages' | 'myposts') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onOpenAuth, onLogout }) => {
  const NavButton = ({ tab, label, icon }: { tab: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      aria-current={activeTab === tab ? 'page' : undefined}
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
        activeTab === tab 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-11 h-11 bg-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21V9m0 12l8-8m-8 8l-8-8M12 3v9" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">AAU<span className="text-blue-600 font-extrabold tracking-normal ml-1">PORTAL</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Lost & Found Dept</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2" aria-label="Main Navigation">
              <NavButton 
                tab="home" 
                label="Explore" 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              />
              <NavButton 
                tab="messages" 
                label="Chat" 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
              />
              <NavButton 
                tab="myposts" 
                label="My Activity" 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              />
            </nav>

            {/* User Profile / Auth */}
            <div className="flex items-center space-x-3">
              {currentUser ? (
                <div className="flex items-center bg-slate-50 pl-4 pr-1.5 py-1.5 rounded-2xl border border-slate-200/50">
                  <div className="hidden md:block mr-4">
                    <p className="text-xs font-black text-slate-800 text-right">{currentUser.name.split(' ')[0]}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase text-right tracking-wider">{currentUser.department}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                    title="Sign Out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onOpenAuth}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-12">
        {children}
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-2 flex justify-between items-center shadow-2xl z-[200] border border-white/10" aria-label="Mobile Navigation">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-3 rounded-2xl flex flex-col items-center space-y-1 transition-all ${activeTab === 'home' ? 'text-white bg-white/10' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-black uppercase">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-3 rounded-2xl flex flex-col items-center space-y-1 transition-all ${activeTab === 'messages' ? 'text-white bg-white/10' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="text-[10px] font-black uppercase">Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab('myposts')}
          className={`flex-1 py-3 rounded-2xl flex flex-col items-center space-y-1 transition-all ${activeTab === 'myposts' ? 'text-white bg-white/10' : 'text-slate-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-black uppercase">Mine</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
