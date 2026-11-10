import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';

// --- ADMIN IMPORTS ---
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import ManageClients from './pages/admin/ManageClients';
import ClientAdd from './pages/admin/ClientAdd';
import ClientDetails from './pages/admin/ClientDetails';
import AdminCompanyTasks from './pages/admin/AdminCompanyTasks';
import AdminClientTasks from './pages/admin/AdminClientTasks';
import AdminLiveUpdates from './pages/admin/AdminLiveUpdates';
import AdminTeams from './pages/admin/AdminTeams';
import TeamAdd from './pages/admin/TeamAdd';
import AdminChat from './pages/admin/AdminChat';
import AdminMembers from './pages/admin/AdminMembers';
import TaskAdd from './pages/admin/TaskAdd';
import MemberAdd from './pages/admin/MemberAdd';
import MemberDetails from './pages/admin/MemberDetails';
import TeamDetails from './pages/admin/TeamDetails';
import AdminProfile from './pages/admin/AdminProfile';
import AdminTaskDiscussion from './pages/admin/AdminTaskDiscussion';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminTaskDetails from './pages/admin/AdminTaskDetails'; // The Details Page

// --- MEMBER IMPORTS ---
import MemberLayout from './layouts/MemberLayout';
import MemberHome from './pages/member/MemberHome';
import MemberTasks from './pages/member/MemberTasks';
import MemberClients from './pages/member/MemberClients';
import MemberTeam from './pages/member/MemberTeam';
import MemberChat from './pages/member/MemberChat'; 
import MemberTeamDetails from './pages/member/MemberTeamDetails';
import MemberTaskDiscussion from './pages/member/MemberTaskDiscussion';
import MemberProfile from './pages/member/MemberProfile';
import MemberAnnouncements from './pages/member/MemberAnnouncements';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* ========================================= */}
        {/* ADMIN ROUTES                              */}
        {/* ========================================= */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
          
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/updates" element={<AdminLiveUpdates />} />
          
          <Route path="/admin/clients" element={<ManageClients />} />
          <Route path="/admin/clients/add" element={<ClientAdd />} />
          <Route path="/admin/clients/:id" element={<ClientDetails />} />
          
          {/* --- TASK PIPELINE ROUTES (Grouped for safety) --- */}
          <Route path="/admin/tasks/add" element={<TaskAdd />} />
          <Route path="/admin/tasks/company" element={<AdminCompanyTasks />} />
          <Route path="/admin/tasks/client" element={<AdminClientTasks />} />
          
          {/* The Task Details & Editing Routes */}
          <Route path="/admin/tasks/company/:id" element={<AdminTaskDetails />} />
          <Route path="/admin/tasks/client/:id" element={<AdminTaskDetails />} />
          
          {/* Discussion Threads */}
          <Route path="/admin/tasks/discussion/:type/:id" element={<AdminTaskDiscussion />} />
          {/* ----------------------------------------------- */}

          <Route path="/admin/teams" element={<AdminTeams />} />
          <Route path="/admin/teams/add" element={<TeamAdd />} />
          <Route path="/admin/teams/:id" element={<TeamDetails />} />
          
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/members/add" element={<MemberAdd />} />
          <Route path="/admin/members/:id" element={<MemberDetails />} />
          
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/chat" element={<AdminChat />} />
        </Route>

        {/* ========================================= */}
        {/* MEMBER ROUTES                             */}
        {/* ========================================= */}
        <Route element={<MemberLayout />}>
          <Route path="/member" element={<Navigate to="/member/home" replace />} />
          
          <Route path="/member/home" element={<MemberHome />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/clients" element={<MemberClients />} />
          
          <Route path="/member/tasks/mine" element={<MemberTasks />} />
          <Route path="/member/tasks/team" element={<MemberTasks />} />
          <Route path="/member/tasks/discussion/:type/:id" element={<MemberTaskDiscussion />} />
          
          <Route path="/member/team" element={<MemberTeam />} />
          <Route path="/member/team/:id" element={<MemberTeamDetails />} />
          
          <Route path="/member/announcements" element={<MemberAnnouncements />} />
          <Route path="/member/chat" element={<MemberChat />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;