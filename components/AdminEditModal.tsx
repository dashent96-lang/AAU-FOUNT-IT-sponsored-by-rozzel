import React, { useState, useRef } from 'react';
import { Item, ItemStatus, Category } from '../types';
import { AAU_LOCATIONS } from '../constants';
import { dataStore } from '../services/dataStore';

interface AdminEditModalProps {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminEditModal: React.FC<AdminEditModalProps> = ({ item, onClose, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.location,
    status: item.status,
    imageUrl: item.imageUrl
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dataStore.updateItem(item.id, formData);
      alert("Post updated successfully.");
      onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to update post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none font-bold text-slate-800 text-xs";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Edit Report</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer"
            >
              <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-black uppercase">Change Photo</span>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Status</label>
                <select 
                  className={inputStyles}
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as ItemStatus})}
                >
                  <option value={ItemStatus.LOST}>Lost</option>
                  <option value={ItemStatus.FOUND}>Found</option>
                  <option value={ItemStatus.RECLAIMED}>Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Category</label>
                <select 
                  className={inputStyles}
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as Category})}
                >
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                className={inputStyles}
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Location</label>
              <select 
                className={inputStyles}
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              >
                {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Description</label>
              <textarea 
                rows={3}
                className={inputStyles + " resize-none"}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            {isSubmitting ? 'Updating...' : 'Update Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditModal;