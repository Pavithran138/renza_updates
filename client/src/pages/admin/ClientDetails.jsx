import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [clientTasks, setClientTasks] = useState([]);
  
  const [activeTab, setActiveTab] = useState('progress');
  const [assignMode, setAssignMode] = useState('team');
  const [taskFilter, setTaskFilter] = useState('');
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState(''); // NEW STATE
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [cRes, tRes, uRes, taskRes] = await Promise.all([
        api.get(`/clients`), 
        api.get('/teams'),
        api.get('/users'),
        api.get('/clienttasks') 
      ]);
      
      const currentClient = cRes.data.find(c => c._id === id);
      setClient(currentClient);
      
      setSelectedTeam(currentClient?.assignedTeam || '');
      setSelectedMembers(currentClient?.assignedMembers || []);
      
      setTeams(tRes.data);
      setUsers(uRes.data.filter(u => u.name !== 'Master Admin'));

      const clientName = currentClient?.companyName || currentClient?.name;
      setClientTasks(taskRes.data.filter(t => t.client === clientName));

    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignAndSync = async () => {
    if (!taskTitle.trim()) return alert("Please enter the Required Feature / Task Name.");

    try {
      await api.put(`/clients/${id}`, { 
        assignedTeam: assignMode === 'team' ? selectedTeam : '', 
        assignedMembers: assignMode === 'individual' ? selectedMembers : [] 
      });
      
      const assignedToStr = assignMode === 'team' ? selectedTeam : selectedMembers.join(', ');

      await api.post('/clienttasks', {
        title: taskTitle,
        description: `Scope: ${client.projectDetails}`,
        client: client.companyName || client.name,
        assignedTo: assignedToStr,
        status: 'Pending',
        deadline: taskDeadline // NEW FIELD
      });
      
      setTaskTitle('');
      setTaskDeadline('');
      fetchData();
      setActiveTab('progress');
    } catch (err) {
      alert("Failed to sync assignment.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this specific task requirement?")) return;
    try {
      await api.delete(`/clienttasks/${taskId}`);
      setClientTasks(clientTasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert("Failed to delete task.");
    }
  };

  const toggleMember = (name) => {
    setSelectedMembers(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);
  };

  if (!client) return <div className="p-10 font-bold text-slate-500">Loading...</div>;

  const filteredTasks = clientTasks.filter(t => taskFilter ? t.status === taskFilter : true);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col p-6 sm:p-10 font-sans">
      
      <div className="bg-white border border-slate-300 p-8 mb-6 shadow-sm rounded-none">
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-black text-black uppercase tracking-tight">{client.companyName || client.name}</h1>
              <span className="px-3 py-1 bg-[#F97316]/10 text-[#F97316] text-xs font-black uppercase tracking-widest border border-[#F97316]/20 rounded-none">
                {client.status || 'Pending'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-500">Primary Contact: {client.name} | {client.email}</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer text-sm transition-colors rounded-none shadow-sm">
            ← Back to Clients
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Client Project Scope</h2>
            <div className="p-5 bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 rounded-none h-full">
              {client.projectDetails || "No project scope details provided."}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Active Assigned Handlers</h2>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-none h-full flex flex-col gap-4">
              {client.assignedTeam && (
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Squad</span>
                  <span className="text-sm font-bold text-[#F97316]">{client.assignedTeam}</span>
                </div>
              )}
              {client.assignedMembers?.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Members</span>
                  <span className="text-sm font-bold text-black">{client.assignedMembers.join(', ')}</span>
                </div>
              )}
              {!client.assignedTeam && client.assignedMembers?.length === 0 && (
                <span className="text-sm font-bold text-slate-400 italic">No staff assigned yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm flex-1 flex flex-col rounded-none">
        
        <div className="flex border-b border-slate-300 bg-slate-50/50">
          <button onClick={() => setActiveTab('progress')} className={`py-4 px-10 font-black text-sm uppercase tracking-widest border-b-2 transition-colors rounded-none cursor-pointer ${activeTab === 'progress' ? 'border-[#F97316] text-[#F97316] bg-white' : 'border-transparent text-slate-400 hover:text-black hover:bg-white'}`}>
            Track Progress
          </button>
          <button onClick={() => setActiveTab('assign')} className={`py-4 px-10 font-black text-sm uppercase tracking-widest border-b-2 transition-colors rounded-none cursor-pointer ${activeTab === 'assign' ? 'border-[#F97316] text-[#F97316] bg-white' : 'border-transparent text-slate-400 hover:text-black hover:bg-white'}`}>
            Assign Requirements
          </button>
        </div>

        {activeTab === 'progress' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Active Requirements List</h2>
              <select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)} className="border border-slate-300 px-4 py-2 text-sm font-bold text-black rounded-none outline-none cursor-pointer focus:border-[#F97316]">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="border border-slate-300 overflow-hidden rounded-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-black uppercase text-slate-500 tracking-wider border-b border-slate-300">
                    <th className="py-4 px-6 border-r border-slate-200">Required Feature / Task</th>
                    <th className="py-4 px-6 border-r border-slate-200">Assigned Handler(s)</th>
                    <th className="py-4 px-6 border-r border-slate-200 text-center">Deadline</th>
                    <th className="py-4 px-6 border-r border-slate-200">Live Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredTasks.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-bold bg-white">No tasks match your criteria.</td></tr>
                  ) : (
                    filteredTasks.map(task => (
                      <tr key={task._id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-bold text-black border-r border-slate-200">{task.title}</td>
                        <td className="py-4 px-6 font-medium text-slate-600 border-r border-slate-200">{task.assignedTo || 'Unassigned'}</td>
                        <td className="py-4 px-6 border-r border-slate-200 text-center">
                          {task.deadline ? (
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-none border border-slate-200">
                              {task.deadline}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">None Set</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold border-r border-slate-200">
                          {task.status === 'Completed' && <span className="text-emerald-600">✅ Completed</span>}
                          {task.status === 'In Progress' && <span className="text-blue-600">🔄 In Progress</span>}
                          {(task.status === 'Pending' || !task.status) && <span className="text-[#F97316]">⏳ Pending</span>}
                        </td>
                        <td className="py-4 px-6 text-center">
                           <button onClick={() => handleDeleteTask(task._id)} className="text-rose-500 hover:text-rose-700 font-bold text-xs uppercase tracking-widest cursor-pointer p-1">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assign' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 bg-slate-50 p-6 border border-slate-300 rounded-none">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Required Feature / Task Name *</label>
                <input type="text" placeholder="e.g. Build QR Menu UI..." value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Delivery Deadline</label>
                <input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black transition-shadow cursor-pointer" />
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button onClick={() => setAssignMode('team')} className={`px-8 py-3 text-xs font-extrabold uppercase tracking-widest border transition-colors cursor-pointer rounded-none ${assignMode === 'team' ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-400 border-slate-300 hover:text-black'}`}>Assign Full Squad</button>
              <button onClick={() => setAssignMode('individual')} className={`px-8 py-3 text-xs font-extrabold uppercase tracking-widest border transition-colors cursor-pointer rounded-none ${assignMode === 'individual' ? 'bg-black text-white border-black' : 'bg-slate-50 text-slate-400 border-slate-300 hover:text-black'}`}>Assign Specific Members</button>
            </div>

            {assignMode === 'team' && (
              <div className="border border-slate-300 overflow-hidden mb-8 rounded-none">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-black uppercase text-slate-500 tracking-wider border-b border-slate-300">
                      <th className="py-3 px-4 w-16 text-center border-r border-slate-200">Select</th>
                      <th className="py-3 px-4 border-r border-slate-200">Squad Name</th>
                      <th className="py-3 px-4">Specialty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {teams.map(t => (
                      <tr key={t._id} onClick={() => setSelectedTeam(t.name)} className={`cursor-pointer transition-colors ${selectedTeam === t.name ? 'bg-[#F97316]/5' : 'bg-white hover:bg-slate-50'}`}>
                        <td className="py-3 px-4 text-center border-r border-slate-200"><input type="radio" checked={selectedTeam === t.name} readOnly className="w-4 h-4 text-[#F97316] border-slate-400 focus:ring-[#F97316] cursor-pointer" /></td>
                        <td className={`py-3 px-4 font-bold border-r border-slate-200 ${selectedTeam === t.name ? 'text-[#F97316]' : 'text-black'}`}>{t.name}</td>
                        <td className="py-3 px-4 font-medium text-slate-600">{t.specialty || 'General'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {assignMode === 'individual' && (
              <div className="border border-slate-300 overflow-hidden mb-8 rounded-none max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="text-xs font-black uppercase text-slate-500 tracking-wider border-b border-slate-300">
                      <th className="py-3 px-4 w-16 text-center border-r border-slate-200">Select</th>
                      <th className="py-3 px-4 border-r border-slate-200">Staff Name</th>
                      <th className="py-3 px-4">Role / Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm bg-white">
                    {users.map(u => {
                      const memberName = u.name || u.username;
                      const isSelected = selectedMembers.includes(memberName);
                      return (
                        <tr key={u._id} onClick={() => toggleMember(memberName)} className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#F97316]/5' : 'hover:bg-slate-50'}`}>
                          <td className="py-3 px-4 text-center border-r border-slate-200">
                            <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 text-[#F97316] rounded-none border-slate-400 focus:ring-0 cursor-pointer" />
                          </td>
                          <td className={`py-3 px-4 font-bold border-r border-slate-200 ${isSelected ? 'text-[#F97316]' : 'text-black'}`}>{memberName}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest border rounded-none ${
                               (u.memberType || '').toUpperCase() === 'TECH' ? 'bg-black text-white border-black' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {u.memberType || 'NON-TECH'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-300">
              <button onClick={handleAssignAndSync} className="px-10 py-4 bg-black hover:bg-[#F97316] text-white font-black uppercase tracking-widest rounded-none text-sm shadow-md transition-colors cursor-pointer">
                Assign & Sync to Pipeline
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClientDetails;