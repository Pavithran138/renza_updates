import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const MemberTeamDetails = () => {
  const { id } = useParams(); // Team ID
  const navigate = useNavigate();
  
  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = currentUser.name || currentUser.fullname || currentUser.username || 'Member';

  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000); // 4-second chat sync
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    try {
      const [teamsRes, msgsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/messages')
      ]);
      const foundTeam = teamsRes.data.find(t => t._id === id);
      if (foundTeam) setTeam(foundTeam);

      // Filter messages where the recipient is THIS team's ID
      const teamMessages = msgsRes.data.filter(msg => msg.recipient === id);
      setMessages(teamMessages);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch team details", err);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post('/messages', {
        text: newMessage,
        senderName: currentName,
        senderRole: 'Member',
        recipient: id, // Route specifically to this team
        time: new Date().toLocaleString()
      });
      setNewMessage('');
      fetchData();
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  if (loading) return <div className="p-10 font-bold text-[#3949ab] text-center w-full mt-20 text-xl tracking-widest uppercase">Syncing Workspace...</div>;
  if (!team) return <div className="p-10 text-center font-bold text-rose-600">Team not found.</div>;

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans">
      
      {/* Left Sidebar: Team Roster (Read-Only) */}
      <div className="w-1/3 min-w-[350px] bg-white border-r border-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-300 bg-slate-50 flex items-center gap-4 shrink-0">
          <button onClick={() => navigate('/member/team')} className="p-2 hover:bg-slate-200 transition-colors rounded-none cursor-pointer">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">Team Workspace</h1>
            <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest">Live Sync Enabled</p>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Squad Name</p>
            <h2 className="text-2xl font-black text-black leading-tight uppercase">{team.name}</h2>
            <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-[#3949ab] border border-indigo-100 text-[10px] font-black uppercase tracking-widest rounded-none">{team.specialty || 'General'}</span>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Active Roster ({team.members?.length || 0})</p>
            <div className="space-y-3">
              {team.members?.map((member, idx) => {
                const memberName = typeof member === 'string' ? member : member.name;
                return (
                  <div key={idx} className="flex items-center p-3 border border-slate-200 bg-slate-50 rounded-none">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-black rounded-none mr-3">
                      {memberName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{memberName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Internal Team Chat */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        <div className="p-4 bg-white border-b border-slate-300 shadow-sm shrink-0 flex justify-between items-center z-10">
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Internal Collaboration</h2>
           <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Encrypted
           </span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              <p className="font-bold text-sm">Team chat is empty. Start the discussion!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderName === currentName;
              const isAdmin = msg.senderRole === 'Admin';
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-4 rounded-none shadow-sm border ${isMe ? 'bg-black text-white border-black' : isAdmin ? 'bg-indigo-50 border-indigo-200' : 'bg-white text-slate-800 border-slate-300'}`}>
                    <div className="flex items-center gap-3 mb-2 border-b border-black/10 pb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-[#F97316]' : isAdmin ? 'text-[#3949ab]' : 'text-slate-800'}`}>
                        {msg.senderName} {isAdmin && '(Admin)'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-300 shrink-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
            <input 
              type="text" 
              placeholder="Message your team..." 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
              className="flex-1 bg-slate-50 border border-slate-300 p-4 text-sm font-bold text-slate-800 outline-none focus:border-[#3949ab] focus:ring-1 focus:ring-[#3949ab] rounded-none transition-all"
            />
            <button type="submit" className="px-8 bg-[#3949ab] hover:bg-[#F97316] text-white font-black uppercase tracking-widest text-xs transition-colors rounded-none cursor-pointer">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberTeamDetails;