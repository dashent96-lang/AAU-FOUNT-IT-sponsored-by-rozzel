import React, { useState, useEffect, useMemo } from 'react';
import { Item, ItemStatus, User } from '../types';
import { dataStore, ADMIN_ID } from '../services/dataStore';
import AdminEditModal from './AdminEditModal';
import MessagesView from './MessagesView';

type AdminTab = 'overview' | 'moderation' | 'database' | 'users' | 'support';

const AdminDashboard: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allItems, allUsers] = await Promise.all([
        dataStore.getItems(true),
        dataStore.getAllUsers()
      ]);
      setItems(allItems || []);
      setUsers(allUsers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    const pending = safeItems.filter(i => !i.isVerified).length;
    const active = safeItems.filter(i => i.isVerified && i.status !== ItemStatus.RECLAIMED).length;
    const resolved = safeItems.filter(i => i.status === ItemStatus.RECLAIMED).length;
    const successRate = safeItems.length > 0 
      ? Math.round((resolved / safeItems.length) * 100) 
      : 0;

    return { pending, active, resolved, successRate, total: safeItems.length };
  }, [items]);

  const filteredItems = useMemo(() => {
    let filtered = Array.isArray(items) ? items : [];
    
    if (activeTab === 'moderation') {
      filtered = filtered.filter(i => !i.isVerified);
    } else if (activeTab === 'database') {
      filtered = filtered.filter(i => i.isVerified);
    } else {
      return [];
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        (i.title || '').toLowerCase().includes(s) || 
        (i.posterName || '').toLowerCase().includes(s) ||
        (i.location || '').toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [items, activeTab, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (activeTab !== 'users') return [];
    const s = searchTerm.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s) ||
      (u.studentId && u.studentId.toLowerCase().includes(s))
    );
  }, [users, activeTab, searchTerm]);

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

  const TabButton = ({ tab, label, count, icon }: { tab: AdminTab, label: string, count?: number, icon: React.ReactNode }) => (
    <button 
      onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
      className={`flex items-center space-x-2 sm:space-x-3 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border ${
        activeTab === tab 
        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/10' 
        : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:border-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-md text-[7px] sm:text-[8px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
          {count}
        </span>
      )}
    </button>
  );

  const adminUser = dataStore.getCurrentUser();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-1">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 px-1">
        <div>
          <h2 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">Admin Hub</h2>
          <p className="text-slate-400 text-[8px] sm:text-xs mt-2 font-bold tracking-[0.2em] uppercase flex items-center">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            System Moderation Console
          </p>
        </div>

        {activeTab !== 'overview' && activeTab !== 'support' && (
          <div className="relative w-full lg:w-96">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 outline-none font-bold text-slate-700 text-xs focus:ring-4 focus:ring-blue-600/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 text-slate-300 absolute left-3.5 top-3.5 sm:top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        )}
      </div>

      {/* Navigation Tabs - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 sm:pb-4 no-scrollbar px-1">
        <TabButton tab="overview" label="Overview" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
        <TabButton tab="moderation" label="Queue" count={stats.pending} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
        <TabButton tab="database" label="Database" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>} />
        <TabButton tab="users" label="Users" count={users.length} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <TabButton tab="support" label="Support" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} />
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <SummaryStat label="Total Volume" value={stats.total} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} color="text-slate-900" bg="bg-slate-50" />
              <SummaryStat label="Success Rate" value={`${stats.successRate}%`} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="text-emerald-600" bg="bg-emerald-50" />
              <SummaryStat label="Awaiting Review" value={stats.pending} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01" /></svg>} color="text-amber-500" bg="bg-amber-50" />
              <SummaryStat label="Verified Users" value={users.length} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1" /></svg>} color="text-indigo-600" bg="bg-indigo-50" />
            </div>

            <div className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full"></div>
               <div className="relative z-10 grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">AAU Infrastructure Status</h3>
                    <p className="text-slate-400 font-medium leading-relaxed text-sm">
                      The recovery hub is processing requests from {users.length} authenticated university members. Server uptime remains stable at 99.9%.
                    </p>
                    <div className="flex items-center space-x-6">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Found List</span>
                          <span className="text-2xl sm:text-3xl font-black">{items.filter(i => i.status === ItemStatus.FOUND).length}</span>
                       </div>
                       <div className="w-px h-8 bg-white/10"></div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Lost List</span>
                          <span className="text-2xl sm:text-3xl font-black">{items.filter(i => i.status === ItemStatus.LOST).length}</span>
                       </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                     <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Sync</p>
                        <p className="text-lg font-black">Active</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">DB Mode</p>
                        <p className="text-lg font-black text-emerald-400">Atlas</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                    <th className="hidden sm:table-cell px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Academic</th>
                    <th className="hidden sm:table-cell px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <img src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="" className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{user.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user.faculty || 'Ambrose Alli'}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{user.level || 'Student'}</p>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-right">
                         <span className="text-[10px] font-black text-slate-300">#{user.id.slice(-4)}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-slate-300 font-black uppercase text-[10px]">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'support' && adminUser && <MessagesView currentUser={adminUser} />}

        {(activeTab === 'moderation' || activeTab === 'database') && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1">
            {isLoading ? (
              [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-3xl animate-pulse" />)
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Database state clear</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col h-full hover:shadow-xl transition-all">
                  <div className="aspect-video relative overflow-hidden bg-slate-50">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest text-white ${
                      item.status === ItemStatus.LOST ? 'bg-red-500' : item.status === ItemStatus.FOUND ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}>
                      {item.status}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex-grow space-y-2">
                      <h3 className="text-xs sm:text-base font-black text-slate-900 leading-tight line-clamp-1">{item.title}</h3>
                      <p className="text-slate-500 text-[10px] font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                      <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{item.location}</div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                      {!item.isVerified ? (
                        <button onClick={() => handleApprove(item.id)} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Approve</button>
                      ) : (
                        <button onClick={() => setEditingItem(item)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Edit</button>
                      )}
                      <button onClick={() => handleReject(item.id)} className="w-full py-2 text-red-400 hover:text-red-600 font-black text-[8px] uppercase tracking-widest">Reject</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {editingItem && <AdminEditModal item={editingItem} onClose={() => setEditingItem(null)} onSuccess={fetchData} />}
    </div>
  );
};

const SummaryStat = ({ label, value, icon, color, bg }: { label: string, value: string | number, icon: React.ReactNode, color: string, bg: string }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-2">
      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate pr-2">{label}</p>
      <div className={`w-7 h-7 sm:w-8 sm:h-8 ${bg} ${color} rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
    <span className={`text-lg sm:text-2xl font-black ${color}`}>{value}</span>
  </div>
);

export default AdminDashboard;