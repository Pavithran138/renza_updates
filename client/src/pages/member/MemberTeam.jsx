import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const MemberTeam = () => {
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const currentUser = rawStorage.user || rawStorage.data || rawStorage; 
  const currentName = (currentUser.name || currentUser.fullname || '').toLowerCase().trim();
  const currentUsername = (currentUser.username || currentUser.email || '').toLowerCase().trim();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      // Filter strictly for teams this member is in
      const filtered = res.data.filter(team => {
        if (!team.members || !Array.isArray(team.members)) return false;
        return team.members.some(member => {
          const mString = typeof member === 'string' ? member : (member.name || member.username || '');
          const mClean = mString.toLowerCase().trim();
          return mClean === currentName || mClean === currentUsername;
        });
      });
      setMyTeams(filtered);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch teams", err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 font-bold text-[#3949ab] text-center w-full mt-20 text-xl tracking-widest uppercase">Locating Squads...</div>;

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen max-w-[1600px]">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black tracking-tight">My Team Overview</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Squad assignments and department roster.</p>
      </div>

      {myTeams.length === 0 ? (
        <div className="bg-white border border-slate-300 p-10 text-center rounded-none shadow-sm">
          <p className="text-sm font-bold text-slate-500">You are not currently assigned to any active teams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {myTeams.map(team => (
            <div key={team._id} className="bg-white border border-slate-300 shadow-sm rounded-none flex flex-col hover:border-[#3949ab] transition-colors">
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                  <h2 className="text-lg font-black text-black uppercase tracking-wider">{team.name}</h2>
                  <p className="text-[10px] font-bold text-[#3949ab] uppercase tracking-widest mt-1">{team.specialty || 'General Operations'}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-widest rounded-none">
                  Active Squad
                </span>
              </div>

              <div className="p-6 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Teammates ({team.members?.length || 0})</p>
                <div className="flex flex-wrap gap-2">
                  {team.members?.map((member, idx) => {
                    const memberName = typeof member === 'string' ? member : member.name;
                    return (
                      <div key={idx} className="flex items-center bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-none">
                        <div className="w-5 h-5 bg-[#3949ab] text-white flex items-center justify-center text-[10px] font-black rounded-none mr-2">
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{memberName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
                <button 
                  onClick={() => navigate(`/member/team/${team._id}`)}
                  className="w-full py-3 bg-black hover:bg-[#F97316] text-white text-[10px] font-black uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                >
                  Enter Workspace & Chat
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberTeam;