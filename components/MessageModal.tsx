import React, { useState, useEffect, useRef } from 'react';
import { Item, Message, User } from '../types';
import { dataStore } from '../services/dataStore';

interface MessageModalProps {
  item: Item | null;
  onClose: () => void;
  currentUser: User;
}

const MessageModal: React.FC<MessageModalProps> = ({ item, onClose, currentUser }) => {
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (item) {
        const itemMsgs = await dataStore.getMessagesForItem(currentUser.id, item.id);
        setMessages(itemMsgs);
      }
    };
    loadMessages();
  }, [item, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!item) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const newMsg = await dataStore.sendMessage({
        senderId: currentUser.id,
        receiverId: item.posterId,
        itemId: item.id,
        content: content.trim()
      });

      setMessages(prev => [...prev, newMsg]);
      setContent('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-md sm:p-4">
      <div className="bg-white w-full h-full sm:h-[750px] sm:max-w-lg sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
        {/* Immersive Header */}
        <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose} 
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 sm:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
              {item.posterName[0]}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-800 text-sm truncate">{item.posterName}</h3>
              <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest truncate">Re: {item.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="hidden sm:flex p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-5 sm:p-8 space-y-4 bg-slate-50/20"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-50 p-6 rounded-[2rem] mb-4 text-blue-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Private Session</p>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Connect with {item.posterName} to coordinate recovery.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                  m.senderId === currentUser.id 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {m.content}
                  <div className="text-[8px] mt-1 opacity-60 flex justify-end">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messaging Bar */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 bg-white border-t border-slate-100 pb-safe">
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl">
            <input 
              type="text" 
              placeholder="Type your message..."
              className="flex-grow px-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-slate-800"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!content.trim()}
              className={`p-3 rounded-xl transition-all active:scale-90 ${
                content.trim() 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-200 text-slate-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;