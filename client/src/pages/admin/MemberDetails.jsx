import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [userTasks, setUserTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, tRes, compTasksRes, cliTasksRes] = await Promise.all([
          api.get('/users'),
          api.get('/teams'),
          api.get('/tasks'),
          api.get('/clienttasks')
        ]);
        
        const currentUser = uRes.data.find(u => u._id === id);
        setUser(currentUser);
        
        if (currentUser) {
          const memberName = currentUser.name || currentUser.username;
          
          // Find Teams
          const associatedTeams = tRes.data.filter(t => t.members.includes(memberName));
          setUserTeams(associatedTeams);

          // Find Both Company and Client Tasks explicitly assigned to this specific member
          const cTasks = compTasksRes.data.filter(task => task.assignedTo === memberName).map(t => ({ ...t, type: 'Company' }));
          const cliTasks = cliTasksRes.data.filter(task => task.assignedTo === memberName).map(t => ({ ...t, type: 'Client' }));
          
          setUserTasks([...cTasks, ...cliTasks]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  if (!user) return <div className="p-10 font-bold text-slate-500">Loading Member Data...</div>;

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col p-6 sm:p-10 font-sans">
      
      <div className="bg-white border border-slate-300 p-8 mb-8 shadow-sm rounded-none">
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-black text-black uppercase tracking-tight">{user.name}</h1>
              <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest border rounded-none ${user.memberType === 'Tech' ? 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20' : 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20'}`}>
                {user.memberType || 'Non-Tech'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-500">Agency Role: {user.role}</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer text-sm transition-colors rounded-none shadow-sm">
            ← Back to Directory
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">Confidential Credentials</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-none overflow-hidden">
              <div className="flex justify-between p-4 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Email Login</span>
                <span className="text-sm font-bold text-black">{user.email}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Raw Password</span>
                <span className="text-sm font-black text-rose-600 tracking-wide">{user.password}</span>
              </div>
              <div className="flex justify-between p-4 bg-white">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Date Joined</span>
                <span className="text-sm font-bold text-black">{user.dateJoined || 'Unrecorded'}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-2">Assigned Squads & Teams</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-none h-[155px] overflow-y-auto p-4 flex flex-col gap-3">
              {userTeams.length === 0 ? (
                <span className="text-sm font-bold text-slate-400 italic">Not currently assigned to any team squads.</span>
              ) : (
                userTeams.map(team => (
                  <div key={team._id} className="p-3 bg-white border border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-black text-[#F97316]">{team.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{team.specialty || 'General Operations'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Active Pipeline Tasks specific to this Member */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 pl-1">Active Pipeline Tasks</h2>
        <div className="bg-white border border-slate-300 rounded-none overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-300">
                <th className="py-3 px-6 border-r border-slate-200">Task Title</th>
                <th className="py-3 px-6 border-r border-slate-200">Pipeline Category</th>
                <th className="py-3 px-6 border-r border-slate-200">Ref / Client</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {userTasks.length === 0 ? (
                <tr><td colSpan="4" className="py-6 text-center text-slate-400 font-bold">No active tasks in pipeline.</td></tr>
              ) : (
                userTasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-black border-r border-slate-200">{task.title}</td>
                    <td className="py-4 px-6 border-r border-slate-200">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border rounded-none ${task.type === 'Client' ? 'text-[#F97316] border-[#F97316]' : 'text-blue-600 border-blue-600'}`}>
                        {task.type} Task
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-600 uppercase border-r border-slate-200">{task.client || 'Internal Company'}</td>
                    <td className="py-4 px-6 font-bold">
                      {task.status === 'Completed' ? <span className="text-emerald-600">Completed</span> : <span className="text-[#F97316]">{task.status || 'Pending'}</span>}
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

export default MemberDetails;