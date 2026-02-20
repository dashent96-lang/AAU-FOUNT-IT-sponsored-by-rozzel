import React, { useState, useEffect, useRef } from 'react';
import { Item, Message, User } from '../types';
import { dataStore, ADMIN_ID } from '../services/dataStore';

interface MessageModalProps {
  item: Item | null;
  onClose: () => void;
  currentUser: User;
}

const MessageModal: React.FC<MessageModalProps> = ({ item, onClose, currentUser }) => {
  const [content, setContent] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser.id === ADMIN_ID;

  useEffect(() => {
    const loadMessages = async () => {
      if (item) {
        const allMsgs = await dataStore.getMessagesForItem(currentUser.id, item.id);
        setMessages(allMsgs);
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
    if (!content.trim() && !selectedImageUrl) return;

    setIsSending(true);
    const receiverId = isAdmin ? item.posterId : ADMIN_ID;

    try {
      const newMsg = await dataStore.sendMessage({
        senderId: currentUser.id,
        receiverId: receiverId,
        itemId: item.id,
        content: content.trim(),
        imageUrl: selectedImageUrl || undefined
      });

      setMessages(prev => [...prev, newMsg]);
      setContent('');
      setSelectedImageUrl(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-md sm:p-4">
      <div className="bg-white w-full h-full sm:h-[750px] sm:max-w-lg sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 sm:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
              {isAdmin ? item.posterName[0] : 'A'}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-800 text-sm truncate">
                {isAdmin ? `User: ${item.posterName}` : 'AAU Support Desk'}
              </h3>
              <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest truncate">Case: {item.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="hidden sm:flex p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 sm:p-8 space-y-4 bg-slate-50/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-50 p-6 rounded-[2rem] mb-4 text-blue-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" /></svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Centralized Support</p>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">Message the recovery hub to coordinate the safe return of this item.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed overflow-hidden ${
                  m.senderId === currentUser.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {m.imageUrl && <img src={m.imageUrl} alt="Attached" className="w-full h-auto rounded-lg mb-2 max-h-64 object-cover" />}
                  {m.content && <div>{m.content}</div>}
                  <div className="text-[8px] mt-1 opacity-60 flex justify-end">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="px-6 py-4 sm:px-10 sm:py-6 bg-white border-t border-slate-50 pb-safe shrink-0 space-y-3">
          {selectedImageUrl && (
            <div className="relative inline-block">
              <img src={selectedImageUrl} className="w-20 h-20 object-cover rounded-xl border border-slate-200" alt="Preview" />
              <button type="button" onClick={() => setSelectedImageUrl(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200/60 shadow-inner group focus-within:ring-4 focus-within:ring-blue-600/5 transition-all">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImagePick} />
            <input 
              type="text" 
              placeholder="Inquire about recovery..."
              className="flex-grow px-2 py-4 bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit" disabled={isSending || (!content.trim() && !selectedImageUrl)} className={`p-4 rounded-2xl transition-all active:scale-90 shadow-lg ${ (content.trim() || selectedImageUrl) && !isSending ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-200 text-slate-400'}`}>
              {isSending ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;