import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminLiveUpdates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('individual');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');

  const [companyTasks, setCompanyTasks] = useState([]);
  const [clientTasks, setClientTasks] = useState([]);
  const [staffUpdates, setStaffUpdates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lastRead, setLastRead] = useState({ individual: 0, team: 0, staff: 0 });

  // Get current admin name to exclude them from the staff feed
  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = String(currentUser.name || currentUser.fullname || currentUser.username || 'Master Admin').trim().toLowerCase();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compRes, cliRes, msgRes, teamsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/clienttasks'),
        api.get('/messages'),
        api.get('/teams')
      ]);

      setCompanyTasks(compRes.data || []);
      setClientTasks(cliRes.data || []);
      
      // FIXED: Filter out the Master Admin and default "no updates" messages
      const validStaffUpdates = (msgRes.data || []).filter(m => {
        const isSystemMsg = m.recipient === 'SYSTEM_DAILY_UPDATES' || m.recipient === 'SYSTEM_ANNOUNCEMENTS';
        const sender = (m.senderName || '').toLowerCase().trim();
        const content = (m.content || m.message || m.text || '').toLowerCase().trim();
        
        // Hide if the sender is the admin or if the message is just the default placeholder
        const isNotAdmin = sender !== 'master admin' && sender !== currentName;
        const isNotPlaceholder = content !== 'no updates' && content !== '';
        
        return isSystemMsg && isNotAdmin && isNotPlaceholder;
      });

      setStaffUpdates(validStaffUpdates);
      setTeams(teamsRes.data || []);

      const storageKey = 'adminLiveUpdatesLastRead';
      const readData = JSON.parse(localStorage.getItem(storageKey)) || { individual: 0, team: 0, staff: 0 };
      
      readData.individual = Date.now();
      setLastRead(readData);
      localStorage.setItem(storageKey, JSON.stringify(readData));

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const newRead = { ...lastRead, [tab]: Date.now() };
    setLastRead(newRead);
    localStorage.setItem('adminLiveUpdatesLastRead', JSON.stringify(newRead));
  };

  const isTeam = (assignedTo) => {
    if (!assignedTo) return false;
    return teams.some(t => t.name.toLowerCase() === assignedTo.toLowerCase());
  };

  const allTasks = [...companyTasks, ...clientTasks];
  const individualTasks = allTasks.filter(t => !isTeam(t.assignedTo));
  const teamTasks = allTasks.filter(t => isTeam(t.assignedTo));

  const isWithinTime = (dateString) => {
    const time = new Date(dateString).getTime();
    const diff = Date.now() - time;
    const h24 = 24 * 60 * 60 * 1000;
    
    if (timeFilter === '24h') return diff <= h24;
    if (timeFilter === '5d') return diff <= h24 * 5;
    if (timeFilter === '1w') return diff <= h24 * 7;
    if (timeFilter === '2w') return diff <= h24 * 14;
    if (timeFilter === '1m') return diff <= h24 * 30;
    return true; 
  };

  const applySearchAndFilter = (items) => {
    return items.filter(item => {
      const timeMatch = isWithinTime(item.updatedAt || item.createdAt);
      const searchMatch = (item.title || item.content || item.message || item.text || item.assignedTo || item.senderName || '')
                          .toLowerCase().includes(searchTerm.toLowerCase());
      return timeMatch && searchMatch;
    }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  };

  const currentDisplayData = 
    activeTab === 'individual' ? applySearchAndFilter(individualTasks) :
    activeTab === 'team' ? applySearchAndFilter(teamTasks) :
    applySearchAndFilter(staffUpdates);

  const getBadgeCount = (items, tabKey) => {
    const lastViewed = lastRead[tabKey] || 0;
    return items.filter(i => new Date(i.updatedAt || i.createdAt).getTime() > lastViewed).length;
  };

  const individualBadge = getBadgeCount(individualTasks, 'individual');
  const teamBadge = getBadgeCount(teamTasks, 'team');
  const staffBadge = getBadgeCount(staffUpdates, 'staff');

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-white min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Live Activity Board</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Real-Time Status Updates Across All Pipelines</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search updates..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 py-2.5 px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none transition-colors"
          />
          <select 
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none cursor-pointer transition-colors"
          >
            <option value="24h">Last 24 Hours (Recent)</option>
            <option value="5d">Last 5 Days (History)</option>
            <option value="1w">Last Week (History)</option>
            <option value="2w">Last 2 Weeks (History)</option>
            <option value="1m">Last Month (History)</option>
            <option value="all">All Time History</option>
          </select>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6 gap-8">
        <button 
          onClick={() => handleTabClick('individual')}
          className={`pb-3 text-[11px] font-black uppercase tracking-widest transition-colors relative flex items-center gap-2 ${activeTab === 'individual' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-slate-400 hover:text-slate-800'}`}
        >
          Individual Tasks
          {individualBadge > 0 && <span className="bg-[#F97316] text-white text-[9px] px-1.5 py-0.5 rounded-sm">{individualBadge}</span>}
        </button>
        <button 
          onClick={() => handleTabClick('team')}
          className={`pb-3 text-[11px] font-black uppercase tracking-widest transition-colors relative flex items-center gap-2 ${activeTab === 'team' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-slate-400 hover:text-slate-800'}`}
        >
          Team Tasks
          {teamBadge > 0 && <span className="bg-[#F97316] text-white text-[9px] px-1.5 py-0.5 rounded-sm">{teamBadge}</span>}
        </button>
        <button 
          onClick={() => handleTabClick('staff')}
          className={`pb-3 text-[11px] font-black uppercase tracking-widest transition-colors relative flex items-center gap-2 ${activeTab === 'staff' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-slate-400 hover:text-slate-800'}`}
        >
          Staff Updates
          {staffBadge > 0 && <span className="bg-[#F97316] text-white text-[9px] px-1.5 py-0.5 rounded-sm">{staffBadge}</span>}
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-white border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="py-4 px-4 w-1/3">Deliverable & Context</th>
              <th className="py-4 px-4 w-1/4">Assigned Member</th>
              <th className="py-4 px-4">Latest Thread Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {loading ? (
              <tr><td colSpan="3" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Live Data...</td></tr>
            ) : currentDisplayData.length === 0 ? (
              <tr><td colSpan="3" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No updates found for this time period.</td></tr>
            ) : (
              currentDisplayData.map((item) => (
                <tr 
                  key={item._id} 
                  onClick={() => {
                     if (activeTab !== 'staff') {
                        const isClient = item.client ? 'client' : 'company';
                        navigate(`/admin/tasks/${isClient}/${item._id}`);
                     }
                  }}
                  className={`hover:bg-slate-50 transition-colors ${activeTab !== 'staff' ? 'cursor-pointer' : ''}`}
                >
                  <td className="py-5 px-4 align-top">
                    <p className="font-black text-black text-sm uppercase tracking-tight">
                      {activeTab === 'staff' ? (item.subject || item.title || 'Daily Stand-up') : (item.title || 'System Update')}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {activeTab === 'staff' ? 'Staff Stand-up' : (item.client ? `Client: ${item.client}` : 'Internal Company')}
                    </p>
                  </td>
                  
                  <td className="py-5 px-4 align-top">
                    <span className="font-black text-black text-xs uppercase tracking-widest">
                      {item.assignedTo || item.senderName || 'System'}
                    </span>
                  </td>
                  
                  <td className="py-5 px-4 align-top">
                    <p className="text-xs font-semibold text-slate-600 line-clamp-2">
                      {item.content || item.message || item.text || item.description || 'Status changed or item updated.'}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                      {item.status || 'UPDATE'} • {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLiveUpdates;