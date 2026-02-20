'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import ItemCard from '../components/ItemCard';
import PostModal from '../components/PostModal';
import MessageModal from '../components/MessageModal';
import ItemDetailsModal from '../components/ItemDetailsModal';
import MessagesView from '../components/MessagesView';
import ProfileView from '../components/ProfileView';
import AuthModal from '../components/AuthModal';
import { Item, ItemStatus, User } from '../types';
import { dataStore } from '../services/dataStore';
import { AAU_LOCATIONS } from '../constants';

type Tab = 'home' | 'messages' | 'myposts';

export default function Home() {
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

  const setActiveTab = useCallback((tab: Tab, pushHistory = true) => {
    setActiveTabState(tab);
    if (pushHistory) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
  }, []);

  const fetchItems = async () => {
    try {
      const fetchedItems = await dataStore.getItems();
      setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = dataStore.getCurrentUser();
    if (user) setCurrentUser(user);

    const hash = window.location.hash.replace('#', '') as Tab;
    if (['home', 'messages', 'myposts'].includes(hash)) {
      setActiveTabState(hash);
    }

    const handlePopState = (event: PopStateEvent) => {
      const tab = event.state?.tab || 'home';
      setActiveTabState(tab);
    };

    window.addEventListener('popstate', handlePopState);
    fetchItems();
    
    const interval = setInterval(fetchItems, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handlePostReport = () => {
    if (!currentUser) return setIsAuthModalOpen(true);
    setIsPostModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.filter(item => {
      if (!item) return false;
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = title.includes(search) || desc.includes(search);
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
      <div className="space-y-6 sm:space-y-12 animate-in fade-in duration-500">
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
              myItems={items.filter(i => i.posterId === currentUser.id)}
              onMessage={setSelectedMessageItem}
              onViewDetails={setSelectedDetailItem}
              onRefresh={fetchItems}
            />
          ) : (
            <AuthRequiredState title="Profile" desc="Track your lost and found activity in one place." onAuth={() => setIsAuthModalOpen(true)} />
          )
        ) : (
          <>
            <section className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden p-8 sm:p-20 text-white bg-slate-900 shadow-2xl">
              <div className="absolute inset-0 opacity-20">
                 <img src="https://images.unsplash.com/photo-1523050853063-bd8012fbb761?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover grayscale brightness-50" alt="" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl sm:text-6xl font-black tracking-tighter leading-none mb-4 uppercase">
                  AAU <span className="text-blue-500">Recovery</span> Hub
                </h1>
                <p className="text-slate-300 text-xs sm:text-lg font-medium mb-8 max-w-sm uppercase tracking-widest leading-relaxed">
                  Fast, secure recovery for the Ambrose Alli community.
                </p>
                <button onClick={handlePostReport} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest active:scale-95 shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all">
                  Post Report
                </button>
              </div>
            </section>

            {/* Sticky Filters - Highly Responsive */}
            <section className="sticky top-16 sm:top-20 z-40 bg-slate-50/80 backdrop-blur-md py-4 sm:py-6 -mx-2 px-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group flex-grow">
                  <input 
                    type="text" 
                    placeholder="Search the hub..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-blue-600/5 outline-none font-bold text-slate-700 text-xs shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg className="w-5 h-5 text-slate-300 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-40 shrink-0">
                    <select 
                      className="w-full pl-4 pr-10 py-4 rounded-2xl bg-white border border-slate-200 font-black text-[9px] uppercase tracking-widest text-slate-600 outline-none appearance-none cursor-pointer shadow-sm focus:ring-4 focus:ring-blue-600/5 transition-all" 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="ALL">All Status</option>
                      <option value={ItemStatus.LOST}>Lost Items</option>
                      <option value={ItemStatus.FOUND}>Found Items</option>
                    </select>
                    <div className="absolute right-4 top-5 pointer-events-none text-slate-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div className="relative flex-1 sm:w-48 shrink-0">
                    <select 
                      className="w-full pl-4 pr-10 py-4 rounded-2xl bg-white border border-slate-200 font-black text-[9px] uppercase tracking-widest text-slate-600 outline-none appearance-none cursor-pointer shadow-sm focus:ring-4 focus:ring-blue-600/5 transition-all" 
                      value={locationFilter} 
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="ALL">All Locations</option>
                      {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <div className="absolute right-4 top-5 pointer-events-none text-slate-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-10">
              {isLoading ? (
                [1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-[2rem] animate-pulse" />)
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    currentUser={currentUser}
                    onRefresh={fetchItems}
                    onMessage={(it) => { if (!currentUser) return setIsAuthModalOpen(true); setSelectedMessageItem(it); }} 
                    onViewDetails={(it) => setSelectedDetailItem(it)} 
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mx-1">
                   <h3 className="text-xl sm:text-3xl font-black text-slate-200 tracking-tighter uppercase mb-2">No Verified Items</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Adjust filters or check back later</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={(user) => { setCurrentUser(user); setIsAuthModalOpen(false); fetchItems(); }} />
      {currentUser && <PostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSuccess={fetchItems} currentUser={currentUser} />}
      {currentUser && <MessageModal item={selectedMessageItem} onClose={() => setSelectedMessageItem(null)} currentUser={currentUser} />}
      <ItemDetailsModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} currentUser={currentUser} onMessage={(item) => { if (!currentUser) return setIsAuthModalOpen(true); setSelectedDetailItem(null); setSelectedMessageItem(item); }} />
    </Layout>
  );
}

const AuthRequiredState = ({ title, desc, onAuth }: { title: string, desc: string, onAuth: () => void }) => (
  <div className="p-10 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm max-w-sm mx-auto my-16">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    </div>
    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3 uppercase">{title}</h3>
    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">{desc}</p>
    <button onClick={onAuth} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-slate-900/10">
      Access Secure Portal
    </button>
  </div>
);