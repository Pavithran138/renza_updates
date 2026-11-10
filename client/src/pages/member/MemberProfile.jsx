import React, { useState, useEffect } from 'react';
import api from '../../api';

const MemberProfile = () => {
  const rawStorage = JSON.parse(sessionStorage.getItem('currentUser')) || {};
  const sessionUser = rawStorage.user || rawStorage.data || rawStorage;
  const currentId = sessionUser._id || sessionUser.id;

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  
  const [stats, setStats] = useState({ active: 0, completed: 0, total: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const fetchProfileAndStats = async () => {
    try {
      const [usersRes, tasksRes, clientTasksRes] = await Promise.all([
        api.get('/users'),
        api.get('/tasks'),
        api.get('/clienttasks')
      ]);

      // 1. Get real-time user data
      const myUser = usersRes.data.find(u => u._id === currentId);
      if (myUser) {
        setProfileData({
          name: myUser.name || '',
          email: myUser.email || '',
          username: myUser.username || '',
          password: myUser.password || ''
        });
      }

      // 2. Calculate Performance Stats
      const allTasks = [...tasksRes.data, ...clientTasksRes.data];
      const myName = String(myUser?.name || sessionUser.name || '').toLowerCase().trim();
      const myUsername = String(myUser?.username || sessionUser.username || '').toLowerCase().trim();

      const myTasks = allTasks.filter(task => {
        const assigned = String(task.assignedTo || '').toLowerCase().trim();
        return assigned === myName || assigned === myUsername;
      });

      const completedCount = myTasks.filter(t => t.status === 'Completed').length;
      const activeCount = myTasks.length - completedCount;

      setStats({
        active: activeCount,
        completed: completedCount,
        total: myTasks.length
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile data", err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 font-bold text-[#3949ab] text-center w-full mt-20 text-xl tracking-widest uppercase">Loading Profile...</div>;

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen max-w-[1600px]">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black tracking-tight">My Profile</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">View assigned credentials and track personal performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Account Credentials (READ ONLY) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-300 shadow-sm rounded-none flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              {/* REPLACED FINGERPRINT WITH A PROFESSIONAL ID BADGE ICON */}
              <svg className="w-5 h-5 text-[#3949ab]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Account Details</h2>
            </div>
            
            <div className="p-6">
              
              {/* READ-ONLY DISPLAY */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                  <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none text-sm font-bold text-slate-800">
                    {profileData.name}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                  <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none text-sm font-bold text-slate-800">
                    {profileData.email}
                  </div>
                </div>

                {profileData.username && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Username</label>
                    <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-none text-sm font-bold text-slate-800">
                      {profileData.username}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Secure Password</label>
                  <div className="w-full bg-slate-50 border border-slate-200 p-3 pr-10 rounded-none text-sm font-bold text-slate-800 tracking-widest min-h-[46px] flex items-center">
                    {showPassword ? profileData.password : '••••••••'}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-[#3949ab] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.953 9.953 0 015.71-2.29c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                
                <div className="pt-4 border-t border-slate-100 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Administration to modify credentials</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-slate-300 shadow-sm rounded-none overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <svg className="w-5 h-5 text-[#F97316]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">My Performance Metrics</h2>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Active Tasks Metric */}
              <div className="p-6 border border-slate-200 bg-blue-50/50 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-black text-[#3949ab] uppercase tracking-widest mb-2">Currently Pursuing</span>
                <span className="text-5xl font-black text-slate-800 mb-2">{stats.active}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Deliverables</span>
              </div>

              {/* Completed Tasks Metric */}
              <div className="p-6 border border-emerald-200 bg-emerald-50/50 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Successfully Completed</span>
                <span className="text-5xl font-black text-slate-800 mb-2">{stats.completed}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Resolved</span>
              </div>

            </div>
            
            {/* Total Metric Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Lifetime Assigned Tasks</span>
              <span className="px-4 py-1 bg-black text-white text-xs font-black rounded-none">{stats.total} Total</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MemberProfile;