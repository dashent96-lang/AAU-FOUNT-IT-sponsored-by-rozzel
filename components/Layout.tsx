
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'messages' | 'myposts';
  setActiveTab: (tab: 'home' | 'messages' | 'myposts') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onPostReport: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onOpenAuth, onLogout, onPostReport }) => {
  const NavButton = ({ tab, label, icon }: { tab: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-[0.1em] transition-all duration-300 ${
        activeTab === tab 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' 
          : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col">
      <header className="sticky top-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 21V9m0 12l8-8m-8 8l-8-8M12 3v9" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">AAU<span className="text-blue-600">HUB</span></h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Lost & Found Portal</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-2">
              <NavButton tab="home" label="Explore" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
              <NavButton tab="messages" label="Chats" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
              <NavButton tab="myposts" label="Activity" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={onPostReport}
                className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                Post <span className="hidden sm:inline ml-1">Report</span>
              </button>

              {currentUser ? (
                <button 
                  onClick={onLogout}
                  className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                </button>
              ) : (
                <button 
                  onClick={onOpenAuth}
                  className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-24">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200 flex justify-around items-center h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center space-y-1 ${activeTab === 'messages' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Chats</span>
        </button>
        <button onClick={() => setActiveTab('myposts')} className={`flex flex-col items-center space-y-1 ${activeTab === 'myposts' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
