import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css'; 
import AntDesignHeader from './pages/header/Header';
import Sidebar from './pages/sidebar/Sidebar'; 
import Home from './pages/Admin/home/Dashboard.js';
import CmHome from './pages/User/home/LeadsByUser.js';
import Statuts from '../src/pages/Admin/Status/AdminStatusBoard.js';
import CmStatus from '../src/pages/User/Status/LeadStatusBoard.js';
import Charts from './pages/Admin/charts/charts.js';
import CmCharts from './pages/User/charts/charts.js';
import PostLead from './pages/lead/PostLead';
import UpdateLead from './pages/lead/UpdateLead';
import LeadDetails from './pages/lead/leadDetails.js';
import RedirectBasedOnUsername from '../src/pages/Admin/security/RoleBasedRedirect.js'; 
import Redirect from '../src/pages/User/security/usersStatusBoard.js';
import RedirectBasedOnName from './pages/Admin/security/NameBasedRedirect.js';
import Redirect2 from '../src/pages/User/security/usersNotification.js';
import NoMatch from './pages/noMatch/NoMatch';
import Chat from './pages/chat/Chat.js';
import Notification from './pages/Admin/notification/Notification.js';
import CMNotifications from './pages/User/notification/Notification.js';
import Calendar from './pages/MeetingComponent.js';




function App() {
  return (
    <div className="app-container">
      <AntDesignHeader />
      <Sidebar />
      <div className="app-content">
        <Routes>
          {/* Apply redirect only for specific users */}
          <Route path="/" element={
            <RedirectBasedOnUsername>
              <Home />
            </RedirectBasedOnUsername>
          } />
          <Route path="/Statuts" element={
            <Redirect>
              <Statuts />
            </Redirect>
          } />
          <Route path="/Charts" element={
            <RedirectBasedOnName>
              <Charts />
            </RedirectBasedOnName>
          } />
          <Route path="/Notification" element={
            <Redirect2>
              <Notification />
            </Redirect2>
          } />
          <Route path="/Commercial/Leads" element={<CmHome />} />
          <Route path="/Commercial/Statuts" element={<CmStatus />} />
          <Route path="/Commercial/Charts" element={<CmCharts />} />
          <Route path="/Lead" element={<PostLead />} />
          <Route path="/Lead/:id" element={<UpdateLead />} />
          <Route path="/lead/:leadId/details" element={<LeadDetails />} />
          <Route path="*" element={<NoMatch />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/Calendar" element={<Calendar />} />
          <Route path="/Commercial/Notifications" element={<CMNotifications />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;