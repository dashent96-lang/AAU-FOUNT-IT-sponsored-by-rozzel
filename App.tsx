
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import ItemCard from './components/ItemCard';
import PostModal from './components/PostModal';
import MessageModal from './components/MessageModal';
import ItemDetailsModal from './components/ItemDetailsModal';
import MessagesView from './components/MessagesView';
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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'ALL'>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await dataStore.getItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error("MongoDB Atlas Sync Error:", error);
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

  const handleMessageItem = (item: Item) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedMessageItem(item);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesLocation = locationFilter === 'ALL' || item.location === locationFilter;
      
      if (activeTab === 'myposts') {
        return matchesSearch && matchesStatus && matchesLocation && item.posterId === currentUser?.id;
      }
      
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [items, searchTerm, statusFilter, locationFilter, activeTab, currentUser]);

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
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {activeTab === 'messages' ? (
          currentUser ? (
            <MessagesView currentUser={currentUser} />
          ) : (
            <div className="bg-white rounded-[3rem] p-12 lg:p-24 text-center border border-slate-200 shadow-2xl flex flex-col items-center">
              <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-xl shadow-blue-100/50">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Private Message Center</h3>
              <p className="text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">Secure communication is reserved for verified AAU members. Please log in to coordinate item returns.</p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-10 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
              >
                Sign In to Message
              </button>
            </div>
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <section className="relative bg-slate-900 rounded-[3rem] overflow-hidden p-8 lg:p-20 text-white shadow-2xl">
                <div className="relative z-10 max-w-3xl">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest text-blue-300 mb-8 backdrop-blur-md">
                    Campus Resource Network
                  </div>
                  <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                    Let's Find What's <br/>
                    <span className="text-blue-500">Missing.</span>
                  </h1>
                  <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed mb-12 max-w-xl">
                    Ambrose Alli University's official lost and found hub. Securely connect with students and staff to reclaim your property.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={handlePostReport}
                      className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-blue-50 transition-all flex items-center group active:scale-95"
                    >
                      <svg className="w-6 h-6 mr-3 text-blue-600 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      Post New Report
                    </button>
                    {!currentUser && (
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-slate-800 text-slate-300 px-10 py-5 rounded-2xl font-black border border-slate-700 hover:text-white hover:border-slate-500 transition-all active:scale-95"
                      >
                        Join Now
                      </button>
                    )}
                  </div>
                </div>
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent hidden lg:block" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-[160px] opacity-20" />
              </section>
            )}

            {/* Filter Bar */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 lg:p-6 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 sticky top-24 z-40 transition-all">
              <div className="relative group md:col-span-2">
                <input 
                  type="text" 
                  placeholder="What are you looking for?"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 placeholder:text-slate-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-6 h-6 text-slate-300 absolute left-4 top-4 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <select 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-600 cursor-pointer appearance-none shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Reports</option>
                <option value={ItemStatus.LOST}>Missing Items</option>
                <option value={ItemStatus.FOUND}>Recovered Items</option>
              </select>

              <select 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-black text-slate-600 cursor-pointer appearance-none shadow-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="ALL">All AAU Locations</option>
                {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </section>

            {/* Content Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white rounded-[2rem] h-[440px] animate-pulse border border-slate-200/50 shadow-sm" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onMessage={handleMessageItem}
                    onViewDetails={(it) => setSelectedDetailItem(it)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200 flex flex-col items-center">
                <div className="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 shadow-inner">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 13.5a3 3 0 100-6 3 3 0 000 6z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800">No matching reports</h3>
                <p className="text-slate-400 mt-2 font-medium">Try broadening your search or change the location.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
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
        onMessage={handleMessageItem}
      />
    </Layout>
  );
};

export default App;
