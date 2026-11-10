import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');
  
  const [taskCount, setTaskCount] = useState({ company: 0, client: 0, updates: 0 });

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

  // Admin Notification Logic
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [compTasksRes, cliTasksRes, msgsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/clienttasks'),
          api.get('/messages')
        ]);

        const storageKey = `adminLastReadTime_master`; 
        const lastRead = JSON.parse(localStorage.getItem(storageKey)) || { company: 0, client: 0, updates: 0 };
        
        const now = Date.now();
        if (location.pathname.includes('/admin/tasks/company')) lastRead.company = now;
        if (location.pathname.includes('/admin/tasks/client')) lastRead.client = now;
        if (location.pathname.includes('/admin/updates')) lastRead.updates = now;

        localStorage.setItem(storageKey, JSON.stringify(lastRead));

        let unreadCompany = 0; let unreadClient = 0; let unreadUpdates = 0;

        compTasksRes.data.forEach(task => {
          if (new Date(task.updatedAt || task.createdAt || 0).getTime() > lastRead.company) unreadCompany++;
        });
        cliTasksRes.data.forEach(task => {
          if (new Date(task.updatedAt || task.createdAt || 0).getTime() > lastRead.client) unreadClient++;
        });
        msgsRes.data.forEach(msg => {
          if (msg.recipient === 'SYSTEM_DAILY_UPDATES' || msg.recipient === 'SYSTEM_ANNOUNCEMENTS') {
             if (new Date(msg.createdAt || 0).getTime() > lastRead.updates) unreadUpdates++;
          }
        });

        setTaskCount({ company: unreadCompany, client: unreadClient, updates: unreadUpdates });
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); 
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Sum for the parent dropdown
  const totalTaskNotifications = taskCount.company + taskCount.client;

  const NotificationBadge = ({ count }) => {
    if (count <= 0) return null;
    return (
      <div className={`ml-auto mr-2 bg-[#F97316] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
        {count > 99 ? '99+' : count}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-slate-50">
      
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setOpenDropdown(''); }}
        className={`bg-[#121212] text-white flex flex-col h-full transition-all duration-300 ease-in-out border-r border-[#2A2A2A] z-50 relative rounded-none ${isHovered ? 'w-64' : 'w-[72px]'}`}
      >
        <div className="p-4 pt-6 flex items-center h-24 shrink-0 whitespace-nowrap overflow-hidden min-w-[256px]">
          <div className="w-10 h-10 bg-[#F97316] text-black font-black flex items-center justify-center rounded-none shrink-0 shadow-md">AM</div>
          <div className={`ml-4 transition-opacity duration-300 flex-1 flex justify-between items-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">Admin Manager</h2>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">support@renza.com</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden no-scrollbar space-y-1">
          
          <div onClick={() => navigate('/admin/home')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/home') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
             <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/home') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
             <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
               Dashboard
             </span>
          </div>

          <div onClick={() => navigate('/admin/profile')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/profile') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
             <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/profile') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
             <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
               My Profile
             </span>
          </div>

          {/* LIVE UPDATES (WITH NOTIFICATION BADGE) */}
          <div onClick={() => navigate('/admin/updates')} className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/updates') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
            <div className="flex items-center">
              <div className="relative">
                 <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/updates') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                 {!isHovered && taskCount.updates > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
                    </span>
                 )}
              </div>
              <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Live Updates
              </span>
            </div>
            <NotificationBadge count={taskCount.updates} />
          </div>

          <div onClick={() => navigate('/admin/clients')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/clients') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
             <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/clients') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
             <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
               Manage Clients
             </span>
          </div>

          <div onClick={() => navigate('/admin/teams')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/teams') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
             <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/teams') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
             <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
               Squads & Teams
             </span>
          </div>

          {/* TASK PIPELINE (WITH NOTIFICATION BADGE) */}
          <div className="flex flex-col w-full rounded-none">
            <div onClick={() => toggleDropdown('Tasks')} className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none border-l-4 ${openDropdown === 'Tasks' || location.pathname.includes('/admin/tasks') ? 'bg-[#2A2A2A] border-[#F97316]' : 'border-transparent hover:bg-[#2A2A2A]/50'}`}>
              <div className="flex items-center">
                <div className="relative">
                   <svg className={`w-5 h-5 shrink-0 ${openDropdown === 'Tasks' || location.pathname.includes('/admin/tasks') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                   {!isHovered && totalTaskNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
                      </span>
                   )}
                </div>
                <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 flex items-center ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  Task Pipeline
                </span>
              </div>
              <div className="flex items-center">
                <NotificationBadge count={totalTaskNotifications} />
                {isHovered && <span className={`text-[10px] text-gray-400 transition-transform duration-300 ml-1 ${openDropdown === 'Tasks' ? 'rotate-180' : ''}`}>▼</span>}
              </div>
            </div>

            {isHovered && openDropdown === 'Tasks' && (
              <div className="bg-[#0a0a0a] flex flex-col overflow-hidden rounded-none border-l-4 border-transparent">
                <div onClick={() => navigate('/admin/tasks/company')} className={`flex justify-between items-center pl-16 pr-6 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer transition-colors rounded-none ${isActive('/admin/tasks/company') ? 'text-[#F97316] bg-[#2A2A2A]/50' : 'text-gray-500 hover:text-white hover:bg-[#2A2A2A]/50'}`}>
                  Company Tasks
                  <NotificationBadge count={taskCount.company} />
                </div>
                <div onClick={() => navigate('/admin/tasks/client')} className={`flex justify-between items-center pl-16 pr-6 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer transition-colors rounded-none ${isActive('/admin/tasks/client') ? 'text-[#F97316] bg-[#2A2A2A]/50' : 'text-gray-500 hover:text-white hover:bg-[#2A2A2A]/50'}`}>
                  Client Tasks
                  <NotificationBadge count={taskCount.client} />
                </div>
              </div>
            )}
          </div>

          <div onClick={() => navigate('/admin/members')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/members') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
             <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/members') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
             <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
               Staff Directory
             </span>
          </div>
          
          <div onClick={() => navigate('/admin/announcements')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/announcements') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
             <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/announcements') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
             <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
               Announcements
             </span>
          </div>

          <div onClick={() => navigate('/admin/chat')} className={`flex items-center px-6 py-4 cursor-pointer transition-colors whitespace-nowrap rounded-none ${isActive('/admin/chat') ? 'bg-[#2A2A2A] border-l-4 border-[#F97316]' : 'border-l-4 border-transparent hover:bg-[#2A2A2A]/50'}`}>
             <svg className={`w-5 h-5 shrink-0 ${isActive('/admin/chat') ? 'text-[#F97316]' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
             <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
               Global Chat
             </span>
          </div>

        </nav>

        <div onClick={handleLogout} className="p-6 border-t border-[#2A2A2A] flex items-center cursor-pointer hover:bg-rose-500 transition-colors whitespace-nowrap overflow-hidden shrink-0 group rounded-none">
          <svg className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className={`ml-4 text-[13px] font-black uppercase tracking-wider text-gray-400 group-hover:text-white transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>Logout</span>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;