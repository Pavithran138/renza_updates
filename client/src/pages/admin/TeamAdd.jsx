import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const TeamAdd = () => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  
  // New state for the member search bar
  const [memberSearch, setMemberSearch] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.filter(u => u.name !== 'Master Admin'));
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleMember = (memberName) => {
    setMembers(prev => 
      prev.includes(memberName) 
        ? prev.filter(m => m !== memberName)
        : [...prev, memberName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Team name is required");
    try {
      await api.post('/teams', { name, specialty, members });
      navigate('/admin/teams');
    } catch (err) {
      alert("Failed to create team");
    }
  };

  // Filter users dynamically based on the search input
  const filteredUsers = users.filter(u => 
    (u.name || u.username).toLowerCase().includes(memberSearch.toLowerCase()) ||
    (u.memberType || '').toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-[1600px] mx-auto font-sans text-slate-800">
      
      {/* Top Header & Actions */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Create New Team</h1>
          <p className="text-xs font-bold text-slate-500 mt-1">Assemble staff into specialized squads.</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-md text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="teamForm" 
            className="px-6 py-2.5 bg-black hover:bg-[#F97316] text-white font-extrabold rounded-md text-sm shadow-md transition-all cursor-pointer"
          >
            Assemble Team
          </button>
        </div>
      </div>

      {/* Full-Width Form Canvas */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <form id="teamForm" onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Team Squad Name *</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-sm font-semibold text-black outline-none focus:border-[#F97316] transition-colors" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Team Specialty / Focus</label>
              <input 
                type="text" 
                value={specialty} 
                onChange={(e) => setSpecialty(e.target.value)} 
                className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-sm font-semibold text-black outline-none focus:border-[#F97316] transition-colors" 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400">Select Squad Members</label>
              <span className="text-xs font-bold text-[#F97316] bg-[#F97316]/10 px-3 py-1 rounded-md">{members.length} Selected</span>
            </div>
            
            {/* Searchable Member List Box */}
            <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
              
              {/* Member Search Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
                <svg className="w-5 h-5 absolute left-7 top-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search members by name or role..." 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm font-semibold text-black outline-none focus:ring-2 focus:ring-[#F97316] transition-shadow"
                />
              </div>
              
              {/* Vertical Member List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400 font-medium">No members found matching your search.</div>
                ) : (
                  filteredUsers.map(user => {
                    const memberName = user.name || user.username;
                    const isSelected = members.includes(memberName);
                    const isTech = (user.memberType || '').toUpperCase() === 'TECH';
                    
                    return (
                      <label key={user._id} className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isSelected ? 'bg-[#F97316]/5' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-4">
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => handleToggleMember(memberName)} 
                            className="w-5 h-5 text-[#F97316] rounded border-slate-300 focus:ring-[#F97316] transition-colors cursor-pointer" 
                          />
                          <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-slate-600 font-black text-sm">
                            {memberName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isSelected ? 'text-[#F97316]' : 'text-black'}`}>{memberName}</p>
                            <p className="text-xs font-medium text-slate-500">{user.email || 'Member Account'}</p>
                          </div>
                        </div>
                        
                        {/* Tech / Non-Tech Badge */}
                        <span className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md border ${
                          isTech 
                            ? 'bg-black text-white border-black shadow-sm' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {user.memberType || 'NON-TECH'}
                        </span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          </div>
          
        </form>
      </div>

    </div>
  );
};

export default TeamAdd;