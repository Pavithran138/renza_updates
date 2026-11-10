import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';

const MemberTasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isTeamView = location.pathname.includes('team'); 

  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = currentUser.name || currentUser.fullname || currentUser.username || 'Member';
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for Daily Update
  const [dailyUpdate, setDailyUpdate] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 4000); 
    return () => clearInterval(interval);
  }, [location.pathname]); 

  const fetchTasks = async () => {
    try {
      const [compTasksRes, cliTasksRes, teamsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/clienttasks'),
        api.get('/teams')
      ]);

      const allTasks = [...compTasksRes.data, ...cliTasksRes.data];
      const myNameClean = currentName.toLowerCase().trim();
      const myUsername = (currentUser.username || currentUser.email || '').toLowerCase().trim();

      const myTeams = teamsRes.data.filter(team => {
        if (!team.members || !Array.isArray(team.members)) return false;
        return team.members.some(member => {
          const mString = typeof member === 'string' ? member : (member.name || member.username || '');
          const mClean = mString.toLowerCase().trim();
          return mClean === myNameClean || mClean === myUsername;
        });
      }).map(team => (team.name || '').toLowerCase().trim());

      const filteredTasks = allTasks.filter(task => {
        const assigned = (task.assignedTo || '').toLowerCase().trim();
        if (!assigned) return false;

        if (isTeamView) return myTeams.includes(assigned);
        return assigned === myNameClean || assigned === myUsername;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTasks(filteredTasks);
      setLoading(false);
    } catch (err) {
      console.error("Failed to sync tasks", err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const isClientTask = task.client && task.client !== 'Internal' && task.client !== 'Internal Company';
      const endpoint = isClientTask ? `/clienttasks/${task._id}` : `/tasks/${task._id}`;
      await api.put(endpoint, { status: newStatus });
      fetchTasks(); 
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const openDiscussion = (task) => {
    const isClientTask = task.client && task.client !== 'Internal' && task.client !== 'Internal Company';
    if (isClientTask) {
      navigate(`/member/tasks/discussion/client/${task._id}`);
    } else {
      navigate(`/member/tasks/discussion/company/${task._id}`);
    }
  };

  // NEW: Post a Daily General Update to a hidden system chat log
  const handlePostDailyUpdate = async (e) => {
    e.preventDefault();
    if (!dailyUpdate.trim()) return;
    setPostingUpdate(true);
    
    try {
      // We route this special update to a recipient named "SYSTEM_DAILY_UPDATES"
      await api.post('/messages', {
        text: dailyUpdate,
        senderName: currentName,
        senderRole: 'Member',
        recipient: 'SYSTEM_DAILY_UPDATES', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      });
      setDailyUpdate('');
      alert("Daily Update Posted to Admin Dashboard!");
    } catch (err) {
      alert("Failed to post update.");
    } finally {
      setPostingUpdate(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen max-w-[1600px]">
      
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">{isTeamView ? 'Team Pipeline' : 'My Deliverables'}</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {isTeamView ? 'Tasks assigned to your active squads' : 'Tasks assigned directly to you'}
          </p>
        </div>

        {/* NEW: Quick Daily Update Form */}
        <div className="w-full lg:w-1/3 bg-white border border-slate-300 shadow-sm rounded-none p-4 shrink-0">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3949ab] mb-3">Submit Daily Stand-up Update</h3>
           <form onSubmit={handlePostDailyUpdate} className="flex gap-2">
             <input 
               type="text"
               placeholder="E.g., Waiting on assets for UI task..."
               value={dailyUpdate}
               onChange={(e) => setDailyUpdate(e.target.value)}
               className="flex-1 bg-slate-50 border border-slate-300 p-2 text-xs font-bold outline-none focus:border-[#3949ab] rounded-none"
             />
             <button type="submit" disabled={postingUpdate} className="px-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-[#3949ab] transition-colors cursor-pointer">
               {postingUpdate ? '...' : 'Post'}
             </button>
           </form>
        </div>
      </div>

      <div className="border border-slate-300 overflow-x-auto rounded-none shadow-sm bg-white">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-300">
              <th className="py-4 px-6 border-r border-slate-200">Task Title & Details</th>
              <th className="py-4 px-6 border-r border-slate-200">Context / Client</th>
              <th className="py-4 px-6 border-r border-slate-200 text-center">Deadline</th>
              <th className="py-4 px-6 border-r border-slate-200 text-center">Status</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm bg-white">
            {loading ? (
              <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Pipeline...</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold">No tasks found in this pipeline.</td></tr>
            ) : (
              tasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                  
                  <td className="py-4 px-6 border-r border-slate-100">
                    <p className="font-black text-black text-sm">{task.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assigned: {task.assignedTo}</p>
                  </td>
                  
                  <td className="py-4 px-6 border-r border-slate-100">
                    <span className="font-black text-[#F97316] uppercase tracking-wide text-xs">
                      {task.client || 'Internal'}
                    </span>
                  </td>

                  <td className="py-4 px-6 border-r border-slate-100 text-center">
                    <span className="text-xs font-bold text-slate-600">{task.deadline || 'No Deadline'}</span>
                  </td>

                  <td className="py-4 px-6 border-r border-slate-100 text-center">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className={`w-full max-w-[150px] mx-auto p-2 text-[10px] font-black uppercase tracking-widest border rounded-none cursor-pointer outline-none transition-colors ${
                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-orange-50 text-[#F97316] border-orange-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => openDiscussion(task)}
                      className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-[#3949ab] transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Discussion ({task.comments?.length || 0})
                    </button>
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

export default MemberTasks;