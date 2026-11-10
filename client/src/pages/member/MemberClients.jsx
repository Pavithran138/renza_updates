import React, { useState, useEffect } from 'react';
import api from '../../api';

const MemberClients = () => {
  const [clients, setClients] = useState([]);
  const [clientTasks, setClientTasks] = useState([]); // NEW: Holds tasks for the modal
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch clients AND client tasks simultaneously
      const [clientsRes, tasksRes] = await Promise.all([
        api.get('/clients'),
        api.get('/clienttasks')
      ]);
      setClients(clientsRes.data);
      setClientTasks(tasksRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch client data", err);
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      (client.name && client.name.toLowerCase().includes(query)) ||
      (client.companyName && client.companyName.toLowerCase().includes(query)) ||
      (client.email && client.email.toLowerCase().includes(query))
    );
  });

  // Get active tasks for the selected client in the modal
  const getSelectedClientTasks = () => {
    if (!selectedClient) return [];
    return clientTasks.filter(task => 
      (task.client || '').toLowerCase() === (selectedClient.name || '').toLowerCase()
    );
  };

  return (
    <div className="p-6 sm:p-10 w-full mx-auto font-sans text-slate-800 bg-[#F4F6F8] min-h-screen max-w-[1600px]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Client Roster</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Agency Active Client Database</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 border border-slate-300 shadow-sm rounded-none">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by client name, company, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 p-3 pl-10 rounded-none text-sm focus:ring-2 focus:ring-[#3949ab] outline-none font-bold text-black transition-colors"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="border border-slate-300 overflow-x-auto rounded-none shadow-sm bg-white">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-300">
              <th className="py-4 px-6 border-r border-slate-200">Client Details</th>
              <th className="py-4 px-6 border-r border-slate-200">Company</th>
              <th className="py-4 px-6 border-r border-slate-200">Contact Information</th>
              <th className="py-4 px-6 border-r border-slate-200 text-center">Status</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm bg-white">
            {loading ? (
              <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Database...</td></tr>
            ) : filteredClients.length === 0 ? (
              <tr><td colSpan="5" className="py-10 text-center text-slate-400 font-bold">No clients found matching your search.</td></tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 border-r border-slate-100">
                    <p className="font-black text-black text-sm uppercase tracking-wider">{client.name}</p>
                  </td>
                  <td className="py-4 px-6 border-r border-slate-100">
                    <span className="font-black text-[#3949ab] uppercase tracking-wide text-xs">{client.companyName || '-'}</span>
                  </td>
                  <td className="py-4 px-6 border-r border-slate-100">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        {client.email || '-'}
                      </p>
                      {client.phone && (
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          {client.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-r border-slate-100 text-center">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none border ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                      {client.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-[#F97316] transition-colors cursor-pointer w-full max-w-[140px] mx-auto block"
                    >
                      View Updates
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* READ-ONLY MODAL: Dynamic Client Updates & Tasks */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-none w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-300">
            
            <div className="p-6 border-b border-slate-300 bg-slate-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-black">{selectedClient.name}</h2>
                <p className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest mt-1">Live Project Workspace</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-black font-bold text-xl cursor-pointer">✕</button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto bg-white max-h-[60vh] space-y-8">
              
              {/* SECTION 1: Admin Notes & Details */}
              <div className="border border-slate-200 bg-slate-50 rounded-none">
                 <div className="bg-slate-100 p-3 border-b border-slate-200">
                   <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Admin Notes & Requirements</h3>
                 </div>
                 <div className="p-4">
                    {selectedClient.projectDetails ? (
                      <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedClient.projectDetails}</p>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic">No general requirements posted.</p>
                    )}
                 </div>
              </div>

              {/* SECTION 2: Active Assigned Tasks for this Client */}
              <div className="border border-slate-200 bg-slate-50 rounded-none">
                 <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Deliverables</h3>
                   <span className="px-2 py-0.5 bg-[#3949ab] text-white text-[9px] font-black uppercase tracking-widest">{getSelectedClientTasks().length} Tasks</span>
                 </div>
                 <div className="p-0">
                    {getSelectedClientTasks().length > 0 ? (
                      <div className="divide-y divide-slate-200">
                        {getSelectedClientTasks().map(task => (
                          <div key={task._id} className="p-4 hover:bg-white transition-colors flex justify-between items-center">
                            <div>
                              <p className="text-sm font-black text-slate-800">{task.title}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Assigned to: {task.assignedTo}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest border ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-xs font-bold text-slate-400">No active tasks assigned for this client yet.</p>
                      </div>
                    )}
                 </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-300 bg-slate-50 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedClient(null)} 
                className="px-8 py-3 bg-black hover:bg-[#F97316] text-white font-black uppercase tracking-widest rounded-none text-sm transition-colors cursor-pointer"
              >
                Close Workspace
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MemberClients;