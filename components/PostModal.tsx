
import React, { useState, useRef } from 'react';
import { ItemStatus, Category, User } from '../types';
import { AAU_LOCATIONS } from '../constants';
import { dataStore } from '../services/dataStore';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: User;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, onSuccess, currentUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: Category.OTHERS,
    location: AAU_LOCATIONS[0],
    date: new Date().toISOString().split('T')[0],
    status: ItemStatus.FOUND,
    imageUrl: ''
  });

  if (!isOpen) return null;

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
    if (!formData.imageUrl) {
      alert("Please upload an image of the item.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await dataStore.saveItem({
        ...formData,
        posterId: currentUser.id,
        posterName: currentUser.name
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("MongoDB Save Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-2 lg:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
        <div className="px-6 lg:px-10 py-6 lg:py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl lg:text-3xl font-black text-slate-800 tracking-tight">Report Item</h2>
            <p className="text-[10px] lg:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Saving to Cloud</p>
          </div>
          <button onClick={onClose} className="p-2 lg:p-3 hover:bg-white hover:shadow-md rounded-xl lg:rounded-2xl transition-all text-slate-400">
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-10 space-y-6 lg:space-y-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
             <button
              type="button"
              onClick={() => setFormData({ ...formData, status: ItemStatus.FOUND })}
              className={`py-4 lg:py-5 rounded-2xl lg:rounded-3xl border-2 font-black transition-all flex flex-col items-center justify-center space-y-1 lg:space-y-2 ${
                formData.status === ItemStatus.FOUND 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100 scale-105' 
                : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0'
              }`}
            >
              <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-xs lg:text-base">Found</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: ItemStatus.LOST })}
              className={`py-4 lg:py-5 rounded-2xl lg:rounded-3xl border-2 font-black transition-all flex flex-col items-center justify-center space-y-1 lg:space-y-2 ${
                formData.status === ItemStatus.LOST 
                ? 'bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-100 scale-105' 
                : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0'
              }`}
            >
              <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="text-xs lg:text-base">Lost</span>
            </button>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div>
              <label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Upload Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-32 lg:h-48 rounded-2xl lg:rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                  formData.imageUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-[11px] lg:text-sm font-bold text-slate-500">Tap to upload</p>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Title</label>
              <input 
                required
                type="text" 
                placeholder="Item name"
                className="w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs lg:text-sm font-bold"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Location</label>
              <select 
                className="w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-xs lg:text-sm font-black text-slate-600 cursor-pointer"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
              <textarea 
                required
                rows={3}
                placeholder="Details..."
                className="w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none text-xs lg:text-sm font-bold"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 lg:py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl lg:rounded-3xl font-black shadow-2xl shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center text-base lg:text-lg tracking-tight ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Syncing with Atlas...' : 'Publish Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
