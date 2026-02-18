
import React, { useState, useEffect } from 'react';
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

  // Fix: Handle async data fetching inside useEffect
  useEffect(() => {
    const loadMessages = async () => {
      if (item) {
        const itemMsgs = await dataStore.getMessagesForItem(currentUser.id, item.id);
        setMessages(itemMsgs);
      }
    };
    loadMessages();
  }, [item, currentUser]);

  if (!item) return null;

  // Fix: Make handleSend async and await the sendMessage call
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col h-[700px] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
              {item.posterName[0]}
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight">{item.posterName}</h3>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Re: {item.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
              <div className="bg-slate-200 p-6 rounded-full mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">Safety First</p>
              <p className="text-sm font-medium leading-relaxed mt-2">Always meet in public campus areas (like the LT halls) for item exchanges. Never share passwords or payment before seeing the item.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${
                  m.senderId === currentUser.id 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-100' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-slate-100'
                }`}>
                  {m.content}
                  <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-tighter opacity-60 flex justify-end`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-slate-50 bg-white">
          <div className="flex space-x-3 bg-slate-50 p-2 rounded-3xl">
            <input 
              type="text" 
              placeholder="Start coordinating the recovery..."
              className="flex-grow px-6 py-4 rounded-2xl bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-slate-700"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;
