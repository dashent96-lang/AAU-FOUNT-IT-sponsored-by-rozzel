import React, { useState, useEffect, useMemo } from 'react';
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'myposts'>('home');
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

  useEffect(() => {
    refreshData();
    const user = dataStore.getCurrentUser();
    if (user) setCurrentUser(user);
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
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {activeTab === 'messages' ? (
          currentUser ? (
            <MessagesView currentUser={currentUser} />
          ) : (
            <div className="bg-white rounded-[3rem] p-12 lg:p-24 text-center border border-slate-200 shadow-2xl flex flex-col items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 rotate-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Private Message Center</h3>
              <p className="text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">Secure communication is reserved for verified AAU members.</p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-10 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
              >
                Sign In to Message
              </button>
            </div>
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
            <div className="bg-white rounded-[3rem] p-12 lg:p-24 text-center border border-slate-200 shadow-2xl flex flex-col items-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 rotate-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your AAU Profile</h3>
              <p className="text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">Join the network to track your reports and customize your identity.</p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-10 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          )
        ) : (
          <>
            <section className="relative group rounded-[3.5rem] overflow-hidden p-8 lg:p-24 text-white shadow-[0_50px_100px_-20px_rgba(30,58,138,0.25)] border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900" />
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="Campus" />
              </div>
              <div className="relative z-10 max-w-4xl">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-8 backdrop-blur-xl">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                  <span>Ambrose Alli University Hub</span>
                </div>
                <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
                  Lost it? <br/>
                  <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Find it here.</span>
                </h1>
                <p className="text-slate-300 text-lg lg:text-2xl font-medium leading-relaxed mb-12 max-w-2xl">
                  The official campus digital repository. Connect with fellow students to reclaim your essentials securely and swiftly.
                </p>
                <button onClick={handlePostReport} className="bg-white text-slate-900 px-12 py-6 rounded-[2rem] font-black shadow-2xl transition-all hover:scale-105 active:scale-95 text-lg">Post New Report</button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 lg:p-6 glass rounded-[2.5rem] border border-white/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] sticky top-28 z-40">
              <div className="relative group md:col-span-2">
                <input 
                  type="text" 
                  placeholder="Search for keys, phones, wallets..."
                  className="w-full pl-14 pr-4 py-5 rounded-2xl bg-white border-none focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 placeholder:text-slate-400 shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-6 h-6 text-slate-300 absolute left-5 top-5 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <select 
                className="w-full px-6 py-5 rounded-2xl bg-white border-none focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-slate-600 cursor-pointer shadow-sm appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value={ItemStatus.LOST}>Lost</option>
                <option value={ItemStatus.FOUND}>Found</option>
              </select>

              <select 
                className="w-full px-6 py-5 rounded-2xl bg-white border-none focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-slate-600 cursor-pointer shadow-sm appearance-none"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="ALL">All Locations</option>
                {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </section>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-[500px] bg-white rounded-[3rem] animate-pulse" />)}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onMessage={(it) => {
                      if(!currentUser) return setIsAuthModalOpen(true);
                      setSelectedMessageItem(it);
                    }}
                    onViewDetails={(it) => setSelectedDetailItem(it)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <h3 className="text-3xl font-black text-slate-300 tracking-tight">No reports found.</h3>
              </div>
            )}
          </>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={async (user) => {
          setCurrentUser(user);
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

export default App;