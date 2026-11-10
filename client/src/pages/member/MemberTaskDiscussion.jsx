import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const MemberTaskDiscussion = () => {
  const { type, id } = useParams(); // type is 'company' or 'client'
  const navigate = useNavigate();
  
  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = currentUser.name || currentUser.fullname || currentUser.username || 'Member';

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Comment Form State
  const [newComment, setNewComment] = useState('');
  const [newLink, setNewLink] = useState('');
  const chatEndRef = useRef(null);

  const endpoint = type === 'client' ? `/clienttasks` : `/tasks`;

  useEffect(() => {
    fetchTask();
    const interval = setInterval(fetchTask, 4000); // 4-second live sync
    return () => clearInterval(interval);
  }, [id, type]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [task?.comments]);

  const fetchTask = async () => {
    try {
      const res = await api.get(endpoint);
      const foundTask = res.data.find(t => t._id === id);
      if (foundTask) setTask(foundTask);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch task", err);
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !newLink.trim()) return;

    const commentData = {
      text: newComment,
      link: newLink,
      author: currentName,
      time: new Date().toLocaleString()
    };

    try {
      const updatedComments = [...(task.comments || []), commentData];
      await api.put(`${endpoint}/${id}`, { comments: updatedComments });
      
      setNewComment('');
      setNewLink('');
      fetchTask(); // Instant refresh
    } catch (err) {
      alert("Failed to post update.");
    }
  };

  if (loading) return <div className="p-10 font-bold text-[#3949ab] text-center w-full mt-20 text-xl tracking-widest uppercase">Syncing Discussion...</div>;
  if (!task) return <div className="p-10 text-center font-bold text-rose-600">Task not found.</div>;

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans">
      
      {/* Left Sidebar: Task Details (Read-Only) */}
      <div className="w-1/3 min-w-[350px] bg-white border-r border-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-300 bg-slate-50 flex items-center gap-4 shrink-0">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 transition-colors rounded-none cursor-pointer">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">Task Thread</h1>
            <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest">Live Sync Enabled</p>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deliverable Title</p>
            <h2 className="text-xl font-black text-black leading-tight">{task.title}</h2>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Context / Client</p>
            <span className="px-3 py-1 bg-indigo-50 text-[#3949ab] border border-indigo-100 text-[10px] font-black uppercase tracking-widest rounded-none">{task.client || 'Internal'}</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
            <p className="text-sm font-bold text-rose-600">{task.deadline || 'No Deadline Set'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Task Brief & Description</p>
            <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">{task.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>

      {/* Right Column: Active Thread */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {(!task.comments || task.comments.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              <p className="font-bold text-sm">Thread is empty. Start the discussion!</p>
            </div>
          ) : (
            task.comments.map((msg, idx) => {
              const isMe = msg.author === currentName;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-5 rounded-none shadow-sm border ${isMe ? 'bg-black text-white border-black' : 'bg-white text-slate-800 border-slate-300'}`}>
                    <div className="flex justify-between items-center mb-2 gap-4 border-b border-white/20 pb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-[#F97316]' : 'text-[#3949ab]'}`}>{msg.author}</span>
                      <span className={`text-[9px] font-bold ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>{msg.time}</span>
                    </div>
                    {msg.text && <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                    {msg.link && (
                      <a href={msg.link.startsWith('http') ? msg.link : `https://${msg.link}`} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 mt-3 px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors rounded-none border ${isMe ? 'bg-white/10 text-white hover:bg-[#F97316] border-white/20' : 'bg-slate-50 text-[#3949ab] hover:bg-[#3949ab] hover:text-white border-slate-200'}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        View Attachment
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-300 shrink-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <form onSubmit={handlePostComment} className="flex flex-col gap-3 max-w-4xl mx-auto">
            <input 
              type="text" 
              placeholder="Paste relevant drive link or URL (Optional)" 
              value={newLink} 
              onChange={e => setNewLink(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-300 p-3 text-xs font-bold text-slate-700 outline-none focus:border-[#3949ab] rounded-none transition-colors"
            />
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Type your update..." 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                className="flex-1 bg-white border border-slate-300 p-4 text-sm font-bold text-slate-800 outline-none focus:border-[#3949ab] focus:ring-1 focus:ring-[#3949ab] rounded-none transition-all shadow-inner"
              />
              <button type="submit" className="px-8 bg-[#3949ab] hover:bg-[#F97316] text-white font-black uppercase tracking-widest text-xs transition-colors rounded-none cursor-pointer shadow-md">
                Post Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberTaskDiscussion;