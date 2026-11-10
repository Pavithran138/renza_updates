import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminProfile = () => {
  const [stats, setStats] = useState({ staff: 0, clients: 0, teams: 0, tasks: 0 });
  const [adminCreds, setAdminCreds] = useState({ email: 'admin@renza.com', password: '••••••••' });
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [credsRes, usersRes, clientsRes, teamsRes, compTasksRes, cliTasksRes] = await Promise.all([
        api.get('/admin/credentials'),
        api.get('/users'),
        api.get('/clients'),
        api.get('/teams'),
        api.get('/tasks'),
        api.get('/clienttasks')
      ]);
      
      setAdminCreds(credsRes.data);
      
      setStats({
        staff: usersRes.data.filter(u => u.name !== 'Master Admin').length,
        clients: clientsRes.data.length,
        teams: teamsRes.data.length,
        tasks: compTasksRes.data.length + cliTasksRes.data.length
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to sync", err);
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditEmail(adminCreds.email);
    setEditPassword(adminCreds.password);
    setShowEditModal(true);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!editEmail || !editPassword) return alert("Fields cannot be empty.");
    try {
      await api.put('/admin/credentials', { email: editEmail, password: editPassword });
      setAdminCreds({ email: editEmail, password: editPassword });
      setShowEditModal(false);
      setShowPassword(false);
      alert("Credentials updated securely. Use these for your next login.");
    } catch (err) {
      alert("Failed to update credentials in database.");
    }
  };

  if (loading) return <div className="p-10 font-bold text-slate-500">Syncing System Data...</div>;

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col p-6 sm:p-10 font-sans">
      
      {/* Top Profile Header */}
      <div className="bg-white border border-slate-300 p-10 mb-8 shadow-sm rounded-none flex items-center gap-8">
        <div className="w-32 h-32 bg-black text-white flex items-center justify-center font-black text-5xl rounded-full shadow-lg border-[6px] border-white outline outline-1 outline-slate-200 shrink-0">
          AM
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-black text-black tracking-tight">Master Admin</h1>
            <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-none">
              System Administrator
            </span>
          </div>
          <p className="text-sm font-bold text-slate-500 mb-6">{adminCreds.email}</p>
          <button onClick={handleOpenEdit} className="px-8 py-3 bg-[#F97316] text-white font-black uppercase tracking-widest text-xs rounded-none shadow-sm hover:bg-black transition-colors cursor-pointer">
            Edit Credentials
          </button>
        </div>
      </div>

      {/* Live System Statistics Grid */}
      <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 pl-1">Live Agency Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-300 p-6 rounded-none shadow-sm flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Total Staff Employed</span>
          <div className="text-5xl font-black text-black">{stats.staff}</div>
        </div>
        <div className="bg-white border border-slate-300 p-6 rounded-none shadow-sm flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Managed Clients</span>
          <div className="text-5xl font-black text-[#F97316]">{stats.clients}</div>
        </div>
        <div className="bg-white border border-slate-300 p-6 rounded-none shadow-sm flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Active Squads</span>
          <div className="text-5xl font-black text-black">{stats.teams}</div>
        </div>
        <div className="bg-white border border-slate-300 p-6 rounded-none shadow-sm flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Total Pipeline Tasks</span>
          <div className="text-5xl font-black text-emerald-600">{stats.tasks}</div>
        </div>
      </div>

      {/* Security & Access Panel */}
      <div className="bg-white border border-slate-300 rounded-none shadow-sm overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
           <h3 className="text-sm font-black text-black uppercase tracking-widest">Platform Security Settings</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Admin Username / Email</label>
            <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-none text-sm font-bold text-slate-800">
              {adminCreds.email}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Master Password</label>
            <div className="flex justify-between items-center w-full bg-slate-50 border border-slate-200 p-4 rounded-none">
              <span className="text-sm font-black text-slate-800 tracking-widest">
                {showPassword ? adminCreds.password : '••••••••'}
              </span>
              <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-[#F97316] transition-colors cursor-pointer">
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Credentials Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-300 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-black">Update Admin Credentials</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-[#F97316] font-bold text-xl cursor-pointer">✕</button>
            </div>
            <div className="p-8">
              <form id="editCredsForm" onSubmit={handleSaveCredentials} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">New Admin Email</label>
                  <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">New Master Password</label>
                  <input type="text" required value={editPassword} onChange={e => setEditPassword(e.target.value)} className="w-full bg-white border border-slate-300 p-3 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] outline-none font-bold text-black" />
                </div>
              </form>
            </div>
            <div className="p-8 border-t border-slate-300 bg-slate-50 flex justify-end gap-4 shrink-0">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-none text-sm hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button type="submit" form="editCredsForm" className="px-8 py-3 bg-black hover:bg-[#F97316] text-white font-black uppercase tracking-widest rounded-none text-sm shadow-md transition-colors cursor-pointer">Save Credentials</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProfile;