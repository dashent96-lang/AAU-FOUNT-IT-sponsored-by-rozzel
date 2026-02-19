
'use client';

import React, { useState, useRef } from 'react';
import { User, Item, ItemStatus } from '../types';
import { dataStore } from '../services/dataStore';
import { AAU_LOCATIONS } from '../constants';
import ItemCard from './ItemCard';

interface ProfileViewProps {
  currentUser: User;
  onUpdate: (user: User) => void;
  myItems: Item[];
  onMessage: (item: Item) => void;
  onViewDetails: (item: Item) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdate, myItems, onMessage, onViewDetails }) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: currentUser.name,
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

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Profile Header Card */}
      <section className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl relative">
        <div className="h-64 bg-gradient-to-br from-blue-800 via-indigo-700 to-slate-900 relative">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-blue-700 transition-all z-10 shadow-2xl"
          >
            {isEditing ? 'Discard Changes' : 'Customize Profile'}
          </button>
        </div>
        
        <div className="px-10 lg:px-20 pb-16 -mt-32 relative">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-12 mb-12">
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div 
                onClick={() => isEditing && avatarInputRef.current?.click()}
                className={`w-56 h-56 rounded-[4rem] border-[12px] border-white shadow-2xl overflow-hidden bg-slate-100 relative group transition-all duration-500 ${isEditing ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
              >
                <img 
                  src={formData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Upload New</span>
                  </div>
                )}
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarFileChange} />
            </div>
            
            <div className="mt-8 lg:mt-0 flex-grow text-center lg:text-left">
              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-tight">{currentUser.name}</h2>
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 mt-3">
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200">{currentUser.level || 'Freshman'}</span>
                      <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">{currentUser.faculty || 'AAU Student'}</span>
                      <span className="text-slate-400 font-bold text-xs">#{currentUser.studentId || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Safe Zone</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{currentUser.preferredMeetingSpot || 'Anywhere on Campus'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Social Connection</p>
                        <p className="text-sm font-bold text-slate-700">{currentUser.socialHandle || 'Direct Message Only'}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl italic border-l-4 border-blue-100 pl-6">
                    {currentUser.bio || "Craft your biography to help others identify you during the recovery process."}
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-blue-50 text-blue-600 font-black text-[11px] uppercase tracking-widest border border-blue-100 shadow-sm">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                    <span>Editing Community Profile</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 border-t border-slate-100 animate-in slide-in-from-top-10 duration-500">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Level / Year</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none cursor-pointer"
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="">Select Level</option>
                    <option value="100L">100 Level</option>
                    <option value="200L">200 Level</option>
                    <option value="300L">300 Level</option>
                    <option value="400L">400 Level</option>
                    <option value="500L">500 Level</option>
                    <option value="600L">600 Level</option>
                    <option value="PG">Post Graduate</option>
                    <option value="Staff">University Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Faculty</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Faculty of Engineering"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none"
                    value={formData.faculty}
                    onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Department</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Computer Science"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Safe Meeting Spot</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none cursor-pointer"
                    value={formData.preferredMeetingSpot}
                    onChange={e => setFormData({ ...formData, preferredMeetingSpot: e.target.value })}
                  >
                    {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Student ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AAU/123/..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none"
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">WhatsApp / Contact</label>
                  <input 
                    type="text" 
                    placeholder="+234..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Bio / About Me</label>
                  <textarea 
                    rows={4}
                    placeholder="Briefly introduce yourself..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-700 outline-none resize-none"
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-3 ${isSaving ? 'opacity-50' : ''}`}
                >
                  {isSaving && <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  <span>{isSaving ? 'Updating...' : 'Publish Profile'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Activity Section */}
      <section className="px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Personal Activity Journal</h3>
            <p className="text-slate-500 font-medium text-sm mt-1">Timeline of your contributions to the AAU recovery network.</p>
          </div>
          <div className="bg-white border border-slate-100 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 shadow-sm flex items-center space-x-3">
             <span className="w-2 h-2 rounded-full bg-blue-500"></span>
             <span>{myItems.length} Total Engagements</span>
          </div>
        </div>

        {myItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {myItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onMessage={onMessage} 
                onViewDetails={onViewDetails} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[4rem] border-2 border-dashed border-slate-100 p-24 text-center group">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-300 group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-400 transition-all duration-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Activity feed is blank</h4>
            <p className="text-slate-400 text-sm font-medium mt-3 max-w-sm mx-auto leading-relaxed">Your recovery history and status updates will materialize here once you start helping the community.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileView;
