'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Conversation, Message, User, Item } from '../types';
import { dataStore, ADMIN_ID } from '../services/dataStore';

interface MessagesViewProps {
  currentUser: User;
}

const MessagesView: React.FC<MessagesViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser.id === ADMIN_ID;

  const fetchData = async () => {
    try {
      const [msgData, itemData] = await Promise.all([
        dataStore.getMessages(currentUser.id),
        dataStore.getItems(isAdmin) // Admin sees all items to map titles
      ]);
      setMessages(Array.isArray(msgData) ? msgData : []);
      setItems(Array.isArray(itemData) ? itemData : []);
    } catch (e) {
      console.error("Messages fetch error:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling reduced to 10s for stability
    return () => clearInterval(interval);
  }, [currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConvId, messages]);

  const conversations = useMemo(() => {
    const map = new Map<string, Conversation>();
    messages.forEach(m => {
      if (!m) return;
      const otherUserId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
      const key = `${m.itemId}_${otherUserId}`;
      const item = items.find(i => i.id === m.itemId);
      
      if (!map.has(key)) {
        map.set(key, {
          itemId: m.itemId,
          otherUserId,
          otherUserName: isAdmin 
            ? (m.senderId === ADMIN_ID ? "Student" : (item?.posterName || "AAU User")) 
            : "Support Desk",
          itemTitle: item?.title || "Inquiry",
          lastMessage: m.content || "Image sent",
          lastTimestamp: m.timestamp,
          messages: []
        });
      }
      
      const conv = map.get(key)!;
      conv.messages.push(m);
      if (m.timestamp > conv.lastTimestamp) {
        conv.lastMessage = m.content || "Image sent";
        conv.lastTimestamp = m.timestamp;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }, [messages, items, currentUser.id, isAdmin]);

  const activeConv = conversations.find(c => `${c.itemId}_${c.otherUserId}` === selectedConvId);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || (!inputText.trim() && !selectedImageUrl)) return;

    setIsSending(true);
    try {
      await dataStore.sendMessage({
        senderId: currentUser.id,
        receiverId: activeConv.otherUserId,
        itemId: activeConv.itemId,
        content: inputText.trim(),
        imageUrl: selectedImageUrl || undefined
      });
      setInputText('');
      setSelectedImageUrl(null);
      fetchData();
    } catch (e) {
      console.error("Message send error:", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex h-[600px] sm:h-[700px] relative">
      {/* Sidebar - Conversation List */}
      <div className={`${selectedConvId ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-slate-100 flex-col bg-slate-50/30`}>
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter leading-none">
            {isAdmin ? 'User Inquiries' : 'Support Desk'}
          </h2>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 ? (
            <div className="p-10 text-center opacity-40">
              <p className="text-[10px] font-black uppercase tracking-widest">No inquiries yet</p>
            </div>
          ) : conversations.map(conv => {
            const key = `${conv.itemId}_${conv.otherUserId}`;
            const active = selectedConvId === key;
            return (
              <button 
                key={key}
                onClick={() => setSelectedConvId(key)}
                className={`w-full text-left p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] transition-all flex items-center space-x-4 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'hover:bg-white text-slate-600'}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center font-black ${active ? 'bg-white/20' : 'bg-slate-900 text-white'}`}>
                  {conv.otherUserName ? conv.otherUserName[0] : '?'}
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex justify-between items-center">
                    <p className={`font-black text-sm truncate ${active ? 'text-white' : 'text-slate-800'}`}>{conv.otherUserName}</p>
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest truncate ${active ? 'text-blue-100' : 'text-slate-400'}`}>{conv.itemTitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className={`${selectedConvId ? 'fixed inset-0 z-[200] bg-white sm:relative sm:inset-auto sm:z-0 sm:flex' : 'hidden lg:flex'} flex-grow flex flex-col`}>
        {activeConv ? (
          <>
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSelectedConvId(null)} className="lg:hidden p-2 -ml-2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black">{activeConv.otherUserName ? activeConv.otherUserName[0] : '?'}</div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{activeConv.otherUserName}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">{activeConv.itemTitle}</p>
                </div>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-4 bg-slate-50/20"
            >
              {activeConv.messages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-5 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm leading-relaxed overflow-hidden ${
                    m.senderId === currentUser.id 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.imageUrl && (
                      <img src={m.imageUrl} alt="Attached" className="w-full h-auto rounded-lg mb-2 max-h-80 object-cover" />
                    )}
                    {m.content && <div>{m.content}</div>}
                    <div className={`text-[8px] mt-1.5 opacity-60 flex justify-end font-bold`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 sm:p-6 bg-white border-t border-slate-100 pb-safe space-y-3">
              {selectedImageUrl && (
                <div className="relative inline-block ml-2">
                  <img src={selectedImageUrl} className="w-24 h-24 object-cover rounded-xl border border-slate-200" alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => setSelectedImageUrl(null)} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}

              <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImagePick} 
                />
                <input 
                  type="text" 
                  className="flex-grow bg-transparent border-none py-3 px-2 focus:ring-0 text-sm font-bold text-slate-700"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={isSending || (!inputText.trim() && !selectedImageUrl)}
                  className="bg-blue-600 text-white p-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSending ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-50/10">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Select a session to coordinate recovery</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;