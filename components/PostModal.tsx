
'use client';

import React, { useState, useRef } from 'react';
import { ItemStatus, Category, User } from '../types';
import { AAU_LOCATIONS } from '../constants';

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
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          posterId: currentUser.id,
          posterName: currentUser.name
        }),
      });

      if (!res.ok) throw new Error('Post failed');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Report Item</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Global Recovery Network</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
             <button
              type="button"
              onClick={() => setFormData({ ...formData, status: ItemStatus.FOUND })}
              className={`py-5 rounded-3xl border-2 font-black transition-all flex flex-col items-center justify-center space-y-2 ${
                formData.status === ItemStatus.FOUND 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100' 
                : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0'
              }`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Found Something</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: ItemStatus.LOST })}
              className={`py-5 rounded-3xl border-2 font-black transition-all flex flex-col items-center justify-center space-y-2 ${
                formData.status === ItemStatus.LOST 
                ? 'bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-100' 
                : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0'
              }`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>Lost Something</span>
            </button>
          </div>

          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-56 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                formData.imageUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-sm font-bold text-slate-500">Click to upload item photo</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Item Title</label>
                <input required type="text" placeholder="e.g. Blue Backpack" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-600 cursor-pointer" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}>
                  {AAU_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Description</label>
              <textarea required rows={4} placeholder="Describe the item in detail..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none font-bold" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black shadow-2xl transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}>
            {isSubmitting ? 'Publishing Report...' : 'Publish Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
