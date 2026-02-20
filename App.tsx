import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import ItemCard from './components/ItemCard';
import PostModal from './components/PostModal';
import MessageModal from './components/MessageModal';
import ItemDetailsModal from './components/ItemDetailsModal';
import MessagesView from './components/MessagesView';
import ProfileView from './components/ProfileView';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import HowItWorksView from './components/HowItWorksView';
import AdminDashboard from './components/AdminDashboard';
import { Item, ItemStatus, User } from './types';
import { dataStore, ADMIN_EMAIL } from './services/dataStore';
import { AAU_LOCATIONS } from './constants';

type Tab = 'home' | 'messages' | 'myposts' | 'admin' | 'guide';

const App: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<Tab>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedMessageItem, setSelectedMessageItem] = useState<Item | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState<boolean | null>(null); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'ALL'>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  const setActiveTab = useCallback((tab: Tab, pushHistory = true) => {
    setActiveTabState(tab);
    if (pushHistory) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const fetchedItems = await dataStore.getItems();
      setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
    } catch (error) {
      console.error("Data refresh error:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasSeenLanding = localStorage.getItem('aau_seen_landing');
    setShowLanding(hasSeenLanding !== 'true');

    const user = dataStore.getCurrentUser();
    if (user) setCurrentUser(user);

    const hash = window.location.hash.replace('#', '') as Tab;
    if (['home', 'messages', 'myposts', 'admin', 'guide'].includes(hash)) {
      setActiveTabState(hash);
    }

    const handlePopState = (event: PopStateEvent) => {
      const tab = (event.state?.tab || 'home') as Tab;
      setActiveTabState(tab);
    };

    window.addEventListener('popstate', handlePopState);
    refreshData();

    return () => window.removeEventListener('popstate', handlePopState);
  }, [refreshData]);

  const handleEnterHub = () => {
    localStorage.setItem('aau_seen_landing', 'true');
    setShowLanding(false);
    setActiveTab('home');
  };

  const handleViewGuide = () => {
    localStorage.setItem('aau_seen_landing', 'true');
    setShowLanding(false);
    setActiveTab('guide');
  };

  const handlePostReport = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsPostModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    const term = searchTerm.toLowerCase();
    
    return safeItems.filter(item => {
      if (!item) return false;
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      
      const matchesSearch = title.includes(term) || desc.includes(term);
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesLocation = locationFilter === 'ALL' || item.location === locationFilter;
      
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [items, searchTerm, statusFilter, locationFilter]);

  const handleLogout = () => {
    dataStore.logout();
    setCurrentUser(null);
    setActiveTab('home');
  };

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  if (showLanding === null) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-[0.2em]">Authenticating...</div>;
  }

  if (showLanding) {
    return <LandingPage onEnter={handleEnterHub} onViewGuide={handleViewGuide} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={currentUser}
      onOpenAuth={() => setIsAuthModalOpen(true)}
      onLogout={handleLogout}
      onPostReport={handlePostReport}
    >
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        
        {activeTab === 'messages' ? (
          currentUser ? (
            <MessagesView currentUser={currentUser} />
          ) : (
            <AuthRequiredState title="Inbox" desc="Sign in to coordinate with the recovery hub staff." onAuth={() => setIsAuthModalOpen(true)} />
          )
        ) : activeTab === 'myposts' ? (
          currentUser ? (
            <ProfileView 
              currentUser={currentUser} 
              onUpdate={setCurrentUser} 
              myItems={items.filter(i => i && i.posterId === currentUser.id)}
              onMessage={setSelectedMessageItem}
              onViewDetails={setSelectedDetailItem}
              onRefresh={refreshData}
            />
          ) : (
            <AuthRequiredState title="Activity" desc="Track your lost and found reports in one place." onAuth={() => setIsAuthModalOpen(true)} />
          )
        ) : activeTab === 'admin' ? (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <AuthRequiredState title="Access Denied" desc="Administrator privileges required." onAuth={() => setIsAuthModalOpen(true)} />
          )
        ) : activeTab === 'guide' ? (
          <HowItWorksView onEnterHub={() => setActiveTab('home')} />
        ) : (
          <>
            <section className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden p-6 sm:p-12 text-white bg-slate-900 shadow-xl">
              <div className="absolute inset-0 opacity-10">
                 <img src="https://images.unsplash.com/photo-1523050853063-bd8012fbb761?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="" />
              </div>
              <div className="relative z-10 max-w-xl">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 uppercase leading-none">
                  AAU <span className="text-blue-500">Recovery</span> Hub
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6 uppercase tracking-widest leading-relaxed">
                  Official student-led recovery network.
                </p>
                <button onClick={handlePostReport} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-blue-500/20">
                  New Report
                </button>
              </div>
            </section>

            <section className="sticky top-16 z-[60] flex flex-col sm:flex-row gap-2 bg-slate-50/80 backdrop-blur-md py-2 px-1">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Filter verified items..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-4 focus:ring-blue-600/5 outline-none font-bold text-slate-700 text-xs transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <div className="flex gap-2">
                <select className="flex-1 px-3 py-3 rounded-xl bg-white border border-slate-200 font-black text-[9px] uppercase tracking-wider text-slate-600 outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <option value="ALL">Status</option>
                  <option value={ItemStatus.LOST}>Lost</option>
                  <option value={ItemStatus.FOUND}>Found</option>
                </select>
                <select className="flex-1 px-3 py-3 rounded-xl bg-white border border-slate-200 font-black text-[9px] uppercase tracking-wider text-slate-600 outline-none cursor-pointer" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="ALL">Locs</option>
                  {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </section>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {isLoading ? (
                [1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse" />)
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    currentUser={currentUser}
                    onRefresh={refreshData}
                    onMessage={(it) => {
                      if(!currentUser) return setIsAuthModalOpen(true);
                      setSelectedMessageItem(it);
                    }}
                    onViewDetails={(it) => setSelectedDetailItem(it)}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight">No Reports Found</h3>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={(user) => { setCurrentUser(user); setIsAuthModalOpen(false); refreshData(); }} />
      {currentUser && <PostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSuccess={refreshData} currentUser={currentUser} />}
      {currentUser && <MessageModal item={selectedMessageItem} onClose={() => setSelectedMessageItem(null)} currentUser={currentUser} />}
      <ItemDetailsModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} currentUser={currentUser} onMessage={(it) => { if(!currentUser) return setIsAuthModalOpen(true); setSelectedDetailItem(null); setSelectedMessageItem(it); }} />
    </Layout>
  );
};

const AuthRequiredState = ({ title, desc, onAuth }: { title: string, desc: string, onAuth: () => void }) => (
  <div className="p-10 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm max-w-sm mx-auto my-12">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">{desc}</p>
    <button onClick={onAuth} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all">
      Secure Access
    </button>
  </div>
);

export default App;