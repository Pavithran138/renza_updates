import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminHome = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [urgentTasks, setUrgentTasks] = useState([]);
  const [projectDirectory, setProjectDirectory] = useState([]);
  const [clients, setClients] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const displayName = currentUser.name || currentUser.fullname || currentUser.username || 'Admin';

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
      const [compRes, cliRes, msgRes, clientsRes, teamsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/clienttasks'),
        api.get('/messages'),
        api.get('/clients'),
        api.get('/teams')
      ]);

      const allTasks = [...(compRes.data || []), ...(cliRes.data || [])];
      
      const activeProjects = allTasks.filter(t => t.status !== 'Completed');
      setProjectDirectory(activeProjects);

      const today = new Date();
      today.setHours(0,0,0,0);
      
      const urgent = activeProjects.map(t => {
         if (!t.deadline) return { ...t, diff: 999 };
         const d = new Date(t.deadline);
         d.setHours(0,0,0,0);
         const diff = (d - today) / (1000*60*60*24);
         let label = '';
         let color = '';
         
         if (diff < 0) { label = `OVERDUE (${t.deadline})`; color = 'text-rose-600'; }
         else if (diff === 0) { label = `DUE TODAY`; color = 'text-rose-500'; }
         else if (diff === 1) { label = `DUE TOMORROW`; color = 'text-rose-500'; }
         else if (diff <= 3) { label = `DUE IN ${diff} DAYS`; color = 'text-rose-400'; }
         
         return { ...t, urgencyLabel: label, urgencyColor: color, diff };
      }).filter(t => t.diff <= 3).sort((a,b) => a.diff - b.diff);

      setUrgentTasks(urgent);
      setClients(clientsRes.data || []);
      setTeams(teamsRes.data || []);

      // --- FIXED: INDIVIDUAL DISMISS LOGIC ---
      let notifs = [];
      const dismissedIds = JSON.parse(localStorage.getItem('dismissedAdminNotifs') || '[]');

      compRes.data.forEach(t => {
         const time = new Date(t.updatedAt || t.createdAt).getTime();
         notifs.push({
            id: `comp_${t._id}_${time}`, // Unique ID for this specific update
            time,
            title: `${t.assignedTo || 'Someone'} updated task: ${t.title}`,
            status: t.status, link: `/admin/tasks/company/${t._id}`
         });
      });

      cliRes.data.forEach(t => {
         const time = new Date(t.updatedAt || t.createdAt).getTime();
         notifs.push({
            id: `cli_${t._id}_${time}`,
            time,
            title: `${t.assignedTo || 'Someone'} updated client task: ${t.title}`,
            status: t.status, link: `/admin/tasks/client/${t._id}`
         });
      });

      msgRes.data.forEach(m => {
         const time = new Date(m.createdAt).getTime();
         if (m.recipient === 'SYSTEM_DAILY_UPDATES' || m.recipient === 'SYSTEM_ANNOUNCEMENTS') {
            notifs.push({
               id: `msg_${m._id}_${time}`,
               time,
               title: `New update posted by ${m.senderName}`,
               status: 'UPDATE', link: `/admin/updates`
            });
         } else {
            notifs.push({
               id: `chat_${m._id}_${time}`,
               time,
               title: `New chat message from ${m.senderName}`,
               status: 'CHAT', link: `/admin/chat`
            });
         }
      });

      // Filter out only the specific messages you have clicked on!
      const visibleNotifs = notifs
        .filter(n => !dismissedIds.includes(n.id))
        .sort((a,b) => b.time - a.time)
        .slice(0, 20);
      
      setNotifications(visibleNotifs);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleNotificationClick = (notif) => {
    // 1. Get existing dismissed list
    const dismissed = JSON.parse(localStorage.getItem('dismissedAdminNotifs') || '[]');
    // 2. Add this specific message to the dismissed list
    if (!dismissed.includes(notif.id)) {
      dismissed.push(notif.id);
      // Keep storage clean (max 200 items)
      if (dismissed.length > 200) dismissed.shift(); 
      localStorage.setItem('dismissedAdminNotifs', JSON.stringify(dismissed));
    }
    // 3. Navigate
    navigate(notif.link);
  };

  if (loading) return <div className="p-10 font-bold text-[#F97316] text-center w-full mt-20 text-xl tracking-widest uppercase">Loading Dashboard...</div>;

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen relative">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight capitalize">Welcome, {displayName}!</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Here is your agency agenda for today</p>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Search projects, clients..." 
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
                  <h3 className="font-black text-sm text-slate-800">Activity Hub</h3>
                  {notifications.length > 0 && <span className="bg-orange-100 text-[#F97316] text-[10px] font-black px-2 py-1 rounded-md">{notifications.length} New</span>}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-bold">No active notifications. You are all caught up!</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl flex flex-col items-center h-auto">
           <div className="flex justify-between items-center w-full mb-6">
              <h2 className="text-lg font-black">November 2026</h2>
              <div className="flex gap-2">
                 <button className="w-6 h-6 bg-black text-white rounded-full flex justify-center items-center font-bold text-xs hover:bg-[#F97316]">{"<"}</button>
                 <button className="w-6 h-6 bg-black text-white rounded-full flex justify-center items-center font-bold text-xs hover:bg-[#F97316]">{">"}</button>
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
                 <div className="w-8 h-8 mx-auto bg-[#F97316] text-white rounded-full flex justify-center items-center shadow-md">11</div>
                 <div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div>
                 <div>18</div><div>19</div><div>20</div><div>21</div><div>22</div><div>23</div><div>24</div>
                 <div>25</div><div>26</div><div>27</div><div>28</div><div>29</div><div>30</div>
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl lg:col-span-2">
          <h2 className="text-lg font-black mb-4">Urgent Tasks</h2>
          <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
            {urgentTasks.length === 0 ? (
              <p className="text-xs font-bold text-slate-400">No urgent deadlines.</p>
            ) : (
              urgentTasks.map(task => (
                <div key={task._id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                  <span className="text-xs font-bold text-slate-800">{task.title}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${task.urgencyColor}`}>
                    ● {task.urgencyLabel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl">
          <h2 className="text-lg font-black mb-4">Project Directory</h2>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
             {projectDirectory.length === 0 ? (
               <p className="text-xs font-bold text-slate-400">No active projects.</p>
             ) : (
               projectDirectory.slice(0, 5).map(task => (
                 <div key={task._id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer" onClick={() => {
                   const route = task.client ? 'client' : 'company';
                   navigate(`/admin/tasks/${route}/${task._id}`);
                 }}>
                   <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                   <div>
                     <p className="text-xs font-bold text-slate-800">{task.title}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ASSIGNED TO: {task.assignedTo || 'UNASSIGNED'}</p>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl">
          <h2 className="text-lg font-black mb-4">Recent Clients</h2>
          <div className="space-y-3">
             {clients.slice(0, 3).map(client => (
               <div key={client._id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-md cursor-pointer" onClick={() => navigate(`/admin/clients/${client._id}`)}>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex justify-center items-center font-black text-slate-800 text-xs">{client.name.charAt(0)}</div>
                    <div>
                      <p className="text-xs font-bold">{client.name}</p>
                      <p className="text-[10px] text-slate-400">{client.email}</p>
                    </div>
                 </div>
                 <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black">Team Directory</h2>
            <span className="text-[10px] font-black text-[#F97316] bg-orange-100 px-2 py-1 rounded-md uppercase tracking-widest">Squads</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {teams.slice(0, 2).map(team => (
               <div key={team._id} onClick={() => navigate(`/admin/teams/${team._id}`)} className="border border-slate-100 p-4 flex flex-col items-center rounded-lg hover:border-[#F97316] cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-black text-white font-black text-lg flex justify-center items-center rounded-md mb-2">{team.name.charAt(0)}</div>
                  <p className="text-[11px] font-bold text-center">{team.name}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{team.members?.length || 0} MEMBERS</p>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHome;