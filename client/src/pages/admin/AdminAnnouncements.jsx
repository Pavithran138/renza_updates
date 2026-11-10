import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminAnnouncements = () => {
  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = String(currentUser.name || currentUser.fullname || currentUser.username || 'Master Admin').trim();

  const [announcements, setAnnouncements] = useState([]);
  const [newNotice, setNewNotice] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/messages');
      // Filter for the global announcements channel and reverse to show newest first
      const notices = res.data.filter(msg => msg.recipient === 'SYSTEM_ANNOUNCEMENTS').reverse();
      setAnnouncements(notices);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
      setLoading(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!newNotice.trim()) return;
    setPublishing(true);

    // If marked as urgent, prepend a tag so the Member side can highlight it later
    const finalMessage = isUrgent ? `[URGENT] ${newNotice}` : newNotice;

    try {
      await api.post('/messages', {
        text: finalMessage,
        senderName: currentName,
        senderRole: 'Admin',
        recipient: 'SYSTEM_ANNOUNCEMENTS', 
        time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      });
      setNewNotice('');
      setIsUrgent(false);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to publish announcement.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this announcement from the company board?")) return;
    try {
      await api.delete(`/messages/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-800 pb-10">
      
      {/* Header */}
      <div className="p-6 sm:p-10 pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-black text-black tracking-tight">Company Announcements</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Publish official notices and agency-wide bulletins</p>
      </div>

      <div className="flex-1 w-full px-4 sm:px-8 mt-8 max-w-[1200px] mx-auto space-y-10">
        
        {/* Publishing Module */}
        <div className="bg-slate-50 border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-[#F97316]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Draft New Notice</h2>
          </div>
          
          <form onSubmit={handlePublish}>
            <textarea 
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              placeholder="Enter official announcement details here..."
              className="w-full h-32 bg-white border border-slate-300 p-4 text-sm font-medium text-slate-800 outline-none focus:border-[#F97316] resize-none mb-4 shadow-inner rounded-none"
              required
            />
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isUrgent} 
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 accent-[#F97316] cursor-pointer"
                />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors">Mark as High Priority</span>
              </label>
              <button 
                type="submit" 
                disabled={publishing}
                className="px-8 py-3 bg-[#F97316] hover:bg-black text-white text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer rounded-none shadow-sm"
              >
                {publishing ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </div>

        {/* Notice Ledger Table */}
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 pl-2 border-l-4 border-slate-300">Active Notice Ledger</h3>
          
          <div className="border border-slate-200 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-1/6">Published Date</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-2/3">Announcement Details</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-1/6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan="3" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Ledger...</td></tr>
                ) : announcements.length === 0 ? (
                  <tr><td colSpan="3" className="py-10 text-center text-slate-400 font-bold">No announcements have been published.</td></tr>
                ) : (
                  announcements.map((notice) => {
                    const isHighPriority = notice.text.startsWith('[URGENT]');
                    const cleanText = isHighPriority ? notice.text.replace('[URGENT] ', '') : notice.text;

                    return (
                      <tr key={notice._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 px-6 align-top">
                          <span className="text-[11px] font-bold text-slate-500">{notice.time}</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{notice.senderName}</p>
                        </td>
                        <td className="py-5 px-6 align-top">
                          {isHighPriority && (
                            <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black uppercase tracking-widest mb-2">High Priority</span>
                          )}
                          <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{cleanText}</p>
                        </td>
                        <td className="py-5 px-6 align-top text-right">
                          <button 
                            onClick={() => handleDelete(notice._id)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnnouncements;