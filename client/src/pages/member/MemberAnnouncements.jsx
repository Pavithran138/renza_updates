import React, { useState, useEffect } from 'react';
import api from '../../api';

const MemberAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 10000); // 10-second background sync
    return () => clearInterval(interval);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/messages');
      const notices = res.data.filter(msg => msg.recipient === 'SYSTEM_ANNOUNCEMENTS').reverse();
      setAnnouncements(notices);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F8] font-sans text-slate-800 p-6 sm:p-10">
      
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-black text-black tracking-tight">Company Announcements</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Official notices and agency-wide bulletins</p>
      </div>

      <div className="flex-1 w-full bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
          <svg className="w-5 h-5 text-[#3949ab]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Active Notice Ledger</h2>
        </div>
          
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-300">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-1/5">Published Date</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-4/5">Announcement Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan="2" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Announcements...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan="2" className="py-10 text-center text-slate-400 font-bold">No announcements have been published.</td></tr>
              ) : (
                announcements.map((notice) => {
                  const isHighPriority = notice.text.startsWith('[URGENT]');
                  const cleanText = isHighPriority ? notice.text.replace('[URGENT] ', '') : notice.text;

                  return (
                    <tr key={notice._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6 align-top border-r border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500">{notice.time}</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{notice.senderName}</p>
                      </td>
                      <td className="py-5 px-6 align-top">
                        {isHighPriority && (
                          <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-black uppercase tracking-widest mb-2">High Priority</span>
                        )}
                        <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">{cleanText}</p>
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
  );
};

export default MemberAnnouncements;