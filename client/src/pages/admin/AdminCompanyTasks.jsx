import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminCompanyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company task permanently?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert("Failed to delete task.");
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // NEW: Filter Logic
  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (task.title || '').toLowerCase().includes(searchLower) ||
      (task.assignedTo || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Company Tasks</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Manage internal agency deliverables</p>
        </div>
        <button
          onClick={() => navigate('/admin/tasks/add')}
          className="px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#F97316] transition-colors rounded-none shadow-sm cursor-pointer"
        >
          + Add New Task
        </button>
      </div>

      {/* NEW: SEARCH & FILTER BAR */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Search tasks by title or assignee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 py-3 pl-10 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none shadow-sm transition-colors"
          />
        </div>
        <div className="w-full sm:w-56">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 p-3 text-sm font-bold text-slate-800 outline-none focus:border-[#F97316] rounded-none shadow-sm cursor-pointer transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-300">
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="py-4 px-6 border-r border-slate-200 w-1/3">Task Title & Info</th>
              <th className="py-4 px-6 border-r border-slate-200">Assigned To</th>
              <th className="py-4 px-6 border-r border-slate-200 text-center">Deadline</th>
              <th className="py-4 px-6 border-r border-slate-200 text-center">Status</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Tasks...</td></tr>
            ) : filteredTasks.length === 0 ? (
              <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold">No tasks match your search criteria.</td></tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                  
                  <td className="py-4 px-6 border-r border-slate-100 align-top">
                    <p className="font-black text-slate-900 text-sm">{task.title}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                      {task.description || 'No description provided'}
                    </p>
                  </td>
                  
                  <td className="py-4 px-6 border-r border-slate-100 align-top">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">{task.assignedTo || 'Unassigned'}</span>
                  </td>
                  
                  <td className="py-4 px-6 border-r border-slate-100 text-center align-top">
                    <span className="text-xs font-bold text-slate-600">{task.deadline || 'None'}</span>
                  </td>
                  
                  <td className="py-4 px-6 border-r border-slate-100 text-center align-top">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className={`w-full max-w-[130px] mx-auto p-2 text-[9px] font-black uppercase tracking-widest border rounded-none cursor-pointer outline-none transition-colors ${
                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  
                  <td className="py-4 px-6 text-center align-top">
                    <div className="flex justify-center items-center gap-4">
                      
                      {/* SAFE NAVIGATION LINKS */}
                      <a
                        href={`/admin/tasks/company/${task._id || task.id}`}
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="View/Edit Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </a>
                      
                      <a
                        href={`/admin/tasks/discussion/company/${task._id || task.id}`}
                        className="text-slate-400 hover:text-[#F97316] transition-colors cursor-pointer flex items-center gap-1"
                        title="Discussion Thread"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span className="text-[10px] font-black">{task.comments?.length || 0}</span>
                      </a>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(task._id);
                        }}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
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

export default AdminCompanyTasks;