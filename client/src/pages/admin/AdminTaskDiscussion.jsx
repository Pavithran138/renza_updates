import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminTaskDiscussion = () => {
  const { type, id } = useParams(); // 'company' or 'client'
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [commentText, setCommentText] = useState('');
  const [commentLink, setCommentLink] = useState('');
  const chatEndRef = useRef(null);

  const endpoint = type === 'client' ? '/clienttasks' : '/tasks';

  useEffect(() => {
    fetchData();
    // Auto-refresh for live chat feel
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [id, type]);

  const fetchData = async () => {
    try {
      const res = await api.get(endpoint);
      const foundTask = res.data.find(t => t._id === id);
      if (foundTask) {
        setTask(foundTask);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load task discussion", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [task?.comments]);

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && !commentLink.trim()) return;

    try {
      const newComment = {
        text: commentText,
        author: 'Master Admin',
        link: commentLink,
        time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      };

      const updatedComments = [...(task.comments || []), newComment];
      
      const res = await api.put(`${endpoint}/${id}`, { comments: updatedComments });
      
      setTask(res.data);
      setCommentText('');
      setCommentLink('');
    } catch (err) {
      alert("Failed to post update to database.");
    }
  };

  if (loading) return <div className="p-10 font-bold text-slate-500">Loading Discussion Thread...</div>;
  if (!task) return <div className="p-10 font-bold text-rose-500">Task not found or deleted.</div>;

  return (
    <div className="flex w-full h-[calc(100vh)] font-sans text-slate-800 bg-slate-50 overflow-hidden">
      
      {/* Left Sidebar: Task Context Data */}
      <div className="w-[400px] shrink-0 border-r border-slate-300 flex flex-col bg-white shadow-sm z-10">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <button onClick={() => navigate(-1)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-black transition-colors mb-6 flex items-center gap-2 cursor-pointer">
            <span>←</span> Back to Pipeline
          </button>
          <h1 className="text-2xl font-black text-black tracking-tight leading-tight mb-2">{task.title}</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#F97316]">
            {type === 'client' ? `Client Deliverable • ${task.client}` : 'Internal Company Task'}
          </p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Task Details</h3>
            <p className="text-sm font-semibold text-slate-700 bg-slate-50 p-4 border border-slate-200 rounded-none">
              {task.description || 'No additional details provided.'}
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Handler</h3>
            <p className="text-sm font-black text-black">{task.assignedTo || 'Unassigned'}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Delivery Deadline</h3>
            <p className="text-sm font-black text-rose-500">{task.deadline || 'No Deadline Set'}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Live Status</h3>
            <span className={`px-4 py-2 text-xs font-black uppercase tracking-widest border rounded-none inline-block ${
               task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
               task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
               'bg-orange-50 text-[#F97316] border-orange-200'
            }`}>
              {task.status}
            </span>
          </div>
        </div>
      </div>

      {/* Right Area: Chat & Links Thread */}
      <div className="flex-1 flex flex-col bg-[#EFEAE2] relative">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-300 bg-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-black tracking-tight">Updates & Link Sharing</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">End-to-End Synced Thread</p>
          </div>
          <div className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-none">
            {task.comments?.length || 0} Updates
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 flex flex-col space-y-6">
            {(!task.comments || task.comments.length === 0) ? (
              <div className="flex justify-center mt-10">
                <div className="bg-white text-slate-600 text-xs font-bold px-6 py-4 rounded-none shadow-sm text-center max-w-sm border border-slate-200">
                  No updates or links shared yet.<br/>Start the discussion below.
                </div>
              </div>
            ) : (
              task.comments.map((c, idx) => {
                const isAdmin = c.author === 'Master Admin';
                
                return (
                  <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[70%] p-4 shadow-sm rounded-none border ${
                      isAdmin ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-300'
                    }`}>
                      <div className="flex items-center gap-3 mb-2 border-b border-current border-opacity-20 pb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-[#F97316]' : 'text-slate-500'}`}>
                          {isAdmin ? 'You (Admin)' : c.author}
                        </span>
                        <span className="text-[10px] font-bold opacity-60 ml-auto">{c.time}</span>
                      </div>
                      
                      {c.text && <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap mb-3">{c.text}</p>}
                      
                      {c.link && (
                        <a href={c.link} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 border rounded-none transition-colors ${
                          isAdmin ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                        }`}>
                          <div className={`w-8 h-8 flex items-center justify-center rounded-none shrink-0 ${isAdmin ? 'bg-[#F97316] text-white' : 'bg-black text-white'}`}>
                            🔗
                          </div>
                          <span className="text-xs font-bold truncate">Click to view attached link</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-300 bg-white shrink-0">
          <form onSubmit={handlePostUpdate} className="flex flex-col gap-4">
            <input 
              type="text" 
              value={commentLink} 
              onChange={(e) => setCommentLink(e.target.value)}
              placeholder="Attach a link (e.g., GitHub, Figma, Drive)..."
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-none text-sm font-bold text-black focus:outline-none focus:border-[#F97316] transition-colors"
            />
            <div className="flex gap-4">
              <textarea 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your status update or message here..."
                rows="2"
                className="flex-1 p-4 bg-slate-50 border border-slate-300 rounded-none text-sm font-bold text-black focus:outline-none focus:border-[#F97316] transition-colors resize-none"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim() && !commentLink.trim()}
                className="px-8 bg-black text-white font-black uppercase tracking-widest text-sm rounded-none hover:bg-[#F97316] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center shadow-md"
              >
                <span>Post</span>
                <span>Update</span>
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default AdminTaskDiscussion;