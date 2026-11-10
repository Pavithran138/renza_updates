import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const MemberLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');
  
  // State to hold UNREAD notification counts
  const [taskCount, setTaskCount] = useState({ mine: 0, team: 0, clients: 0 });

  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = String(currentUser.name || currentUser.fullname || currentUser.username || 'Member').trim().toLowerCase();
  const currentUsername = String(currentUser.username || currentUser.email || '').trim().toLowerCase();

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/');
  };

  const toggleDropdown = (name) => {
    if (!isHovered) setIsHovered(true);
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const isActive = (path) => location.pathname === path;

  // Fetch Activity and Calculate UNREAD Notification Badges
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [compTasksRes, cliTasksRes, teamsRes, clientsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/clienttasks'),
          api.get('/teams'),
          api.get('/clients')
        ]);

        const allTasks = [...compTasksRes.data, ...cliTasksRes.data];

        const myTeams = teamsRes.data.filter(team => {
          if (!team.members || !Array.isArray(team.members)) return false;
          return team.members.some(member => {
            const mClean = typeof member === 'string' ? member.toLowerCase().trim() : (member.name || member.username || '').toLowerCase().trim();
            return mClean === currentName || mClean === currentUsername;
          });
        }).map(team => (team.name || '').toLowerCase().trim());

        const storageKey = `lastReadTime_${currentUsername}`;
        const lastRead = JSON.parse(localStorage.getItem(storageKey)) || { mine: 0, team: 0, clients: 0 };
        
        const now = Date.now();
        if (location.pathname.includes('/member/tasks/mine')) lastRead.mine = now;
        if (location.pathname.includes('/member/tasks/team')) lastRead.team = now;
        if (location.pathname.includes('/member/clients')) lastRead.clients = now;

        localStorage.setItem(storageKey, JSON.stringify(lastRead));

        let unreadMine = 0; let unreadTeam = 0; let unreadClients = 0;

        allTasks.forEach(task => {
          const assigned = (task.assignedTo || '').toLowerCase().trim();
          const taskTime = new Date(task.updatedAt || task.createdAt || 0).getTime();
          
          if (assigned === currentName || assigned === currentUsername) {
            if (taskTime > lastRead.mine) unreadMine++;
          } else if (myTeams.includes(assigned)) {
            if (taskTime > lastRead.team) unreadTeam++;
          }
        });

        clientsRes.data.forEach(client => {
          const clientTime = new Date(client.updatedAt || client.createdAt || 0).getTime();
          if (clientTime > lastRead.clients) unreadClients++;
        });

        setTaskCount({ mine: unreadMine, team: unreadTeam, clients: unreadClients });
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); 
    return () => clearInterval(interval);
  }, [currentName, currentUsername, location.pathname]); 

  // The sum of the children for the parent dropdown badge
  const totalTaskNotifications = taskCount.mine + taskCount.team;

  const NotificationBadge = ({ count }) => {
    if (count <= 0) return null;
    return (
      <div className={`ml-auto mr-2 bg-[#F97316] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
        {count > 99 ? '99+' : count}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans overflow-hidden">
      
      {/* Hide & Seek Sidebar - Strict Rectangular Design */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setOpenDropdown(''); }}
        className={`bg-[#3949ab] text-white flex flex-col h-full transition-all duration-300 ease-in-out shadow-2xl z-50 relative rounded-none ${isHovered ? 'w-64' : 'w-20'}`}
      >
        <div className="p-6 border-b border-white/10 flex items-center h-24 shrink-0 whitespace-nowrap overflow-hidden bg-[#313f93]">
          <div className="w-8 h-8 bg-white text-[#3949ab] font-black text-xl flex items-center justify-center rounded-none shrink-0 shadow-md">R</div>
          <div className={`ml-4 transition-opacity duration-300 flex-1 flex justify-between items-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase">Member Portal</h2>
              <p className="text-[10px] text-indigo-200">Agency Workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden no-scrollbar space-y-1">
          
          <div onClick={() => navigate('/member/home')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/member/home') ? 'bg-white/10 border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-white/5'}`}>
            <svg className={`w-5 h-5 shrink-0 ${isActive('/member/home') ? 'text-[#F97316]' : 'text-indigo-200'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span className={`ml-4 text-[13px] font-black uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Dashboard</span>
          </div>

          <div onClick={() => navigate('/member/clients')} className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/member/clients') ? 'bg-white/10 border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-white/5'}`}> <div className="flex items-center"> <div className="relative"> <svg className={`w-5 h-5 shrink-0 ${isActive('/member/clients') ? 'text-[#F97316]' : 'text-indigo-200'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                 {!isHovered && taskCount.clients > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
                    </span>
                 )}
              </div>
              <span className={`ml-4 text-[13px] font-black uppercase tracking-wider transition-opacity duration-300 flex items-center ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Client Roster
              </span>
            </div>
            <div className="flex items-center">
              <NotificationBadge count={taskCount.clients} />
            </div>
          </div>

          {/* Tasks Pipeline (Dropdown) */}
          <div className="flex flex-col w-full rounded-none">
            <div onClick={() => toggleDropdown('Tasks')} className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none border-l-4 ${openDropdown === 'Tasks' || location.pathname.includes('/member/tasks') ? 'bg-white/5 border-[#F97316]' : 'border-transparent hover:bg-white/5'}`}>
              <div className="flex items-center">
                <div className="relative">
                   <svg className={`w-5 h-5 shrink-0 ${openDropdown === 'Tasks' || location.pathname.includes('/member/tasks') ? 'text-[#F97316]' : 'text-indigo-200'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                   {!isHovered && totalTaskNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
                      </span>
                   )}
                </div>
                <span className={`ml-4 text-[13px] font-black uppercase tracking-wider transition-opacity duration-300 flex items-center ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  Tasks Pipeline
                </span>
              </div>
              
              <div className="flex items-center">
                <NotificationBadge count={totalTaskNotifications} />
                {isHovered && <span className={`text-[10px] text-indigo-200 transition-transform duration-300 ml-1 ${openDropdown === 'Tasks' ? 'rotate-180' : ''}`}>▼</span>}
              </div>
            </div>

            {isHovered && openDropdown === 'Tasks' && (
              <div className="bg-[#2a3680] flex flex-col overflow-hidden rounded-none border-l-4 border-transparent">
                <div onClick={() => navigate('/member/tasks/mine')} className={`flex justify-between items-center pl-16 pr-6 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer transition-colors rounded-none ${isActive('/member/tasks/mine') ? 'text-[#F97316] bg-white/5' : 'text-indigo-200 hover:text-white hover:bg-white/5'}`}>
                  My Tasks
                  <NotificationBadge count={taskCount.mine} />
                </div>
                <div onClick={() => navigate('/member/tasks/team')} className={`flex justify-between items-center pl-16 pr-6 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer transition-colors rounded-none ${isActive('/member/tasks/team') ? 'text-[#F97316] bg-white/5' : 'text-indigo-200 hover:text-white hover:bg-white/5'}`}>
                  Team Tasks
                  <NotificationBadge count={taskCount.team} />
                </div>
              </div>
            )}
          </div>

          <div onClick={() => navigate('/member/team')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/member/team') ? 'bg-white/10 border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-white/5'}`}>
            <svg className={`w-5 h-5 shrink-0 ${isActive('/member/team') ? 'text-[#F97316]' : 'text-indigo-200'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span className={`ml-4 text-[13px] font-black uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>My Team</span>
          </div>

          <div onClick={() => navigate('/member/announcements')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/member/announcements') ? 'bg-white/10 border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-white/5'}`}>
            <svg className={`w-5 h-5 shrink-0 ${isActive('/member/announcements') ? 'text-[#F97316]' : 'text-indigo-200'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            <span className={`ml-4 text-[13px] font-black uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Announcements</span>
          </div>

          <div onClick={() => navigate('/member/chat')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/member/chat') ? 'bg-white/10 border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-white/5'}`}>
            <svg className={`w-5 h-5 shrink-0 ${isActive('/member/chat') ? 'text-[#F97316]' : 'text-indigo-200'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            <span className={`ml-4 text-[13px] font-black uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Global Chat</span>
          </div>

          <div onClick={() => navigate('/member/profile')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/member/profile') ? 'bg-white/10 border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-white/5'}`}>
            <svg className={`w-5 h-5 shrink-0 ${isActive('/member/profile') ? 'text-[#F97316]' : 'text-indigo-200'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span className={`ml-4 text-[13px] font-black uppercase tracking-wider transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>My Profile</span>
          </div>

        </nav>

        <div onClick={handleLogout} className="p-6 border-t border-white/10 flex items-center cursor-pointer hover:bg-rose-500 transition-colors whitespace-nowrap overflow-hidden shrink-0 group rounded-none">
          <svg className="w-5 h-5 shrink-0 text-indigo-200 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className={`ml-4 text-[13px] font-black uppercase tracking-wider group-hover:text-white transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Logout</span>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen bg-[#F4F6F8]">
        <Outlet />
      </main>
    </div>
  );
};

export default MemberLayout;