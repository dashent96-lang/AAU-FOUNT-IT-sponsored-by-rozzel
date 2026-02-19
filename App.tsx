import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import ItemCard from './components/ItemCard';
import PostModal from './components/PostModal';
import MessageModal from './components/MessageModal';
import ItemDetailsModal from './components/ItemDetailsModal';
import MessagesView from './components/MessagesView';
import ProfileView from './components/ProfileView';
import AuthModal from './components/AuthModal';
import { Item, ItemStatus, User } from './types';
import { dataStore } from './services/dataStore';
import { AAU_LOCATIONS } from './constants';

type Tab = 'home' | 'messages' | 'myposts';

const App: React.FC = () => {
  const [activeTab, setActiveTabState] = useState<Tab>('home');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedMessageItem, setSelectedMessageItem] = useState<Item | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<Item | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'ALL'>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Unified tab setter that updates browser history
  const setActiveTab = useCallback((tab: Tab, pushHistory = true) => {
    setActiveTabState(tab);
    if (pushHistory) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await dataStore.getItems();
      setItems(fetchedItems || []);
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync state with URL Hash and handle Back Button
  useEffect(() => {
    // 1. Recover Session from persistent storage
    const user = dataStore.getCurrentUser();
    if (user) setCurrentUser(user);

    // 2. Initial Tab from Hash if present
    const hash = window.location.hash.replace('#', '') as Tab;
    if (['home', 'messages', 'myposts'].includes(hash)) {
      setActiveTabState(hash);
    }

    // 3. Listen for Back/Forward Buttons
    const handlePopState = (event: PopStateEvent) => {
      const tab = event.state?.tab || 'home';
      setActiveTabState(tab);
    };

    window.addEventListener('popstate', handlePopState);
    refreshData();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePostReport = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsPostModalOpen(true);
  };

  const myItems = useMemo(() => {
    return items.filter(item => item.posterId === currentUser?.id);
  }, [items, currentUser]);

  const filteredItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={currentUser}
      onOpenAuth={() => setIsAuthModalOpen(true)}
      onLogout={handleLogout}
      onPostReport={handlePostReport}
    >
      <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500">
        
        {activeTab === 'messages' ? (
          currentUser ? (
            <MessagesView currentUser={currentUser} />
          ) : (
            <AuthRequiredState title="Inbox" desc="Sign in to coordinate with other AAU students." onAuth={() => setIsAuthModalOpen(true)} />
          )
        ) : activeTab === 'myposts' ? (
          currentUser ? (
            <ProfileView 
              currentUser={currentUser} 
              onUpdate={setCurrentUser} 
              myItems={myItems}
              onMessage={setSelectedMessageItem}
              onViewDetails={setSelectedDetailItem}
            />
          ) : (
            <AuthRequiredState title="Activity" desc="Track your lost and found reports in one place." onAuth={() => setIsAuthModalOpen(true)} />
          )
        ) : (
          <>
            {/* Minimal Hero Section */}
            <section className="relative rounded-xl sm:rounded-3xl overflow-hidden p-5 sm:p-12 text-white bg-slate-900 shadow-md">
              <div className="absolute inset-0 opacity-10">
                 <img src="https://images.unsplash.com/photo-1523050853063-bd8012fbb761?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="" />
              </div>
              <div className="relative z-10 max-w-xl">
                <h1 className="text-xl sm:text-4xl font-black tracking-tight leading-tight mb-2 uppercase">
                  AAU <span className="text-blue-500">Recovery</span> Hub
                </h1>
                <p className="text-slate-400 text-[10px] sm:text-sm font-medium mb-5 max-w-xs uppercase tracking-widest leading-relaxed">
                  Fast, secure recovery for the Ambrose Alli community.
                </p>
                <button onClick={handlePostReport} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-blue-900/40">
                  New Report
                </button>
              </div>
            </section>

            {/* Compact Filter Bar */}
            <section className="sticky top-16 z-40 flex flex-col sm:flex-row gap-2 bg-slate-50/80 backdrop-blur-sm py-2">
              <div className="relative group flex-grow">
                <input 
                  type="text" 
                  placeholder="Search items..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700 text-[11px] placeholder:text-slate-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 text-slate-300 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <div className="flex gap-2">
                <select className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 font-black text-[9px] uppercase tracking-wider text-slate-600 outline-none appearance-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <option value="ALL">Status</option>
                  <option value={ItemStatus.LOST}>Lost</option>
                  <option value={ItemStatus.FOUND}>Found</option>
                </select>
                <select className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 font-black text-[9px] uppercase tracking-wider text-slate-600 outline-none appearance-none cursor-pointer" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="ALL">Locs</option>
                  {AAU_LOCATIONS.slice(0, 10).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </section>

            {/* Compact Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {isLoading ? (
                [1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-white rounded-xl animate-pulse" />)
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onMessage={(it) => {
                      if(!currentUser) return setIsAuthModalOpen(true);
                      setSelectedMessageItem(it);
                    }}
                    onViewDetails={(it) => setSelectedDetailItem(it)}
                  />
                ))
              ) : (
                <div className="col-span-full py-24 text-center">
                  <h3 className="text-lg font-black text-slate-300 tracking-tight uppercase">No results found</h3>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={async (user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          await refreshData();
        }}
      />

      {currentUser && (
        <PostModal 
          isOpen={isPostModalOpen} 
          onClose={() => setIsPostModalOpen(false)} 
          onSuccess={refreshData}
          currentUser={currentUser}
        />
      )}

      {currentUser && (
        <MessageModal 
          item={selectedMessageItem} 
          onClose={() => setSelectedMessageItem(null)} 
          currentUser={currentUser}
        />
      )}

      <ItemDetailsModal 
        item={selectedDetailItem} 
        onClose={() => setSelectedDetailItem(null)} 
        onMessage={(it) => {
          if(!currentUser) return setIsAuthModalOpen(true);
          setSelectedDetailItem(null);
          setSelectedMessageItem(it);
        }}
      />
    </Layout>
  );
};

const AuthRequiredState = ({ title, desc, onAuth }: { title: string, desc: string, onAuth: () => void }) => (
  <div className="p-8 text-center bg-white rounded-xl border border-slate-100 shadow-sm max-w-sm mx-auto my-12">
    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">{title}</h3>
    <p className="text-slate-500 text-[10px] font-medium leading-relaxed mb-6">{desc}</p>
    <button onClick={onAuth} className="w-full py-3 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
      Sign In
    </button>
  </div>
);

export default App;