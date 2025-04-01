import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Welcome from './screens/Welcome';
import CreateIdentity from './screens/CreateIdentity';
import Attestation from './screens/Attestation';
import Navbar from './components/Navbar';

function App() {
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem('stellarId_auth') ? true : false
  );

  return (
    <Router>
      {authenticated && <Navbar />}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={authenticated ? <Navigate to="/dashboard" /> : <Welcome setAuthenticated={setAuthenticated} />} />
          <Route path="/dashboard" element={authenticated ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/create-identity" element={authenticated ? <CreateIdentity /> : <Navigate to="/" />} />
          <Route path="/attestation/:type" element={authenticated ? <Attestation /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
