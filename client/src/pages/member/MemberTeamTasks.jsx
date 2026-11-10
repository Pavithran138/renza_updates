import React, { useState, useEffect } from 'react';
import api from '../../api';

const MemberTeamTasks = () => {
  const [teamTasks, setTeamTasks] = useState([]);
  const [myTeamName, setMyTeamName] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [updateText, setUpdateText] = useState('');
  const [updateLink, setUpdateLink] = useState('');

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const [taskRes, teamRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/teams')
      ]);
      
      const allTasks = Array.isArray(taskRes.data) ? taskRes.data : [];
      const allTeams = Array.isArray(teamRes.data) ? teamRes.data : [];

      let userTeam = null;
      
      // FIX: Bulletproof member matching logic
      for (let team of allTeams) {
        if (!team.members || !Array.isArray(team.members)) continue;
        
        const isUserInTeam = team.members.some(member => {
          if (typeof member === 'string') {
            return member.toLowerCase() === (currentUser.name || '').toLowerCase() || 
                   member.toLowerCase() === (currentUser.username || '').toLowerCase();
          }
          if (typeof member === 'object' && member !== null) {
            return (member.name && member.name.toLowerCase() === (currentUser.name || '').toLowerCase()) || 
                   (member.username && member.username.toLowerCase() === (currentUser.username || '').toLowerCase());
          }
          return false;
        });

        if (isUserInTeam) {
          userTeam = team.name;
          break;
        }
      }

      setMyTeamName(userTeam || 'No Team Assigned');

      if (userTeam) {
        // Filter tasks explicitly assigned to this exact team name string
        const tTasks = allTasks.filter(t => t.assignedTo === userTeam);
        setTeamTasks(tTasks);
      } else {
        setTeamTasks([]);
      }
    } catch (err) {
      console.error("Team data fetch error:", err);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTeamData();
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      alert("Failed to update task status.");
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    const newUpdate = {
      text: updateText,
      link: updateLink,
      senderName: currentUser.name || 'Member',
      time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updatedTask = {
      ...selectedTask,
      updates: [...(selectedTask.updates || []), newUpdate]
    };

    try {
      await api.put(`/tasks/${selectedTask._id}`, { updates: updatedTask.updates });
      setSelectedTask(updatedTask);
      setUpdateText('');
      setUpdateLink('');
      fetchTeamData(); 
    } catch (err) {
      alert('Failed to post update');
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      <div className="border-b border-slate-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Squad Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">Collaborative pipeline for your agency squad.</p>
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-sm font-black border border-emerald-200">
          Squad: {myTeamName}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
              <th className="py-4 px-6">Task Title</th>
              <th className="py-4 px-6">Client / Target</th>
              <th className="py-4 px-6">Update Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {myTeamName === 'No Team Assigned' ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-medium">You have not been assigned to a team yet.</td></tr>
            ) : teamTasks.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-medium">No tasks assigned to your squad yet.</td></tr>
            ) : (
              teamTasks.map(task => (
                <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{task.title}</td>
                  <td className="py-4 px-6 font-semibold text-slate-600">{task.client || 'Internal Operations'}</td>
                  <td className="py-4 px-6">
                    <select 
                      value={task.status || 'Pending'}
                      onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg border outline-none cursor-pointer ${
                        task.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => setSelectedTask(task)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer transition-all">Track Progress</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TRACKING MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-widest">{selectedTask.status || 'Pending'}</span>
                  <p className="text-xs text-slate-300 font-semibold tracking-wider uppercase">Client: {selectedTask.client || 'Internal'}</p>
                </div>
                <h2 className="text-3xl font-black">{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center font-bold transition-colors">✕</button>
            </div>
            <div className="flex-1 flex bg-slate-50 overflow-hidden">
              <div className="w-2/5 p-6 border-r border-slate-200 overflow-y-auto">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Task Description</h4>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-700 min-h-[100px]">
                  {selectedTask.description || 'No detailed description provided for this task.'}
                </div>
              </div>
              <div className="w-3/5 p-0 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Live Updates & Shared Links</h4>
                </div>
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                  {!(selectedTask.updates?.length) ? (
                    <div className="text-center py-10 opacity-50">
                      <div className="text-3xl mb-2">💬</div>
                      <p className="text-sm font-bold text-slate-400">No updates or links shared yet.</p>
                    </div>
                  ) : (
                    selectedTask.updates.map((upd, idx) => {
                      const isMe = upd.senderName === (currentUser.name || 'Member');
                      return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm relative ${isMe ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'}`}>
                            <div className="flex justify-between items-center gap-4 mb-1.5">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${isMe ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {upd.senderName}
                              </span>
                              <span className={`text-[9px] font-bold ${isMe ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                                {upd.time}
                              </span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">{upd.text}</p>
                            {upd.link && (
                              <a href={upd.link.startsWith('http') ? upd.link : `https://${upd.link}`} target="_blank" rel="noreferrer" className={`mt-3 inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border transition-colors shadow-sm ${isMe ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}>
                                🔗 {upd.link}
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-slate-200 bg-white">
                  <form onSubmit={handlePostUpdate} className="flex flex-col gap-3">
                    <input type="text" required placeholder="Type an update, note, or description..." value={updateText} onChange={e => setUpdateText(e.target.value)} className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
                    <div className="flex gap-3">
                      <input type="text" placeholder="Attach a URL link (optional)..." value={updateLink} onChange={e => setUpdateLink(e.target.value)} className="flex-1 text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
                      <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md cursor-pointer transition-all">Post Update</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTeamTasks;