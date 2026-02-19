'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

export default function Home() {
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

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await dataStore.getItems();
      setItems(fetchedItems || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const user = dataStore.getCurrentUser();
    if (user) setCurrentUser(user);
    
    // Auto-refresh every 60 seconds for new items
    const interval = setInterval(fetchItems, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePostReport = () => {
    if (!currentUser) return setIsAuthModalOpen(true);
    setIsPostModalOpen(true);
  };

  const myItems = useMemo(() => {
    if (!currentUser) return [];
    return items.filter(item => item.posterId === currentUser.id);
  }, [items, currentUser]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
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
      <div className="space-y-12 pb-24 lg:pb-12">
        {activeTab === 'messages' ? (
          currentUser ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MessagesView currentUser={currentUser} />
            </div>
          ) : (
            <AuthRequiredState 
              title="Message Center" 
              desc="Private coordination is reserved for verified AAU members." 
              icon="chat" 
              onAuth={() => setIsAuthModalOpen(true)} 
            />
          )
        ) : activeTab === 'myposts' ? (
          currentUser ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProfileView 
                currentUser={currentUser} 
                onUpdate={setCurrentUser} 
                myItems={myItems}
                onMessage={setSelectedMessageItem}
                onViewDetails={setSelectedDetailItem}
              />
            </div>
          ) : (
            <AuthRequiredState 
              title="Identity & Activity" 
              desc="Manage your reports and customize your campus profile." 
              icon="profile" 
              onAuth={() => setIsAuthModalOpen(true)} 
            />
          )
        ) : (
          <div className="animate-in fade-in duration-1000">
            {/* Pro Hero Section */}
            <section className="relative rounded-[3rem] overflow-hidden p-8 lg:p-24 text-white shadow-2xl border border-white/10 mb-12 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950" />
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-1000">
                 <img src="https://images.unsplash.com/photo-1523050853063-bd8012fbb761?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="Campus Life" />
              </div>
              
              <div className="relative z-10 max-w-4xl">
                <div className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-10 backdrop-blur-xl">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>Ambrose Alli University Digital Registry</span>
                </div>
                
                <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-10">
                  Lost it? <br/>
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">We'll find it.</span>
                </h1>
                
                <p className="text-slate-300 text-lg lg:text-2xl font-medium leading-relaxed mb-12 max-w-2xl">
                  The most efficient way to recover missing items on campus. Secure, verified, and built by students, for students.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handlePostReport} className="bg-white text-slate-950 px-12 py-5 rounded-3xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                    Report Now
                  </button>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('search-filters');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-10 py-5 rounded-3xl font-black text-lg hover:bg-white/20 transition-all"
                  >
                    Browse Feed
                  </button>
                </div>
              </div>
            </section>

            {/* Sticky Search & Filter Bar */}
            <section id="search-filters" className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 lg:p-6 glass rounded-[2.5rem] border border-white/50 shadow-2xl sticky top-24 z-40 mb-12">
              <div className="relative group md:col-span-2">
                <input 
                  type="text" 
                  placeholder="What are you looking for?"
                  className="w-full pl-14 pr-4 py-5 rounded-2xl bg-white border-none focus:ring-4 focus:ring-blue-600/10 outline-none font-bold text-slate-700 placeholder:text-slate-400 shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-6 h-6 text-slate-300 absolute left-5 top-5 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <select className="px-6 py-5 rounded-2xl bg-white font-black text-slate-600 outline-none border-none shadow-sm focus:ring-4 focus:ring-blue-600/10 cursor-pointer appearance-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="ALL">All Status</option>
                <option value={ItemStatus.LOST}>Lost Items</option>
                <option value={ItemStatus.FOUND}>Found Items</option>
              </select>
              
              <select className="px-6 py-5 rounded-2xl bg-white font-black text-slate-600 outline-none border-none shadow-sm focus:ring-4 focus:ring-blue-600/10 cursor-pointer appearance-none" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="ALL">Everywhere</option>
                {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </section>

            {/* Grid of Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
              {isLoading ? (
                [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-[520px] bg-white rounded-[3rem] animate-pulse border border-slate-100 shadow-sm" />)
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onMessage={() => {
                      if (!currentUser) return setIsAuthModalOpen(true);
                      setSelectedMessageItem(item);
                    }} 
                    onViewDetails={() => setSelectedDetailItem(item)} 
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-inner">
                  <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-400 tracking-tight">Zero matches for your search</h3>
                  <p className="text-slate-400 mt-2 font-medium">Try broadening your filters or checking different locations.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Persistent UI Components */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          fetchItems();
        }} 
      />

      {currentUser && (
        <PostModal 
          isOpen={isPostModalOpen} 
          onClose={() => setIsPostModalOpen(false)} 
          onSuccess={fetchItems} 
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
        onMessage={(item) => {
          if (!currentUser) return setIsAuthModalOpen(true);
          setSelectedDetailItem(null);
          setSelectedMessageItem(item);
        }} 
      />
    </Layout>
  );
}

const AuthRequiredState = ({ title, desc, icon, onAuth }: { title: string, desc: string, icon: string, onAuth: () => void }) => (
  <div className="glass rounded-[4rem] p-12 lg:p-32 text-center border border-slate-200 shadow-2xl flex flex-col items-center max-w-5xl mx-auto">
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/20 rotate-6 group hover:rotate-0 transition-transform duration-500">
      {icon === 'chat' ? (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      ) : (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      )}
    </div>
    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{title}</h3>
    <p className="text-slate-500 mt-4 max-w-md font-medium text-lg leading-relaxed">{desc}</p>
    <button 
      onClick={onAuth}
      className="mt-12 bg-slate-950 text-white px-14 py-6 rounded-[2rem] font-black text-lg shadow-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-blue-500/10"
    >
      Sign In & Get Access
    </button>
  </div>
);