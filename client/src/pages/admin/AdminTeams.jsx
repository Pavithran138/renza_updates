import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState(null);
  const [newMemberToAdd, setNewMemberToAdd] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        api.get('/teams'),
        api.get('/users')
      ]);
      setTeams(teamsRes.data);
      setUsers(usersRes.data.filter(u => u.name !== 'Master Admin'));
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this squad?")) return;
    try {
      await api.delete(`/teams/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete team");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/teams/${editData._id}`, {
        name: editData.name,
        specialty: editData.specialty,
        members: editData.members
      });
      setEditData(null);
      setNewMemberToAdd('');
      fetchData();
    } catch (err) {
      alert("Failed to update team details");
    }
  };

  const addMemberToEdit = () => {
    if (!newMemberToAdd) return;
    if (editData.members.includes(newMemberToAdd)) return alert("Member already in squad.");
    setEditData({ ...editData, members: [...editData.members, newMemberToAdd] });
    setNewMemberToAdd('');
  };

  const removeMemberFromEdit = (memberName) => {
    setEditData({ ...editData, members: editData.members.filter(m => m !== memberName) });
  };

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const availableUsersToAdd = editData ? users.filter(u => !editData.members.includes(u.name || u.username)) : [];

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-slate-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-black tracking-tight">Manage Teams</h1>
        <button onClick={() => navigate('/admin/teams/add')} className="px-6 py-3 bg-black text-white font-bold rounded-none text-sm hover:bg-[#F97316] transition-colors cursor-pointer shadow-md uppercase tracking-widest">+ Create Team</button>
      </div>

      <div className="mb-6">
        <div className="relative w-full max-w-md border border-slate-300 rounded-none overflow-hidden flex items-center bg-white mb-2">
          <svg className="w-5 h-5 ml-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search by squad name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-3 px-4 text-sm font-semibold text-black outline-none" />
        </div>
        <div className="w-40 h-0.5 bg-[#F97316]"></div>
      </div>

      <div className="border border-slate-300 overflow-hidden rounded-none">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-white text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-300">
              <th className="py-4 px-6 border-r border-slate-200">Squad Name <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-4 px-6 border-r border-slate-200">Specialty Focus <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-4 px-6 border-r border-slate-200">Member Count <span className="text-slate-400 ml-1">↕</span></th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm bg-white">
            {filteredTeams.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-bold">No teams found.</td></tr>
            ) : (
              filteredTeams.map((team) => (
                <tr key={team._id} onClick={() => navigate(`/admin/teams/${team._id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="py-4 px-6 font-bold text-black border-r border-slate-100">{team.name}</td>
                  <td className="py-4 px-6 text-slate-600 border-r border-slate-100">{team.specialty || 'General Operations'}</td>
                  <td className="py-4 px-6 text-slate-800 font-black border-r border-slate-100">{(team.members || []).length} Staff Assigned</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={(e) => { e.stopPropagation(); setEditData(team); }} className="text-blue-500 hover:text-blue-700 p-1.5 border border-transparent hover:border-blue-100 rounded-none transition-colors" title="Edit Team"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={(e) => handleDelete(e, team._id)} className="text-rose-500 hover:text-rose-700 p-1.5 border border-transparent hover:border-rose-100 rounded-none transition-colors" title="Delete Team"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/teams/${team._id}`); }} className="text-slate-500 hover:text-black p-1.5 border border-transparent hover:border-slate-200 rounded-none transition-colors" title="View Details"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
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
          <div className="bg-white rounded-none w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-300 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-black text-black">Edit Squad & Members</h2>
              <button onClick={() => { setEditData(null); setNewMemberToAdd(''); }} className="text-slate-400 hover:text-[#F97316] font-bold text-xl cursor-pointer">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <form id="editTeamForm" onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Squad Name *</label>
                    <input type="text" required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Specialty Focus</label>
                    <input type="text" value={editData.specialty} onChange={e => setEditData({...editData, specialty: e.target.value})} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">Manage Staff Assignments</h3>
                  <div className="flex gap-4 mb-6">
                    <select value={newMemberToAdd} onChange={(e) => setNewMemberToAdd(e.target.value)} className="flex-1 bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black cursor-pointer">
                      <option value="">-- Select Staff to Add --</option>
                      {availableUsersToAdd.map(u => <option key={u._id} value={u.name || u.username}>{u.name || u.username}</option>)}
                    </select>
                    <button type="button" onClick={addMemberToEdit} className="px-6 py-3 bg-[#F97316] hover:bg-black text-white font-black uppercase tracking-widest rounded-none text-xs transition-colors cursor-pointer flex items-center gap-2">
                      <span className="text-lg leading-none">+</span> Add
                    </button>
                  </div>

                  <div className="border border-slate-300 bg-slate-50 p-4 max-h-[250px] overflow-y-auto">
                    {editData.members.length === 0 ? (
                      <p className="text-sm font-bold text-slate-400 italic">No members currently in this squad.</p>
                    ) : (
                      <ul className="space-y-3">
                        {editData.members.map((member, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-white border border-slate-200 p-3">
                            <span className="font-bold text-black">{member}</span>
                            <button type="button" onClick={() => removeMemberFromEdit(member)} className="text-rose-500 hover:text-rose-700 font-bold text-xs uppercase tracking-widest cursor-pointer px-3 py-1 border border-transparent hover:border-rose-200">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-8 border-t border-slate-300 bg-slate-50 flex justify-end gap-4 shrink-0">
              <button type="button" onClick={() => { setEditData(null); setNewMemberToAdd(''); }} className="px-6 py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-none text-sm hover:bg-slate-100 cursor-pointer transition-colors">Cancel</button>
              <button type="submit" form="editTeamForm" className="px-8 py-3 bg-black hover:bg-[#F97316] text-white font-black uppercase tracking-widest rounded-none text-sm shadow-md transition-colors cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeams;