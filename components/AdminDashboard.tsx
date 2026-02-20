import React, { useState, useEffect, useMemo } from 'react';
import { Item, ItemStatus } from '../types';
import { dataStore, ADMIN_ID } from '../services/dataStore';
import AdminEditModal from './AdminEditModal';
import MessagesView from './MessagesView';

type AdminTab = 'pending' | 'all' | 'resolved' | 'messages';

const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const allItems = await dataStore.getItems(true);
      setItems(allItems || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = items;
    
    if (activeTab === 'pending') {
      filtered = filtered.filter(i => !i.isVerified);
    } else if (activeTab === 'resolved') {
      filtered = filtered.filter(i => i.status === ItemStatus.RECLAIMED);
    } else if (activeTab === 'all') {
      filtered = filtered.filter(i => i.isVerified && i.status !== ItemStatus.RECLAIMED);
    } else {
      return []; // Messages tab handles itself
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(s) || 
        i.posterName.toLowerCase().includes(s) ||
        i.location.toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [items, activeTab, searchTerm]);

  const handleApprove = async (id: string) => {
    try {
      await dataStore.verifyItem(id);
      fetchData();
    } catch (e) {
      alert("Verification failed.");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await dataStore.updateItemStatus(id, ItemStatus.RECLAIMED);
      fetchData();
    } catch (e) {
      alert("Failed to resolve.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await dataStore.deleteItem(id);
      fetchData();
    } catch (e) {
      alert("Rejection failed.");
    }
  };

  const TabButton = ({ tab, label, count }: { tab: AdminTab, label: string, count?: number }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
        activeTab === tab 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );

  const stats = {
    pending: items.filter(i => !i.isVerified).length,
    active: items.filter(i => i.isVerified && i.status !== ItemStatus.RECLAIMED).length,
    resolved: items.filter(i => i.status === ItemStatus.RECLAIMED).length
  };

  const adminUser = dataStore.getCurrentUser();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Control Center</h2>
          <p className="text-slate-400 text-[10px] mt-2 font-bold tracking-widest uppercase">Moderation & Recovery Management</p>
        </div>

        {activeTab !== 'messages' && (
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-slate-700 text-xs focus:ring-4 focus:ring-blue-600/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 text-slate-300 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <TabButton tab="pending" label="Pending Approval" count={stats.pending} />
        <TabButton tab="all" label="Verified Reports" count={stats.active} />
        <TabButton tab="resolved" label="Resolved Archive" count={stats.resolved} />
        <TabButton tab="messages" label="Inquiries" />
      </div>

      {activeTab === 'messages' ? (
        adminUser ? <MessagesView currentUser={adminUser} /> : null
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="aspect-square bg-white rounded-[2.5rem] animate-pulse" />)
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No reports found</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
                <div className="aspect-video relative overflow-hidden bg-slate-50">
                  <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.title} />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${
                    item.status === ItemStatus.LOST ? 'bg-red-500' : item.status === ItemStatus.FOUND ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}>
                    {item.status}
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.category}</span>
                  <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight">{item.title}</h3>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed flex-grow">{item.description}</p>
                  
                  <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl mb-8 border border-slate-100/50">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm font-black text-xs">{item.posterName[0]}</div>
                    <div>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reporter</p>
                      <p className="text-[10px] font-bold text-slate-700">{item.posterName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {!item.isVerified ? (
                      <>
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="col-span-2 py-4 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          Approve Post
                        </button>
                        <button onClick={() => setEditingItem(item)} className="py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest">Edit</button>
                        <button onClick={() => handleReject(item.id)} className="py-3 bg-red-50 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest">Reject</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingItem(item)} className="py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Edit</button>
                        {item.status !== ItemStatus.RECLAIMED ? (
                          <button onClick={() => handleResolve(item.id)} className="py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Resolve</button>
                        ) : (
                          <div className="py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest text-center border border-slate-200">Archived</div>
                        )}
                        <button onClick={() => handleReject(item.id)} className="col-span-2 py-2 mt-2 text-red-400 hover:text-red-600 font-black text-[8px] uppercase tracking-widest transition-colors">Delete Permanently</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {editingItem && (
        <AdminEditModal 
          item={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;