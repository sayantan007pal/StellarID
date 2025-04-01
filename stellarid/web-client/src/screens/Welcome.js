import React from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome({ setAuthenticated }) {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // In a real app, this would authenticate the user
    const demoAccount = {
      publicKey: 'GBZXGFRCTV4QAE6LOSXAEY6U2EN4FUQA4GHBC255QB24BUTD46SRA3AK',
      secretSeed: 'SCDJF3DQC7TZHKYISOA7E6TXYD7EXT3QVQNL3DWOSIBWRBWYDBIYV3E2'
    };
    
    localStorage.setItem('stellarId_auth', JSON.stringify(demoAccount));
    setAuthenticated(true);
    navigate('/dashboard');
  };
  
  const handleCreateAccount = () => {
    navigate('/create-identity');
  };

  return (
    <div className="text-center py-5">
      <div className="mx-auto mb-4" style={{width: '100px', height: '100px', borderRadius: '50%', background: '#0d6efd', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" className="bi bi-shield-lock" viewBox="0 0 16 16">
          <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
          <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415z"/>
        </svg>
      </div>
      
      <h1 className="mb-3">Welcome to StellarID</h1>
      <p className="mb-5 text-muted">Your decentralized identity on the Stellar blockchain</p>
      
      <div className="row mb-5">
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Privacy Focused</h5>
              <p className="card-text">You control what you share</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Secure by Design</h5>
              <p className="card-text">Built on Stellar blockchain</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Financial Access</h5>
              <p className="card-text">Open doors to services</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="d-grid gap-2 col-md-6 mx-auto">
        <button className="btn btn-primary btn-lg" onClick={handleLogin}>
          Use Demo Account
        </button>
        <button className="btn btn-outline-primary btn-lg" onClick={handleCreateAccount}>
          Create New Account
        </button>
      </div>
    </div>
  );
}

export default Welcome;
