import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'messages' | 'myposts' | 'admin' | 'guide';
  setActiveTab: (tab: 'home' | 'messages' | 'myposts' | 'admin' | 'guide') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onPostReport: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onOpenAuth, onLogout, onPostReport }) => {
  const isAdmin = currentUser?.email === 'admin@gmail.com';

  const NavButton = ({ tab, label, icon }: { tab: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-200 ${
        activeTab === tab 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col no-shift">
      {/* Universal Header - Optimized for Mobile */}
      <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-slate-100 transform translateZ(0) pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 21V9m0 12l8-8m-8 8l-8-8M12 3v9" />
                </svg>
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tighter leading-none">AAU<span className="text-blue-600">HUB</span></h1>
                <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 leading-none">RECOVERY</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <NavButton tab="home" label="Home" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
              <NavButton tab="guide" label="Guide" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <NavButton tab="messages" label="Inbox" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
              <NavButton tab="myposts" label="Profile" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
              {isAdmin && (
                <NavButton tab="admin" label="Admin" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
              )}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={onPostReport}
                className="bg-blue-600 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black hover:bg-blue-700 transition-all flex items-center uppercase tracking-widest active:scale-95 shadow-md shadow-blue-500/10"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                Post
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-1.5 sm:space-x-3">
                  <div 
                    onClick={() => setActiveTab('myposts')}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden cursor-pointer active:scale-95 shadow-sm"
                  >
                    <img 
                      src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} 
                      alt={currentUser.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-2.5 sm:p-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                    title="Sign Out"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onOpenAuth}
                  className="bg-slate-900 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest active:scale-95 hover:bg-slate-800"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Area - Dynamic Bottom Padding for Mobile Nav */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:py-12 pb-24 lg:pb-12">
        {children}
      </main>

      {/* Mobile Navigation - Sticky Bottom */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around items-center h-16 z-[150] transform translateZ(0) shadow-[0_-8px_30px_rgba(0,0,0,0.04)] pb-safe">
        <MobileNavItem 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          label="Home"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
        />
        <MobileNavItem 
          active={activeTab === 'guide'} 
          onClick={() => setActiveTab('guide')} 
          label="Guide"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MobileNavItem 
          active={activeTab === 'messages'} 
          onClick={() => setActiveTab('messages')} 
          label="Inbox"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
        <MobileNavItem 
          active={activeTab === 'myposts'} 
          onClick={() => setActiveTab('myposts')} 
          label="Profile"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        {isAdmin && (
          <MobileNavItem 
            active={activeTab === 'admin'} 
            onClick={() => setActiveTab('admin')} 
            label="Admin"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
        )}
      </nav>
    </div>
  );
};

const MobileNavItem = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${active ? 'text-blue-600' : 'text-slate-400'}`}>
    {active && <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-full" />}
    {icon}
    <span className="text-[8px] font-black uppercase tracking-[0.15em] mt-1.5 leading-none">{label}</span>
  </button>
);

export default Layout;