import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const MemberHome = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [urgentTasks, setUrgentTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = String(currentUser.name || currentUser.fullname || currentUser.username || 'Member').trim().toLowerCase();
  const currentUsername = String(currentUser.username || currentUser.email || '').trim().toLowerCase();
  const displayName = currentUser.name || currentUser.fullname || currentUser.username || 'Member';

  useEffect(() => {
    fetchDashboardData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [compRes, cliRes, msgRes, teamsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/clienttasks'),
        api.get('/messages'),
        api.get('/teams')
      ]);

      const myTeams = (teamsRes.data || []).filter(team => {
        if (!team.members || !Array.isArray(team.members)) return false;
        return team.members.some(member => {
          const mClean = typeof member === 'string' ? member.toLowerCase().trim() : (member.name || member.username || '').toLowerCase().trim();
          return mClean === currentName || mClean === currentUsername;
        });
      }).map(team => (team.name || '').toLowerCase().trim());

      const myCompanyTasks = (compRes.data || []).filter(t => {
        const assigned = (t.assignedTo || '').toLowerCase().trim();
        return assigned === currentName || assigned === currentUsername || myTeams.includes(assigned);
      });
      
      const myClientTasks = (cliRes.data || []).filter(t => {
        const assigned = (t.assignedTo || '').toLowerCase().trim();
        return assigned === currentName || assigned === currentUsername || myTeams.includes(assigned);
      });

      const myAllTasks = [...myCompanyTasks, ...myClientTasks];

      const activeWorkflow = myAllTasks
        .filter(t => t.status !== 'Completed')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      
      setActiveTasks(activeWorkflow);

      const today = new Date();
      today.setHours(0,0,0,0);
      
      const urgent = activeWorkflow.map(t => {
         if (!t.deadline) return { ...t, diff: 999 };
         const d = new Date(t.deadline);
         d.setHours(0,0,0,0);
         const diff = (d - today) / (1000*60*60*24);
         return { ...t, diff };
      }).filter(t => t.diff <= 3).sort((a,b) => a.diff - b.diff);

      setUrgentTasks(urgent);

      // --- FIXED: INDIVIDUAL DISMISS LOGIC ---
      let notifs = [];
      const storageKey = `dismissedMemberNotifs_${currentUsername}`;
      const dismissedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

      myCompanyTasks.forEach(t => {
         const time = new Date(t.updatedAt || t.createdAt).getTime();
         notifs.push({
            id: `comp_${t._id}_${time}`,
            time,
            title: `Task Update: ${t.title}`,
            status: t.status, link: `/member/tasks/mine`
         });
      });

      myClientTasks.forEach(t => {
         const time = new Date(t.updatedAt || t.createdAt).getTime();
         notifs.push({
            id: `cli_${t._id}_${time}`,
            time,
            title: `Client Task Update: ${t.title}`,
            status: t.status, link: `/member/tasks/mine`
         });
      });

      (msgRes.data || []).forEach(m => {
         const time = new Date(m.createdAt).getTime();
         if (m.recipient === 'SYSTEM_ANNOUNCEMENTS') {
            notifs.push({
               id: `msg_${m._id}_${time}`,
               time,
               title: `New announcement posted`,
               status: 'ANNOUNCEMENT', link: `/member/announcements`
            });
         } else if (m.recipient === 'GLOBAL_CHAT' || !m.recipient) {
            notifs.push({
               id: `chat_${m._id}_${time}`,
               time,
               title: `New chat from ${m.senderName || 'Team'}`,
               status: 'CHAT', link: `/member/chat`
            });
         }
      });

      const visibleNotifs = notifs
        .filter(n => !dismissedIds.includes(n.id))
        .sort((a,b) => b.time - a.time)
        .slice(0, 20);
      
      setNotifications(visibleNotifs);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load member dashboard:", err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const endpoint = task.client ? `/clienttasks/${task._id}` : `/tasks/${task._id}`;
      await api.put(endpoint, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleNotificationClick = (notif) => {
    const storageKey = `dismissedMemberNotifs_${currentUsername}`;
    const dismissed = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!dismissed.includes(notif.id)) {
      dismissed.push(notif.id);
      if (dismissed.length > 200) dismissed.shift(); 
      localStorage.setItem(storageKey, JSON.stringify(dismissed));
    }
    navigate(notif.link);
  };

  if (loading) return <div className="p-10 font-bold text-[#3949ab] text-center w-full mt-20 text-xl tracking-widest uppercase">Loading Your Workspace...</div>;

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen relative">
      
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#1a237e] tracking-tight capitalize">Welcome, {displayName}!</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Here are your assigned deliverables for today</p>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Search my tasks..." 
            className="hidden md:block w-64 bg-white border border-slate-300 py-2.5 px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-full shadow-sm transition-colors"
          />
          
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2.5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition cursor-pointer">
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F97316] border-2 border-white text-[8px] text-white justify-center items-center font-bold"></span>
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-black text-sm text-[#3949ab]">My Activity Hub</h3>
                  {notifications.length > 0 && <span className="bg-orange-100 text-[#F97316] text-[10px] font-black px-2 py-1 rounded-md">{notifications.length} New</span>}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-bold">You're all caught up! No active notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)} 
                        className="p-4 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <p className="text-xs font-bold text-slate-800 mb-1">{n.title}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#F97316]">{n.status}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{new Date(n.time).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-none flex flex-col items-center h-auto">
           <div className="flex justify-between items-center w-full mb-6">
              <h2 className="text-lg font-black text-[#3949ab]">November 2026</h2>
              <div className="flex gap-2">
                 <button className="w-6 h-6 bg-[#3949ab] text-white rounded-none flex justify-center items-center font-bold text-xs hover:bg-[#F97316]">{"<"}</button>
                 <button className="w-6 h-6 bg-[#3949ab] text-white rounded-none flex justify-center items-center font-bold text-xs hover:bg-[#F97316]">{">"}</button>
              </div>
           </div>
           <div className="w-full">
              <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                 <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
              </div>
              <div className="grid grid-cols-7 text-center text-sm font-bold text-slate-700 gap-y-4">
                 <div className="text-slate-300">27</div><div className="text-slate-300">28</div><div className="text-slate-300">29</div><div className="text-slate-300">30</div>
                 <div>1</div><div>2</div><div>3</div>
                 <div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div>
                 <div className="w-8 h-8 mx-auto bg-[#F97316] text-white rounded-none flex justify-center items-center shadow-md">11</div>
                 <div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div>
                 <div>18</div><div>19</div><div>20</div><div>21</div><div>22</div><div>23</div><div>24</div>
                 <div>25</div><div>26</div><div>27</div><div>28</div><div>29</div><div>30</div>
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-none lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#3949ab]">My Urgent Deadlines</h2>
            {urgentTasks.length > 0 && (
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 uppercase tracking-widest">
                {urgentTasks.length} Approaching
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-2">
            {urgentTasks.length === 0 ? (
              <p className="text-sm font-bold text-slate-400 p-4 border border-dashed border-slate-300 col-span-2 text-center">No urgent deadlines assigned to you.</p>
            ) : (
              urgentTasks.map(task => (
                <div key={task._id} className="flex justify-between items-center p-5 border border-rose-100 bg-rose-50/30 hover:bg-rose-50/60 transition-colors">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{task.title}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      REF: {task.client || 'INTERNAL COMPANY'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                      DUE: {task.deadline || 'SOON'}
                    </span>
                    <button 
                      onClick={() => navigate('/member/tasks/mine')}
                      className="px-4 py-1.5 border border-[#3949ab] text-[#3949ab] text-[9px] font-black uppercase tracking-widest hover:bg-[#3949ab] hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-none">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800">My Active Workflow</h2>
          <button 
            onClick={() => navigate('/member/tasks/mine')}
            className="px-6 py-2 border border-[#F97316] text-[#F97316] text-[10px] font-black uppercase tracking-widest hover:bg-[#F97316] hover:text-white transition-colors"
          >
            Go To Pipeline
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="py-4 px-4 w-1/3">Task Overview</th>
                <th className="py-4 px-4 text-center">Client / Context</th>
                <th className="py-4 px-4 text-center">Deadline</th>
                <th className="py-4 px-4 text-center">Action</th>
                <th className="py-4 px-4 text-center">My Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {activeTasks.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active tasks in your workflow.</td></tr>
              ) : (
                activeTasks.map(task => (
                  <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="py-4 px-4 align-middle">
                      <p className="font-black text-slate-900 text-sm">{task.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        ASSIGNED TO: {task.assignedTo || 'UNASSIGNED'}
                      </p>
                    </td>
                    
                    <td className="py-4 px-4 text-center align-middle">
                      <span className="text-[11px] font-black text-[#F97316] uppercase tracking-widest">
                        {task.client || 'INTERNAL COMPANY'}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-center align-middle">
                      <span className="text-xs font-bold text-slate-800">{task.deadline || 'Not Set'}</span>
                    </td>
                    
                    <td className="py-4 px-4 text-center align-middle">
                      <button 
                        onClick={() => {
                          const routeType = task.client ? 'client' : 'company';
                          navigate(`/member/tasks/discussion/${routeType}/${task._id}`);
                        }}
                        className="px-4 py-2 border border-[#3949ab] text-[#3949ab] text-[10px] font-black uppercase tracking-widest hover:bg-[#3949ab] hover:text-white transition-colors"
                      >
                        View Details
                      </button>
                    </td>

                    <td className="py-4 px-4 text-center align-middle">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        className={`w-full max-w-[140px] mx-auto p-2 text-[9px] font-black uppercase tracking-widest border rounded-none cursor-pointer outline-none transition-colors ${
                          task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          task.status === 'In Progress' ? 'bg-blue-50 text-[#3949ab] border-blue-200' :
                          'bg-orange-50 text-[#F97316] border-orange-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberHome;