import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminMembers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.filter(u => u.name !== 'Master Admin'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this member? This removes them from all teams.")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete member.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editData._id}`, editData);
      setEditData(null);
      fetchUsers();
    } catch (err) {
      alert("Failed to update credentials.");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType ? (u.memberType || 'Non-Tech') === filterType : true;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-slate-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-black tracking-tight">Staff Directory</h1>
        <button onClick={() => navigate('/admin/members/add')} className="px-6 py-3 bg-black text-white font-bold rounded-none text-sm hover:bg-[#F97316] transition-colors cursor-pointer shadow-md uppercase tracking-widest">+ Add Member</button>
      </div>

      <div className="mb-6">
        <div className="relative w-full max-w-md border border-slate-300 rounded-none overflow-hidden flex items-center bg-white mb-2">
          <svg className="w-5 h-5 ml-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search staff name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-3 px-4 text-sm font-semibold text-black outline-none" />
        </div>
        <div className="w-40 h-0.5 bg-[#F97316]"></div>
      </div>

      <div className="mb-6 p-4 border border-slate-300 bg-white flex gap-4 max-w-sm rounded-none shadow-sm">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full p-3 text-sm border border-slate-300 outline-none font-bold rounded-none cursor-pointer hover:border-slate-400 transition-colors">
          <option value="">All Departments</option>
          <option value="Tech">Tech</option>
          <option value="Non-Tech">Non-Tech</option>
        </select>
        <button onClick={() => { setFilterType(''); setSearchTerm(''); }} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-black border border-transparent hover:border-slate-300 transition-colors rounded-none cursor-pointer">Clear</button>
      </div>

      <div className="border border-slate-300 overflow-hidden rounded-none">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-white text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-300">
              <th className="py-4 px-6 border-r border-slate-200">Staff Name</th>
              <th className="py-4 px-6 border-r border-slate-200">Email Address</th>
              <th className="py-4 px-6 border-r border-slate-200">Joined Date</th>
              <th className="py-4 px-6 border-r border-slate-200">Category</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm bg-white">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-bold">No members found.</td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} onClick={() => navigate(`/admin/members/${u._id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="py-4 px-6 font-bold text-black border-r border-slate-100">{u.name}</td>
                  <td className="py-4 px-6 text-slate-600 border-r border-slate-100">{u.email}</td>
                  <td className="py-4 px-6 text-slate-600 font-bold border-r border-slate-100">{u.dateJoined || 'N/A'}</td>
                  <td className="py-4 px-6 border-r border-slate-100">
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-none ${u.memberType === 'Tech' ? 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20' : 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20'}`}>
                      {u.memberType || 'Non-Tech'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={(e) => { e.stopPropagation(); setEditData(u); }} className="text-blue-500 hover:text-blue-700 p-1.5 border border-transparent hover:border-blue-100 rounded-none transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={(e) => handleDelete(e, u._id)} className="text-blue-500 hover:text-rose-600 p-1.5 border border-transparent hover:border-rose-100 rounded-none transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-300 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-black">Edit Member Credentials</h2>
              <button onClick={() => setEditData(null)} className="text-slate-400 hover:text-[#F97316] font-bold text-xl cursor-pointer">✕</button>
            </div>
            
            <div className="p-8">
              <form id="editForm" onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Staff Name</label>
                  <input type="text" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                  <input type="email" value={editData.email || ''} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Password (Raw)</label>
                  <input type="text" value={editData.password || ''} onChange={e => setEditData({...editData, password: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                    <select value={editData.memberType || 'Non-Tech'} onChange={e => setEditData({...editData, memberType: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black cursor-pointer">
                      <option value="Tech">Tech</option>
                      <option value="Non-Tech">Non-Tech</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Date Joined</label>
                    <input type="date" value={editData.dateJoined || ''} onChange={e => setEditData({...editData, dateJoined: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-8 border-t border-slate-300 bg-slate-50 flex justify-end gap-4 shrink-0">
              <button type="button" onClick={() => setEditData(null)} className="px-6 py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-none text-sm hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button type="submit" form="editForm" className="px-8 py-3 bg-black hover:bg-[#F97316] text-white font-black uppercase tracking-widest rounded-none text-sm shadow-md transition-colors cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;