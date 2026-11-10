import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';

const AdminTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isClientTask = location.pathname.includes('/client/');

  const [task, setTask] = useState({}); 
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // We fetch the entire list (which we know works) instead of just one task
        const listEndpoint = isClientTask ? `/clienttasks` : `/tasks`;
        
        const [tasksRes, usersRes, teamsRes] = await Promise.all([
          api.get(listEndpoint),
          api.get('/users'),
          api.get('/teams')
        ]);
        
        // Find our specific task from the loaded list
        const foundTask = tasksRes.data.find(t => (t._id === id || t.id === id));

        if (!foundTask) {
          throw new Error("Task not found in the database list.");
        }

        setTask(foundTask); 
        setUsers(usersRes.data || []);
        setTeams(teamsRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("API Error in Details Page:", err);
        setErrorMsg("Failed to load task data. The task may have been deleted.");
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isClientTask]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // The PUT request requires the specific ID endpoint to update it
      const updateEndpoint = isClientTask ? `/clienttasks/${id}` : `/tasks/${id}`;
      await api.put(updateEndpoint, task);
      navigate(-1); 
    } catch (err) {
      alert('Failed to save task details. Check your backend server console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full bg-[#F4F6F8]">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F97316] mb-4"></div>
         <div className="font-black text-slate-400 text-sm tracking-widest uppercase">Fetching Details...</div>
      </div>
    );
  }

  if (errorMsg || !task || (!task.title && !task._id)) {
    return (
      <div className="p-10 w-full mx-auto font-sans bg-[#F4F6F8] min-h-screen">
         <div className="bg-rose-50 border border-rose-200 p-8 text-center mt-20 max-w-lg mx-auto">
            <h2 className="text-xl font-black text-rose-600 uppercase tracking-widest mb-2">Data Error</h2>
            <p className="text-sm font-bold text-slate-700">{errorMsg}</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#F97316] transition-colors">
              Go Back
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen">
      
      <div className="mb-8 flex justify-between items-center">
         <div>
           <h1 className="text-3xl font-black text-black tracking-tight">Edit Task Details</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Modify deliverables, descriptions, and assignments</p>
         </div>
         <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white border border-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
           Go Back
         </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-white border border-slate-300 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
        
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deliverable Title</label>
          <input 
            type="text" 
            value={task?.title || ''} 
            onChange={e => setTask({...task, title: e.target.value})}
            className="w-full bg-slate-50 border border-slate-300 p-3 text-sm font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none transition-colors"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Task Description & Requirements</label>
          <textarea 
            value={task?.description || ''} 
            onChange={e => setTask({...task, description: e.target.value})}
            className="w-full h-40 bg-slate-50 border border-slate-300 p-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#F97316] rounded-none resize-none transition-colors"
            placeholder="No description provided..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Member / Squad</label>
          <select 
            value={task?.assignedTo || ''} 
            onChange={e => setTask({...task, assignedTo: e.target.value})}
            className="w-full bg-slate-50 border border-slate-300 p-3 text-sm font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none transition-colors cursor-pointer"
          >
            <option value="">-- Select Member or Squad --</option>
            <optgroup label="Members">
              {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
            </optgroup>
            <optgroup label="Squads & Teams">
              {teams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deadline</label>
          <input 
            type="date" 
            value={task?.deadline || ''} 
            onChange={e => setTask({...task, deadline: e.target.value})}
            className="w-full bg-slate-50 border border-slate-300 p-3 text-sm font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none transition-colors cursor-pointer"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Status</label>
          <select 
            value={task?.status || 'Pending'} 
            onChange={e => setTask({...task, status: e.target.value})}
            className="w-full max-w-xs bg-slate-50 border border-slate-300 p-3 text-sm font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none transition-colors cursor-pointer"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="md:col-span-2 pt-6 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={saving} className="px-8 py-3 bg-[#F97316] text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-colors rounded-none shadow-sm cursor-pointer">
            {saving ? 'Saving...' : 'Save Task Details'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminTaskDetails;