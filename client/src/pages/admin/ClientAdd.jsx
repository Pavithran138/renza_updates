import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ClientAdd = () => {
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', { 
        companyName, 
        name, 
        email, 
        phone, 
        projectDetails, 
        status: 'Pending' 
      });
      navigate('/admin/clients');
    } catch (err) {
      alert('Failed to add client. Please try again.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-50 flex flex-col font-sans p-6 sm:p-10">
      
      <div className="bg-white border border-slate-200 flex flex-col flex-1 shadow-sm">
        
        {/* Top Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-200 bg-white shrink-0">
          <div>
            <h1 className="text-3xl font-black text-black">Register New Client</h1>
            <p className="text-sm font-bold text-slate-500 mt-1">Add a new company or individual to your agency directory.</p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-none text-sm transition-colors hover:bg-slate-50 cursor-pointer">
              Cancel
            </button>
            <button type="submit" form="clientForm" className="px-8 py-3 bg-black text-white font-extrabold rounded-none text-sm shadow-md transition-colors hover:bg-[#F97316] cursor-pointer">
              Save Client
            </button>
          </div>
        </div>

        {/* Full View Content Canvas */}
        <div className="p-10 flex-1 overflow-y-auto">
          <form id="clientForm" onSubmit={handleSubmit} className="space-y-8 w-full max-w-5xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">Primary Contact Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-bold text-black transition-shadow" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">Project Details / Scope</label>
              <textarea value={projectDetails} onChange={(e) => setProjectDetails(e.target.value)} rows="5" placeholder="Provide a brief overview of the client's needs, budget, or links..." className="w-full bg-white border border-slate-300 p-4 rounded-none text-sm focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none font-medium text-slate-800 transition-shadow resize-none"></textarea>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientAdd;