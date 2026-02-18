
import React from 'react';
import { Item, ItemStatus } from '../types';

interface ItemDetailsModalProps {
  item: Item | null;
  onClose: () => void;
  onMessage: (item: Item) => void;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ item, onClose, onMessage }) => {
  if (!item) return null;

  const isLost = item.status === ItemStatus.LOST;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 lg:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto flex flex-col lg:flex-row max-h-[90vh] lg:max-h-[600px]">
        {/* Image Section */}
        <div className="lg:w-1/2 h-64 lg:h-full relative overflow-hidden bg-slate-100 shrink-0">
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
          <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
            isLost ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {item.status}
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-grow p-6 lg:p-10 overflow-y-auto flex flex-col">
          <div className="hidden lg:flex justify-end mb-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-2xl transition-all text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-blue-600 text-[10px] lg:text-xs font-black uppercase tracking-widest mb-2">{item.category}</p>
            <h2 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight leading-tight">{item.title}</h2>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-xs font-bold text-slate-600">{item.location}</span>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-xs font-bold text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex-grow mb-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Item Description</h4>
            <p className="text-slate-600 text-sm lg:text-base font-medium leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
                {item.posterName[0]}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Posted by</p>
                <p className="text-xs font-bold text-slate-700">{item.posterName}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                onClose();
                onMessage(item);
              }}
              className="w-full py-4 lg:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl lg:rounded-[1.5rem] font-black shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <span>Message Poster</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
