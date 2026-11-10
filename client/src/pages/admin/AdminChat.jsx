import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';

const AdminChat = () => {
  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  
  const currentName = String(currentUser.name || currentUser.fullname || currentUser.username || 'Master Admin').trim();
  const currentId = String(currentUser._id || currentUser.id);

  const [activeChat, setActiveChat] = useState('general'); 
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  // NEW: State for Editing Messages
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!editingMsgId) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, activeChat, editingMsgId]);

  const fetchData = async () => {
    try {
      const [msgsRes, usersRes] = await Promise.all([
        api.get('/messages'),
        api.get('/users')
      ]);
      setMessages(msgsRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch chat data", err);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const recipientName = activeChat === 'general' ? 'general' : activeChat.name;

    try {
      await api.post('/messages', {
        text: newMessage,
        senderName: currentName,
        senderRole: 'Admin',
        recipient: recipientName, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      });
      setNewMessage('');
      fetchData();
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  // NEW: Delete Message
  const handleDelete = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/messages/${msgId}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete message. Did you add registerRoute('messages', Message) to your backend?");
    }
  };

  // NEW: Edit Message Setup
  const startEdit = (msg) => {
    setEditingMsgId(msg._id);
    setEditingText(msg.text);
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditingText('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingText.trim()) return;
    try {
      await api.put(`/messages/${editingMsgId}`, { text: editingText });
      setEditingMsgId(null);
      setEditingText('');
      fetchData();
    } catch (err) {
      alert("Failed to update message. Did you add registerRoute('messages', Message) to your backend?");
    }
  };

  const getVisibleMessages = () => {
    if (activeChat === 'general') {
      return messages.filter(msg => msg.recipient === 'general');
    }
    
    const theirName = String(activeChat.name);
    const theirId = String(activeChat._id);

    return messages.filter(msg => {
      const sender = String(msg.senderName);
      const rec = String(msg.recipient);

      const iSentIt = (msg.senderRole === 'Admin' && sender === currentName) && 
                      (rec === theirName || rec === theirId);

      const theySentIt = (sender === theirName) && 
                         (rec === currentName || rec === currentId);

      return iSentIt || theySentIt;
    });
  };

  const getLastMessage = (targetUser) => {
    const theirName = String(targetUser.name);
    const theirId = String(targetUser._id);

    const chatHistory = messages.filter(msg => {
      const sender = String(msg.senderName);
      const rec = String(msg.recipient);

      const iSentIt = (msg.senderRole === 'Admin' && sender === currentName) && 
                      (rec === theirName || rec === theirId);
      const theySentIt = (sender === theirName) && 
                         (rec === currentName || rec === currentId);

      return iSentIt || theySentIt;
    });

    if (chatHistory.length === 0) return "Start a conversation...";
    const lastMsg = chatHistory[chatHistory.length - 1];
    return lastMsg.senderName === currentName ? `You: ${lastMsg.text}` : lastMsg.text;
  };

  if (loading) return <div className="p-10 font-bold text-[#F97316] text-center w-full mt-20 text-xl">Loading Messages...</div>;

  const visibleMessages = getVisibleMessages();
  const chatUsers = users.filter(u => u.name !== currentName);

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans">
      
      {/* Left Sidebar */}
      <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white flex items-center h-[70px] shrink-0">
          <div className="w-10 h-10 bg-[#F97316] text-white flex items-center justify-center font-black rounded-full mr-4 text-lg">
            {currentName.charAt(0).toUpperCase()}
          </div>
          <div><h1 className="text-[17px] font-black text-slate-800 tracking-tight">Messages</h1></div>
        </div>

        <div className="p-2 border-b border-slate-200 bg-white">
          <div className="bg-[#F0F2F5] rounded-lg flex items-center px-4 py-2">
            <svg className="w-4 h-4 text-slate-500 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search or start new chat" className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-700 placeholder-slate-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div onClick={() => setActiveChat('general')} className={`flex items-center p-3 cursor-pointer border-b border-slate-100 transition-colors ${activeChat === 'general' ? 'bg-[#F0F2F5]' : 'hover:bg-slate-50'}`}>
            <div className="w-12 h-12 flex items-center justify-center rounded-full mr-4 font-black text-lg bg-black text-white shrink-0">GF</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-[15px] font-black text-slate-900 truncate">General Feed</h3>
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Now</span>
              </div>
              <p className="text-[13px] font-semibold text-slate-500 truncate">Agency-Wide Channel</p>
            </div>
          </div>

          {chatUsers.map(user => {
            const isActive = activeChat.name === user.name;
            const isAdmin = user.role === 'Admin' || user.name === 'Master Admin';
            const lastMsgPreview = getLastMessage(user);
            return (
              <div key={user._id} onClick={() => setActiveChat(user)} className={`flex items-center p-3 cursor-pointer border-b border-slate-100 transition-colors ${isActive ? 'bg-[#F0F2F5]' : 'hover:bg-slate-50'}`}>
                <div className={`w-12 h-12 flex items-center justify-center rounded-full mr-4 text-xl font-black shrink-0 ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[15px] font-black text-slate-900 truncate">{user.name}</h3>
                  </div>
                  <p className="text-[13px] font-semibold text-slate-500 truncate">{lastMsgPreview}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Window */}
      <div className="flex-1 flex flex-col relative bg-[#efeae2]">
        
        <div className="px-6 h-[70px] bg-white border-b border-slate-200 shrink-0 flex items-center z-10 justify-between">
           <div className="flex items-center">
             <div className="w-10 h-10 bg-[#F97316] text-white flex items-center justify-center font-black rounded-full mr-4">
                {activeChat === 'general' ? '#' : activeChat.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="text-[16px] font-black text-slate-900">{activeChat === 'general' ? 'General Feed' : activeChat.name}</h2>
               <p className="text-[12px] font-bold text-slate-500">{activeChat === 'general' ? 'Agency-Wide Channel' : activeChat.role || 'Member'}</p>
             </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 relative z-10" style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          
          <div className="flex justify-center mb-6">
            <span className="bg-white px-3 py-1 text-[11px] font-black text-slate-500 rounded-md shadow-sm uppercase tracking-widest">Today</span>
          </div>

          {visibleMessages.map((msg, idx) => {
            const isMe = msg.senderRole === 'Admin' && msg.senderName === currentName;
            const isEditingThis = editingMsgId === msg._id;
            
            return (
              <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group w-full`}>
                
                {/* ACTION MENU (Appears on Hover outside the bubble) */}
                {isMe && !isEditingThis && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-2 self-end mb-1">
                    <button onClick={() => startEdit(msg)} className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-[#F97316] hover:border-[#F97316] rounded shadow-sm transition-colors" title="Edit Message">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(msg._id)} className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 rounded shadow-sm transition-colors" title="Delete Message">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}

                <div className={`max-w-[65%] px-4 py-2 rounded-lg shadow-sm relative ${isMe ? 'bg-[#F97316] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}>
                  
                  {activeChat === 'general' && !isMe && (
                    <div className="text-[11px] font-black text-[#3949ab] mb-1">{msg.senderName}</div>
                  )}

                  {isEditingThis ? (
                    <form onSubmit={saveEdit} className="flex flex-col min-w-[200px] mt-1">
                      <textarea 
                        value={editingText} 
                        onChange={(e) => setEditingText(e.target.value)} 
                        className="w-full text-sm text-slate-800 p-2 rounded outline-none border border-orange-300 resize-none shadow-inner" 
                        rows="2" autoFocus 
                      />
                      <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={cancelEdit} className="text-[10px] font-bold uppercase tracking-widest text-orange-200 hover:text-white cursor-pointer">Cancel</button>
                        <button type="submit" className="px-3 py-1 bg-white text-[#F97316] text-[10px] font-black uppercase tracking-widest rounded shadow-sm hover:bg-emerald-400 hover:text-white transition-colors cursor-pointer">Save</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-end gap-3">
                      <p className="text-[14px] font-semibold leading-snug whitespace-pre-wrap">{msg.text}</p>
                      <span className={`text-[10px] font-bold shrink-0 mb-[-2px] ${isMe ? 'text-orange-200' : 'text-slate-400'}`}>{msg.time} {isMe && '✓✓'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-[#F0F2F5] shrink-0 z-10 flex items-center gap-4">
          <svg className="w-6 h-6 text-slate-500 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          <form onSubmit={handleSendMessage} className="flex-1 flex bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200 items-center">
            <input type="text" placeholder="Type a message" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-[15px] font-semibold text-slate-800" />
            <button type="submit" className="ml-2 text-slate-400 hover:text-[#F97316] transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminChat;