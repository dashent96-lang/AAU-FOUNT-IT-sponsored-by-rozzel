
import React, { useState, useEffect } from 'react';
import { Conversation, Message, User } from '../types';
import { dataStore } from '../services/dataStore';

interface MessagesViewProps {
  currentUser: User;
}

const MessagesView: React.FC<MessagesViewProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');

  // Fix: Make refresh async to await dataStore.getConversations
  const refresh = async () => {
    const convs = await dataStore.getConversations(currentUser.id);
    setConversations(convs);
    if (selectedConv) {
      const updated = convs.find(c => c.itemId === selectedConv.itemId && c.otherUserId === selectedConv.otherUserId);
      if (updated) setSelectedConv(updated);
    }
  };

  useEffect(() => {
    refresh();
  }, [currentUser.id]);

  // Fix: Make handleSend async and await the sendMessage call
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !inputText.trim()) return;

    await dataStore.sendMessage({
      senderId: currentUser.id,
      receiverId: selectedConv.otherUserId,
      itemId: selectedConv.itemId,
      content: inputText.trim()
    });

    setInputText('');
    await refresh();
  };

  return (
    <div className="bg-white rounded-2xl lg:rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex h-[calc(100vh-12rem)] lg:h-[700px]">
      {/* Conversations Sidebar - Hidden on mobile if a chat is selected */}
      <div className={`${selectedConv ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-slate-100 flex-col bg-slate-50/50`}>
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-white">
          <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">Chat Inbox</h2>
        </div>
        <div className="flex-grow overflow-y-auto p-2 lg:p-4 space-y-2">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={`${conv.itemId}_${conv.otherUserId}`}
                onClick={() => setSelectedConv(conv)}
                className={`w-full text-left p-4 lg:p-5 rounded-2xl lg:rounded-[2rem] transition-all flex items-center space-x-3 lg:space-x-4 ${
                  selectedConv?.itemId === conv.itemId && selectedConv?.otherUserId === conv.otherUserId
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 lg:scale-[1.02]'
                    : 'hover:bg-white text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-[1.25rem] flex-shrink-0 flex items-center justify-center text-xs lg:text-base font-black shadow-sm ${
                   selectedConv?.itemId === conv.itemId && selectedConv?.otherUserId === conv.otherUserId
                   ? 'bg-blue-500 text-white'
                   : 'bg-white text-blue-600 border border-slate-100'
                }`}>
                  {conv.otherUserName[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`font-black text-xs lg:text-sm truncate ${
                       selectedConv?.itemId === conv.itemId && selectedConv?.otherUserId === conv.otherUserId
                       ? 'text-white'
                       : 'text-slate-800'
                    }`}>{conv.otherUserName}</h4>
                    <span className={`text-[9px] lg:text-[10px] font-bold shrink-0 ml-2 ${
                       selectedConv?.itemId === conv.itemId && selectedConv?.otherUserId === conv.otherUserId
                       ? 'text-blue-200'
                       : 'text-slate-400'
                    }`}>
                      {new Date(conv.lastTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest truncate mb-0.5 ${
                     selectedConv?.itemId === conv.itemId && selectedConv?.otherUserId === conv.otherUserId
                     ? 'text-blue-100'
                     : 'text-blue-500'
                  }`}>{conv.itemTitle}</p>
                  <p className="text-[11px] lg:text-xs truncate font-medium opacity-80">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center opacity-30 mt-10">
              <p className="text-xs lg:text-sm font-black uppercase tracking-widest">No Active Chats</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel - Full screen on mobile if a chat is selected */}
      <div className={`${selectedConv ? 'flex' : 'hidden lg:flex'} flex-grow flex-col bg-white`}>
        {selectedConv ? (
          <>
            <div className="p-4 lg:p-6 border-b border-slate-50 flex items-center space-x-3 bg-white/50 shadow-sm z-10">
              {/* Back button on mobile */}
              <button 
                onClick={() => setSelectedConv(null)}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <div className="flex items-center space-x-3 lg:space-x-4 flex-grow min-w-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black shadow-inner flex-shrink-0">
                  {selectedConv.otherUserName[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-800 text-sm lg:text-base tracking-tight truncate">{selectedConv.otherUserName}</h3>
                  <div className="flex items-center truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 flex-shrink-0"></span>
                    <span className="text-[9px] lg:text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">Regarding {selectedConv.itemTitle}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 lg:p-10 space-y-4 lg:space-y-6 bg-slate-50/20">
              {selectedConv.messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] lg:max-w-[75%] px-4 lg:px-6 py-3 lg:py-4 rounded-2xl lg:rounded-[2rem] text-xs lg:text-sm shadow-sm font-medium leading-relaxed ${
                    m.senderId === currentUser.id 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-50' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-slate-50'
                  }`}>
                    {m.content}
                    <div className="text-[8px] lg:text-[9px] mt-1.5 font-bold uppercase tracking-tighter opacity-60 flex justify-end">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 lg:p-8 bg-white border-t border-slate-50">
              <div className="flex items-center space-x-2 lg:space-x-4 bg-slate-100 rounded-2xl lg:rounded-[2.5rem] px-4 lg:px-6 py-1.5 lg:py-2 shadow-inner">
                <input 
                  type="text" 
                  placeholder="Ask a question..."
                  className="flex-grow bg-transparent border-none py-3 lg:py-4 focus:ring-0 outline-none text-xs lg:text-sm font-bold text-slate-700"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-blue-600 text-white p-2.5 lg:p-4 rounded-xl lg:rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-90"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40 grayscale">
            <div className="bg-slate-50 w-20 h-20 lg:w-32 lg:h-32 rounded-[2rem] lg:rounded-[3rem] flex items-center justify-center mb-6 lg:mb-10 shadow-inner">
              <svg className="w-10 h-10 lg:w-16 lg:h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-3xl font-black text-slate-800 mb-2 lg:mb-4 tracking-tighter">Start Chatting</h3>
            <p className="text-xs lg:text-base text-slate-500 max-w-xs font-medium leading-relaxed">Recovering lost items starts with a hello. Choose a chat to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
