import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css'; 
import AntDesignHeader from './pages/header/Header';
import Sidebar from './pages/sidebar/Sidebar'; 
import Home from './pages/Admin/home/Dashboard.js';
import CM_Home from './pages/User/home/LeadsByUser.js';
import Statuts from '../src/pages/Admin/Status/AdminStatusBoard.js';
import CM_Status from '../src/pages/User/Status/LeadStatusBoard.js';
import Charts from './pages/Admin/charts/charts.js';
import CM_Charts from './pages/User/charts/charts.js';
import PostLead from './pages/lead/PostLead';
import UpdateLead from './pages/lead/UpdateLead';
import LeadDetails from './pages/lead/leadDetails.js';
import RedirectBasedOnUsername from '../src/pages/Admin/security/RoleBasedRedirect.js'; 
import Redirect from '../src/pages/User/security/usersStatusBoard.js';
import RedirectBasedOnName from './pages/Admin/security/NameBasedRedirect.js'; 
import NoMatch from './pages/noMatch/NoMatch';


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
          <Route path="/Commercial/Leads" element={<CM_Home />} />
          <Route path="/Commercial/Statuts" element={<CM_Status />} />
          <Route path="/Commercial/Charts" element={<CM_Charts />} />
          <Route path="/Lead" element={<PostLead />} />
          <Route path="/Lead/:id" element={<UpdateLead />} />
          <Route path="/lead/:leadId/details" element={<LeadDetails />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
