import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css'; // Global styles
import AntDesignHeader from './pages/header/Header';
import Sidebar from './pages/sidebar/Sidebar'; // Import Sidebar for layout
import Dashboard from './pages/dashboard/Dashboard';
import NoMatch from './pages/noMatch/NoMatch';
import PostLead from './pages/lead/PostLead';
import UpdateLead from './pages/lead/UpdateLead';
import UserLeads from './pages/dashboard/LeadsByUser';
import Statuts from './pages/leadsStatutBoard/LeadStatusBoard';
import LeadDetails from './pages/lead/leadDetails.js';


function App() {
  return (
    <div className="app-container">
      <AntDesignHeader />
      <Sidebar />
      <div className="app-content">
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='*' element={<NoMatch />} />
          <Route path='/Lead' element={<PostLead />} />
          <Route path='/Lead/:id' element={<UpdateLead />} />
          <Route path='/Leads' element={<UserLeads />} />
          <Route path='/Statuts' element={<Statuts />} />
          <Route path="/lead/:leadId/details" element={<LeadDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
