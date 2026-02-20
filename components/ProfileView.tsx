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
    <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:border-blue-100 hover:shadow-lg">
      <span className={`text-xl sm:text-4xl font-black ${color} mb-0.5 group-hover:scale-110 transition-transform`}>{value}</span>
      <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-16 animate-in fade-in duration-700 max-w-6xl mx-auto px-1">
      {/* Profile Header */}
      <section className="bg-white rounded-[2rem] sm:rounded-[4rem] border border-slate-200 overflow-hidden shadow-xl relative">
        <div className="h-32 sm:h-72 bg-gradient-to-br from-blue-700 via-indigo-600 to-slate-900 relative">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 to-transparent"></div>
          </div>
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-xs uppercase tracking-widest hover:bg-white hover:text-blue-700 transition-all shadow-2xl"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        <div className="px-5 sm:px-16 lg:px-24 pb-8 sm:pb-20 -mt-12 sm:-mt-32 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-12">
            <div className="relative shrink-0 mx-auto lg:mx-0">
              <div 
                onClick={() => isEditing && avatarInputRef.current?.click()}
                className={`w-24 h-24 sm:w-64 sm:h-64 rounded-[1.5rem] sm:rounded-[5rem] border-[4px] sm:border-[16px] border-white shadow-2xl overflow-hidden bg-slate-100 relative group transition-all duration-500 ${isEditing ? 'cursor-pointer hover:rotate-3 active:scale-95' : ''}`}
              >
                <img 
                  src={formData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 sm:w-12 sm:h-12 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  </div>
                )}
              </div>
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarFileChange} />
            </div>
            
            <div className="mt-4 sm:mt-6 lg:mt-0 flex-grow text-center lg:text-left">
              {!isEditing ? (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight sm:leading-[0.9]">{currentUser.name}</h2>
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-1.5 mt-2 sm:mt-4">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-lg font-black text-[7px] sm:text-[11px] uppercase tracking-widest">{currentUser.level || 'Student'}</span>
                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-black text-[7px] sm:text-[11px] uppercase tracking-widest">{currentUser.faculty || 'Ambrose Alli Univ'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-xl mx-auto lg:mx-0">
                    <InfoTile label="Meeting Spot" value={currentUser.preferredMeetingSpot || 'Flexible'} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>} color="text-blue-600" />
                    <InfoTile label="Social Handle" value={currentUser.socialHandle || 'Hub Only'} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} color="text-emerald-600" />
                  </div>

                  <p className="text-slate-500 font-medium text-[10px] sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 italic border-l-2 sm:border-l-4 border-blue-200 pl-4 sm:pl-6 py-1">
                    "{currentUser.bio || "Dedicated member of the AAU recovery network."}"
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-black text-[8px] sm:text-xs uppercase tracking-widest border border-blue-100">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <span>Editing Identity</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10 pt-8 sm:pt-16 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-4 sm:space-y-6">
                <FormGroup label="Full Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Academic Level</label>
                    <select 
                      className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 outline-none text-xs"
                      value={formData.level}
                      onChange={e => setFormData({ ...formData, level: e.target.value })}
                    >
                      <option value="">N/A</option>
                      <option value="100L">100L</option>
                      <option value="200L">200L</option>
                      <option value="300L">300L</option>
                      <option value="400L">400L</option>
                      <option value="500L">500L</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  <FormGroup label="ID Number" value={formData.studentId} onChange={v => setFormData({ ...formData, studentId: v })} />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Preferred Location</label>
                  <select 
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 outline-none text-xs"
                    value={formData.preferredMeetingSpot}
                    onChange={e => setFormData({ ...formData, preferredMeetingSpot: e.target.value })}
                  >
                    {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Bio / Slogan</label>
                  <textarea 
                    rows={2}
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 outline-none resize-none text-xs"
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className={`w-full py-4 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-95 transition-all ${isSaving ? 'opacity-50' : ''}`}
                >
                  {isSaving ? 'Updating...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-8 px-1">
        <StatCard label="Found" value={stats.found} color="text-emerald-500" />
        <StatCard label="Lost" value={stats.lost} color="text-red-500" />
        <StatCard label="Resolved" value={stats.reclaimed} color="text-blue-600" />
      </div>

      {/* Item History */}
      <section className="px-1">
        <div className="flex items-end justify-between mb-6 sm:mb-10">
          <div>
            <h3 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Your Reports</h3>
            <p className="text-slate-500 font-medium text-[9px] sm:text-base mt-1.5">Manage your active and pending submissions.</p>
          </div>
          <div className="bg-white border border-slate-100 px-3 py-1.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[7px] sm:text-xs uppercase tracking-widest text-slate-500 shadow-sm flex items-center space-x-1 sm:space-x-2">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
             <span>{myItems.length} Posts</span>
          </div>
        </div>

        {myItems.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
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
          <div className="bg-white rounded-[2rem] sm:rounded-[4rem] border-2 border-dashed border-slate-100 p-12 sm:p-24 text-center group transition-all hover:border-blue-100">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200 group-hover:text-blue-500 transition-all">
              <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h4 className="text-base sm:text-2xl font-black text-slate-300 uppercase tracking-tight">Empty Archive</h4>
            <p className="text-slate-400 text-[9px] sm:text-base font-medium mt-2 max-w-xs mx-auto leading-relaxed">No reports yet. If you found something, use the Post button.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const InfoTile = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="flex items-center space-x-3 bg-slate-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm shrink-0">
    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center ${color} shadow-sm shrink-0`}>
      {icon}
    </div>
    <div className="text-left overflow-hidden">
      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1"> {label} </p>
      <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

const FormGroup = ({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) => (
  <div>
    <label className="block text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input 
      type="text" 
      className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 outline-none text-xs"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default ProfileView;