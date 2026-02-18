
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Conversation, Message, User } from '../types';

interface MessagesViewProps {
  currentUser: User;
}

const MessagesView: React.FC<MessagesViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const fetchMessages = async () => {
    try {
      const [msgRes, itemRes] = await Promise.all([
        fetch(`/api/messages?userId=${currentUser.id}`),
        fetch('/api/items')
      ]);
      const [msgData, itemData] = await Promise.all([msgRes.json(), itemRes.json()]);
      setMessages(msgData);
      setItems(itemData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling for new messages
    return () => clearInterval(interval);
  }, [currentUser.id]);

  // Group messages into conversations
  const conversations = useMemo(() => {
    const map = new Map<string, Conversation>();
    messages.forEach(m => {
      const otherUserId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
      const key = `${m.itemId}_${otherUserId}`;
      const item = items.find(i => i.id === m.itemId);
      
      if (!map.has(key)) {
        map.set(key, {
          itemId: m.itemId,
          otherUserId,
          otherUserName: item?.posterId === otherUserId ? item.posterName : "AAU User",
          itemTitle: item?.title || "Unknown Item",
          lastMessage: m.content,
          lastTimestamp: m.timestamp,
          messages: []
        });
      }
      
      const conv = map.get(key)!;
      conv.messages.push(m);
      if (m.timestamp > conv.lastTimestamp) {
        conv.lastMessage = m.content;
        conv.lastTimestamp = m.timestamp;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }, [messages, items, currentUser.id]);

  const activeConv = conversations.find(c => `${c.itemId}_${c.otherUserId}` === selectedConvId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !inputText.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: activeConv.otherUserId,
          itemId: activeConv.itemId,
          content: inputText.trim()
        }),
      });
      if (res.ok) {
        setInputText('');
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex h-[700px]">
      {/* Sidebar */}
      <div className={`${selectedConvId ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-slate-100 flex-col bg-slate-50/30`}>
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-800">Inbox</h2>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {conversations.map(conv => {
            const key = `${conv.itemId}_${conv.otherUserId}`;
            const active = selectedConvId === key;
            return (
              <button 
                key={key}
                onClick={() => setSelectedConvId(key)}
                className={`w-full text-left p-5 rounded-[2rem] transition-all flex items-center space-x-4 ${active ? 'bg-blue-600 text-white' : 'hover:bg-white text-slate-600'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black ${active ? 'bg-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                  {conv.otherUserName[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`font-black text-sm truncate ${active ? 'text-white' : 'text-slate-800'}`}>{conv.otherUserName}</p>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 truncate">{conv.itemTitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConvId ? 'flex' : 'hidden lg:flex'} flex-grow flex-col`}>
        {activeConv ? (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSelectedConvId(null)} className="lg:hidden p-2 text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black">{activeConv.otherUserName[0]}</div>
                <div>
                  <h3 className="font-black text-slate-800">{activeConv.otherUserName}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{activeConv.itemTitle}</p>
                </div>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-8 space-y-4 bg-slate-50/20">
              {activeConv.messages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-5 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm ${m.senderId === currentUser.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100">
              <div className="flex space-x-2 bg-slate-100 p-2 rounded-2xl">
                <input 
                  type="text" 
                  className="flex-grow bg-transparent border-none py-3 px-4 focus:ring-0 text-sm font-bold text-slate-700"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white p-4 rounded-xl shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="font-black uppercase tracking-widest text-xs">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
