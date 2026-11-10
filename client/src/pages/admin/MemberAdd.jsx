import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const MemberAdd = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberType, setMemberType] = useState('Non-Tech');
  const [dateJoined, setDateJoined] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { 
        name, 
        email, 
        username: email, // Using email as username standard
        password, 
        memberType,
        dateJoined 
      });
      navigate('/admin/members');
    } catch (err) {
      alert('Failed to add member.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans p-6 sm:p-10">
      <div className="bg-white border border-slate-300 flex flex-col flex-1 shadow-sm rounded-none">
        
        <div className="flex justify-between items-center p-8 border-b border-slate-300 bg-white shrink-0">
          <div>
            <h1 className="text-3xl font-black text-black">Register New Member</h1>
            <p className="text-sm font-bold text-slate-500 mt-1">Add staff credentials and technical designations to the directory.</p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-none text-sm transition-colors hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" form="memberForm" className="px-8 py-3 bg-black text-white font-black uppercase tracking-widest rounded-none text-sm shadow-md transition-colors hover:bg-[#F97316] cursor-pointer">Save Member</button>
          </div>
        </div>

        <div className="p-10 flex-1 overflow-y-auto">
          <form id="memberForm" onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Full Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Email Address *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Password Credentials *</label>
                <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Date Joined</label>
                <input type="date" required value={dateJoined} onChange={(e) => setDateJoined(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Staff Category</label>
              <select value={memberType} onChange={(e) => setMemberType(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black cursor-pointer">
                <option value="Tech">Tech</option>
                <option value="Non-Tech">Non-Tech</option>
              </select>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberAdd;