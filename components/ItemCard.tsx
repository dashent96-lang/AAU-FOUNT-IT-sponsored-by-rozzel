
import React from 'react';
import { Item, ItemStatus } from '../types';

interface ItemCardProps {
  item: Item;
  onMessage: (item: Item) => void;
  onViewDetails: (item: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onMessage, onViewDetails }) => {
  const isLost = item.status === ItemStatus.LOST;
  
  const displayImage = item.imageUrl || `https://images.unsplash.com/photo-1584931423298-c576fda54bd2?q=80&w=1000&auto=format&fit=crop`;

  return (
    <article 
      className={`relative bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden transition-all duration-500 group flex flex-col h-full active:scale-[0.98] cursor-pointer hover:-translate-y-2 ${
        isLost 
        ? 'hover:shadow-[0_20px_50px_-10px_rgba(239,68,68,0.2)]' 
        : 'hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.2)]'
      }`}
      aria-label={`${item.status} item: ${item.title}`}
      onClick={() => onViewDetails(item)}
    >
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img 
          src={displayImage} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
        
        {/* Status Badge */}
        <div className="absolute top-5 left-5">
          <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-xl backdrop-blur-xl border border-white/30 flex items-center space-x-2 ${
            isLost ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isLost ? 'bg-red-200' : 'bg-emerald-200'}`}></span>
            <span>{item.status}</span>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute bottom-5 left-5">
          <span className="px-4 py-1.5 bg-slate-900/60 backdrop-blur-md border border-white/20 text-[9px] font-bold uppercase text-white rounded-xl tracking-[0.2em]">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow relative">
        {/* Colorful Accent Dot */}
        <div className={`absolute top-8 right-8 w-2 h-2 rounded-full ${isLost ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight tracking-tight mb-2">
            {item.title}
          </h3>
          <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-4">
            <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {item.location}
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shadow-sm">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.posterName}`} alt={item.posterName} />
              </div>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{item.posterName.split(' ')[0]}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMessage(item);
            }}
            className={`w-full py-5 rounded-[1.5rem] text-[11px] font-black transition-all uppercase tracking-[0.2em] active:scale-[0.97] flex items-center justify-center ${
              isLost 
              ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200' 
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-200'
            }`}
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Send Message
          </button>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
