
import React from 'react';
import { Item, ItemStatus } from '../types';

interface ItemCardProps {
  item: Item;
  onMessage: (item: Item) => void;
  onViewDetails: (item: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onMessage, onViewDetails }) => {
  const isLost = item.status === ItemStatus.LOST;

  return (
    <article 
      className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,51,102,0.1)] transition-all group flex flex-col h-full active:scale-[0.98]"
      aria-label={`${item.status} item: ${item.title}`}
    >
      <div 
        className="relative h-56 overflow-hidden cursor-pointer bg-slate-100"
        onClick={() => onViewDetails(item)}
      >
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
            isLost ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
          }`}>
            {item.status}
          </div>
        </div>
        
        {/* Category Overlay */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-white/30 backdrop-blur-xl border border-white/20 text-[8px] font-black uppercase text-white rounded-lg tracking-[0.15em]">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div 
          className="cursor-pointer mb-4"
          onClick={() => onViewDetails(item)}
        >
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight">{item.title}</h3>
          </div>
          <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {item.location}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-auto pt-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                {item.posterName[0]}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.posterName.split(' ')[0]}</span>
            </div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMessage(item);
            }}
            className="w-full py-4 rounded-2xl text-[10px] font-black transition-all bg-slate-900 text-white hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 flex items-center justify-center uppercase tracking-widest active:scale-[0.97]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Direct Message
          </button>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
