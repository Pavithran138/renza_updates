import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ManageClients = () => {
  const [clients, setClients] = useState([]);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Edit Modal State
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete client");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/clients/${editData._id}`, editData);
      setEditData(null);
      fetchClients();
    } catch (err) {
      alert("Failed to update client details");
    }
  };

  // Advanced Filtering Logic
  const filteredClients = clients.filter(c => {
    const matchSearch = (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? c.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-white min-h-full relative">
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-black tracking-tight">Manage Clients</h1>
        <button onClick={() => navigate('/admin/clients/add')} className="px-5 py-2.5 bg-black text-white font-bold rounded-none text-sm hover:bg-[#F97316] transition-colors cursor-pointer shadow-md">
          + Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-md border border-slate-300 rounded-none overflow-hidden flex items-center bg-white mb-2">
          <svg className="w-5 h-5 ml-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" placeholder="Search by company or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-4 text-sm font-semibold text-black outline-none"
          />
        </div>
        <div className="w-40 h-0.5 bg-[#F97316]"></div>
      </div>

      {/* Inline Filters */}
      <div className="mb-6 p-4 border border-slate-200 bg-slate-50 flex gap-4 max-w-sm rounded-none shadow-sm">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-3 text-sm border border-slate-300 outline-none font-bold rounded-none cursor-pointer hover:border-slate-400 transition-colors">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button onClick={() => { setFilterStatus(''); setSearchTerm(''); }} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-black border border-transparent hover:border-slate-300 transition-colors rounded-none cursor-pointer">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border-t border-slate-300">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-300 text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-50">
              <th className="py-4 px-4 cursor-pointer hover:text-black border-r border-slate-200">Company Name <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-4 px-4 cursor-pointer hover:text-black border-r border-slate-200">Owner's Email <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-4 px-4 cursor-pointer hover:text-black border-r border-slate-200">Owner's Name <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-4 px-4 cursor-pointer hover:text-black border-r border-slate-200">Phone Number <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-4 px-4 cursor-pointer hover:text-black border-r border-slate-200">Project Scope <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-3 px-4 text-center">
                <div className="text-slate-700 font-black mb-1">Action</div>
                <div className="text-[10px] text-[#F97316] uppercase tracking-widest flex justify-center gap-2"><span>Edit</span> <span>Delete</span></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredClients.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-400 font-bold">No records found.</td></tr>
            ) : (
              filteredClients.map((client) => (
                <tr 
                  key={client._id} 
                  onClick={() => navigate(`/admin/clients/${client._id}`)} 
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4 font-black text-slate-900 border-r border-slate-100">{client.companyName || 'N/A'}</td>
                  <td className="py-4 px-4 text-slate-600 border-r border-slate-100">{client.email || '—'}</td>
                  <td className="py-4 px-4 text-slate-800 font-black border-r border-slate-100 uppercase">{client.name}</td>
                  <td className="py-4 px-4 text-slate-600 border-r border-slate-100">{client.phone || '—'}</td>
                  <td className="py-4 px-4 text-slate-600 truncate max-w-[150px] border-r border-slate-100">{client.projectDetails || '—'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-4">
                      {/* FIX: Ensuring e.stopPropagation() is called before setting edit data */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditData(client); }} 
                        className="text-blue-500 hover:text-blue-700 p-1.5 border border-transparent hover:border-blue-100 rounded-none transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, client._id)} 
                        className="text-blue-500 hover:text-rose-600 p-1.5 border border-transparent hover:border-rose-100 rounded-none transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-black">Edit Client Record</h2>
              <button onClick={() => setEditData(null)} className="text-slate-400 hover:text-[#F97316] font-bold text-xl cursor-pointer">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <form id="editForm" onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Company Name</label>
                    <input type="text" value={editData.companyName || ''} onChange={e => setEditData({...editData, companyName: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Contact Name *</label>
                    <input type="text" required value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Status</label>
                    <select value={editData.status || 'Pending'} onChange={e => setEditData({...editData, status: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black cursor-pointer hover:border-slate-400">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Project Details / Scope</label>
                  <textarea value={editData.projectDetails || ''} onChange={e => setEditData({...editData, projectDetails: e.target.value})} rows="4" className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-medium text-slate-700 resize-none"></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-8 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0">
              <button type="button" onClick={() => setEditData(null)} className="px-6 py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-none text-sm hover:bg-slate-100 cursor-pointer transition-colors">Cancel</button>
              <button type="submit" form="editForm" className="px-8 py-3 bg-black hover:bg-[#F97316] text-white font-black uppercase tracking-widest rounded-none text-sm shadow-md transition-colors cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClients;