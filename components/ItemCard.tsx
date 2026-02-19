
import React from 'react';
import { Item, ItemStatus, User } from '../types';
import { dataStore } from '../services/dataStore';

interface ItemCardProps {
  item: Item;
  onMessage: (item: Item) => void;
  onViewDetails: (item: Item) => void;
  currentUser?: User | null;
  onRefresh?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onMessage, onViewDetails, currentUser, onRefresh }) => {
  const isLost = item.status === ItemStatus.LOST;
  const isResolved = item.status === ItemStatus.RECLAIMED;
  const isOwner = currentUser?.id === item.posterId;
  const displayImage = item.imageUrl || `https://images.unsplash.com/photo-1584931423298-c576fda54bd2?q=80&w=1000&auto=format&fit=crop`;

  const handleResolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Mark this post as resolved? This will disable further messaging.")) return;
    
    try {
      await dataStore.updateItemStatus(item.id, ItemStatus.RECLAIMED);
      if (onRefresh) onRefresh();
    } catch (error) {
      alert("Failed to resolve item.");
    }
  };

  return (
    <article 
      className={`relative bg-white rounded-xl border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer active:scale-[0.98] ${
        isResolved ? 'grayscale opacity-60' : isLost ? 'hover:border-red-100' : 'hover:border-emerald-100'
      }`}
      aria-label={`${item.status} item: ${item.title}`}
      onClick={() => onViewDetails(item)}
    >
      <div className="relative aspect-square sm:aspect-video overflow-hidden bg-slate-50">
        <img 
          src={displayImage} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Compact Status Overlay */}
        <div className="absolute top-1.5 left-1.5 z-10">
          <div className={`px-2 py-0.5 rounded-md text-[6px] sm:text-[7px] font-black uppercase tracking-widest shadow-sm flex items-center space-x-1 ${
            isResolved ? 'bg-slate-700 text-white' : isLost ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {!isResolved && <span className={`w-0.5 h-0.5 rounded-full ${isLost ? 'bg-red-200' : 'bg-emerald-200'} animate-pulse`}></span>}
            <span>{item.status}</span>
          </div>
        </div>

        {isResolved && (
          <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Resolved</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-2 sm:p-3.5 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="text-[11px] sm:text-sm font-black text-slate-800 line-clamp-1 leading-tight mb-0.5">
            {item.title}
          </h3>
          <div className="flex items-center text-[7px] sm:text-[9px] font-bold text-blue-600 uppercase tracking-tight mb-1">
            <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{item.location}</span>
          </div>
          <p className="text-[9px] sm:text-xs text-slate-500 line-clamp-2 font-medium leading-tight">
            {item.description}
          </p>
        </div>

        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.posterName}`} alt={item.posterName} className="w-full h-full" />
            </div>
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[40px]">{item.posterName.split(' ')[0]}</span>
          </div>
          
          <div className="flex space-x-1">
            {isOwner && !isResolved && (
              <button 
                onClick={handleResolve}
                className="px-2 py-1 rounded-md text-[7px] font-black transition-all uppercase tracking-widest bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Resolve
              </button>
            )}
            
            {!isResolved && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage(item);
                }}
                className={`px-2 py-1 rounded-md text-[7px] font-black transition-all uppercase tracking-widest ${
                  isLost 
                  ? 'bg-red-50 text-red-600 active:bg-red-600 active:text-white' 
                  : 'bg-emerald-50 text-emerald-600 active:bg-emerald-600 active:text-white'
                }`}
              >
                Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
