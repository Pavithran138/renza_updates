import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const TaskAdd = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, tRes] = await Promise.all([api.get('/users'), api.get('/teams')]);
        setUsers(uRes.data.filter(u => u.name !== 'Master Admin'));
        setTeams(tRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { title, description, assignedTo, deadline });
      navigate('/admin/tasks');
    } catch (err) {
      alert('Failed to create task');
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col font-sans">
      
      {/* Top Action Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-t-3xl shadow-sm border border-slate-200 border-b-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Create New Task</h1>
          <p className="text-xs font-bold text-slate-500 mt-1">Assign work to a specific member or an entire squad.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" form="taskForm" className="px-6 py-2.5 bg-[#479087] hover:bg-teal-700 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-[#479087]/20 transition-all cursor-pointer">
            Deploy Task
          </button>
        </div>
      </div>

      {/* Full Screen Professional Canvas */}
      <div className="bg-white p-8 md:p-12 rounded-b-3xl shadow-sm border border-slate-200 flex-1">
        <form id="taskForm" onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Task Title</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Q3 Market Research Design"
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-lg focus:ring-2 focus:ring-[#479087] outline-none font-bold text-slate-800 transition-all hover:bg-white" 
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Task Brief / Description</label>
            <textarea 
              required value={description} onChange={(e) => setDescription(e.target.value)} 
              rows="5" placeholder="Detail the requirements, links, and objectives here..."
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#479087] outline-none font-medium text-slate-700 transition-all hover:bg-white resize-none" 
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Assign To</label>
              <div className="relative">
                <select 
                  required value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#479087] outline-none font-bold text-slate-800 appearance-none cursor-pointer hover:bg-white"
                >
                  <option value="" disabled>Select User or Team</option>
                  <optgroup label="Squads & Teams" className="font-bold">
                    {teams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                  </optgroup>
                  <optgroup label="Individual Members" className="font-bold">
                    {users.map(u => <option key={u._id} value={u.name || u.username}>{u.name || u.username}</option>)}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Deadline</label>
              <input 
                type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-[#479087] outline-none font-bold text-slate-800 transition-all hover:bg-white" 
              />
            </div>
          </div>
          
        </form>
      </div>

    </div>
  );
};

export default TaskAdd;