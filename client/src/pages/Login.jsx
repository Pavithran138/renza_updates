import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/login', {
        username: credentials.username.trim(),
        password: credentials.password
      });
      
      const user = res.data;
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      
      if (user.role === 'Admin' || user.role === 'SubAdmin' || user.name === 'Master Admin') {
        navigate('/admin'); 
      } else {
        navigate('/member');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Invalid username or password';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans overflow-hidden bg-slate-50">
      
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 relative z-10 bg-white min-h-screen shadow-2xl">
        <div className="max-w-md w-full space-y-10 pr-4">
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-[#479087] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#479087]/30">
              R
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm font-bold text-slate-500 tracking-wide">Sign in to the Daily Updates Portal.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-lg text-sm font-bold shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Username or Email</label>
              <input 
                type="text" 
                required 
                placeholder="Enter your credential..." 
                value={credentials.username} 
                onChange={e => setCredentials({...credentials, username: e.target.value})} 
                className="w-full bg-white border border-slate-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-[#479087] outline-none font-bold text-slate-800 transition-all hover:border-[#479087]/50 shadow-sm" 
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••" 
                value={credentials.password} 
                onChange={e => setCredentials({...credentials, password: e.target.value})} 
                className="w-full bg-white border border-slate-200 p-4 pr-12 rounded-xl text-sm focus:ring-2 focus:ring-[#479087] outline-none font-bold text-slate-800 transition-all hover:border-[#479087]/50 tracking-widest shadow-sm" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-slate-400 hover:text-[#479087] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a9.953 9.953 0 015.71-2.29c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 bg-[#479087] hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-[#479087]/20 text-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          
          <div className="text-center pt-8">
            <p className="text-xs font-bold text-slate-400">© 2026 Daily Updates OS. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex w-[55%] bg-[#479087] relative items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="relative z-10 text-center px-12">
           <h2 className="text-5xl font-black text-white tracking-tight mb-6">Renza Agency OS</h2>
           <p className="text-teal-100 text-lg font-bold tracking-wide max-w-lg mx-auto">
             Manage pipelines, track deliverables, and sync with your team in real-time.
           </p>
        </div>
      </div>

    </div>
  );
};

export default Login;