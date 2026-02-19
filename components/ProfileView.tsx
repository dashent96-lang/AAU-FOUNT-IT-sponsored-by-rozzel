
'use client';

import React, { useState, useRef } from 'react';
import { User, Item, ItemStatus } from '../types';
import { dataStore } from '../services/dataStore';
import { AAU_LOCATIONS, AAU_FACULTIES } from '../constants';
import ItemCard from './ItemCard';

interface ProfileViewProps {
  currentUser: User;
  onUpdate: (user: User) => void;
  myItems: Item[];
  onMessage: (item: Item) => void;
  onViewDetails: (item: Item) => void;
  onRefresh?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdate, myItems, onMessage, onViewDetails, onRefresh }) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: currentUser.name || '',
    department: currentUser.department || '',
    faculty: currentUser.faculty || '',
    level: currentUser.level || '',
    studentId: currentUser.studentId || '',
    phoneNumber: currentUser.phoneNumber || '',
    bio: currentUser.bio || '',
    avatarUrl: currentUser.avatarUrl || '',
    preferredMeetingSpot: currentUser.preferredMeetingSpot || AAU_LOCATIONS[0],
    socialHandle: currentUser.socialHandle || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const stats = {
    found: myItems.filter(i => i.status === ItemStatus.FOUND).length,
    lost: myItems.filter(i => i.status === ItemStatus.LOST).length,
    reclaimed: myItems.filter(i => i.status === ItemStatus.RECLAIMED).length
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await dataStore.updateUser(currentUser.id, formData);
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
      <span className={`text-2xl sm:text-3xl font-black ${color} mb-1`}>{value}</span>
      <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto pb-10">
      {/* Profile Header Card */}
      <section className="bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-xl relative">
        <div className="h-32 sm:h-64 bg-gradient-to-br from-blue-800 via-indigo-700 to-slate-900 relative">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-white/20 backdrop-blur-xl border border-white/30 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-[10px] uppercase tracking-widest hover:bg-white hover:text-blue-700 transition-all z-10 shadow-lg"
          >
            {isEditing ? 'Discard' : 'Edit Profile'}
          </button>
        </div>
        
        <div className="px-6 sm:px-10 lg:px-20 pb-10 sm:pb-16 -mt-12 sm:-mt-32 relative">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-12 mb-8 sm:mb-12">
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div 
                onClick={() => isEditing && avatarInputRef.current?.click()}
                className={`w-28 h-28 sm:w-56 sm:h-56 rounded-[2rem] sm:rounded-[4rem] border-[4px] sm:border-[12px] border-white shadow-2xl overflow-hidden bg-slate-100 relative group transition-all duration-500 ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
              >
                <img 
                  src={formData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 sm:w-10 sm:h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-white text-[7px] sm:text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                  </div>
                )}
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarFileChange} />
            </div>
            
            <div className="mt-4 lg:mt-0 flex-grow text-center lg:text-left">
              {!isEditing ? (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-tight">{currentUser.name}</h2>
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                      <span className="bg-blue-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl font-black text-[7px] sm:text-[10px] uppercase tracking-widest shadow-md">{currentUser.level || 'Freshman'}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl font-black text-[7px] sm:text-[10px] uppercase tracking-widest">{currentUser.faculty || 'AAU Student'}</span>
                      <span className="text-slate-400 font-bold text-[8px] sm:text-xs">ID: {currentUser.studentId || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 max-w-2xl mx-auto lg:mx-0">
                    <div className="flex items-center space-x-3 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Meeting Spot</p>
                        <p className="text-[10px] sm:text-sm font-bold text-slate-700 truncate">{currentUser.preferredMeetingSpot || 'Anywhere'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Connection</p>
                        <p className="text-[10px] sm:text-sm font-bold text-slate-700 truncate">{currentUser.socialHandle || 'Private'}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 font-medium text-xs sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 italic border-l-4 border-blue-100 pl-4 sm:pl-6">
                    {currentUser.bio || "No biography provided yet."}
                  </p>
                </div>
              ) : (
                <div className="py-2 sm:py-4">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-blue-50 text-blue-600 font-black text-[8px] sm:text-[11px] uppercase tracking-widest border border-blue-100 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <span>Customizing Portal Profile</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-12 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Level</label>
                    <select 
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none cursor-pointer"
                      value={formData.level}
                      onChange={e => setFormData({ ...formData, level: e.target.value })}
                    >
                      <option value="">N/A</option>
                      <option value="100L">100L</option>
                      <option value="200L">200L</option>
                      <option value="300L">300L</option>
                      <option value="400L">400L</option>
                      <option value="500L">500L</option>
                      <option value="PG">PG</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Student ID</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none transition-all"
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Faculty</label>
                  <select 
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none cursor-pointer"
                    value={formData.faculty}
                    onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                  >
                    <option value="">Select Faculty</option>
                    {AAU_FACULTIES.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Safe Meeting Spot</label>
                  <select 
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none cursor-pointer"
                    value={formData.preferredMeetingSpot}
                    onChange={e => setFormData({ ...formData, preferredMeetingSpot: e.target.value })}
                  >
                    {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Social Handle</label>
                  <input 
                    type="text" 
                    placeholder="@handle or phone"
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none transition-all"
                    value={formData.socialHandle}
                    onChange={e => setFormData({ ...formData, socialHandle: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bio</label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none resize-none transition-all"
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className={`w-full py-4 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black shadow-xl transition-all hover:bg-blue-700 active:scale-95 flex items-center justify-center space-x-3 ${isSaving ? 'opacity-50' : ''}`}
                >
                  {isSaving && <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  <span>{isSaving ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 px-2">
        <StatCard label="Found" value={stats.found} color="text-emerald-500" />
        <StatCard label="Lost" value={stats.lost} color="text-red-500" />
        <StatCard label="Success" value={stats.reclaimed} color="text-blue-500" />
      </div>

      {/* Activity Section */}
      <section className="px-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 space-y-2 sm:space-y-0">
          <div>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Recovery Timeline</h3>
            <p className="text-slate-500 font-medium text-[10px] sm:text-sm mt-1">Your recent activity on the portal.</p>
          </div>
          <div className="inline-flex bg-white border border-slate-100 px-4 py-2 rounded-xl font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-500 shadow-sm items-center space-x-2 w-fit">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
             <span>{myItems.length} Activities</span>
          </div>
        </div>

        {myItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-10">
            {myItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                currentUser={currentUser}
                onRefresh={onRefresh}
                onMessage={onMessage} 
                onViewDetails={onViewDetails} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] sm:rounded-[4rem] border-2 border-dashed border-slate-100 p-10 sm:p-24 text-center group">
            <div className="w-16 h-16 sm:w-24 h-24 bg-slate-50 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-400 transition-all duration-500">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h4 className="text-lg sm:text-2xl font-black text-slate-300 uppercase tracking-tighter">No Activity Yet</h4>
            <p className="text-slate-400 text-[10px] sm:text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed">Start reporting lost or found items to help the AAU community.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileView;
