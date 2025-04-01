import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem('stellarId_auth'));
        if (!auth || !auth.publicKey) {
          throw new Error('Authentication data not found');
        }
        
        const response = await api.verifyIdentity(auth.publicKey);
        if (response.success) {
          setIdentity(response.data);
        } else {
          throw new Error(response.error || 'Failed to verify identity');
        }
      } catch (error) {
        console.error('Error fetching identity:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdentity();
  }, []);
  
  const getIdentityLevel = (score) => {
    return Math.floor(score / 20) + 1;
  };
  
  const requestAttestation = (type) => {
    navigate(`/attestation/${type}`);
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your identity...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Identity</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please try again or contact support.</p>
      </div>
    );
  }
  
  const level = getIdentityLevel(identity.verificationScore || 0);
  
  return (
    <div>
      <h2 className="mb-4">Your Identity Dashboard</h2>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="card-title">Identity Level {level}</h5>
              <p className="card-subtitle text-muted small">
                {level === 1 ? 'Self-declared' : 
                 level === 2 ? 'Partially Verified' : 
                 level === 3 ? 'Basic Verification' : 
                 level === 4 ? 'Strong Verification' : 'Full Verification'}
              </p>
            </div>
            <div className="d-flex">
              {[1, 2, 3, 4, 5].map((l) => (
                <div 
                  key={l}
                  className={`rounded-circle mx-1`} 
                  style={{
                    width: '12px', 
                    height: '12px', 
                    background: l <= level ? '#0d6efd' : '#dee2e6'
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-light p-2 rounded mb-3">
            <code className="small">{identity.userPublicKey}</code>
          </div>
          
          <div className="border-top pt-3">
            <div className="d-flex justify-content-between mb-2">
              <h6>Attestations</h6>
            </div>
            
            {identity.attestations && identity.attestations.length > 0 ? (
              identity.attestations.map((attestation, index) => (
                <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                  <div>
                    <p className="mb-0 fw-medium">{attestation.attestationData.type.replace(/-/g, ' ')}</p>
                    <small className="text-muted">{new Date(attestation.attestedAt).toLocaleDateString()}</small>
                  </div>
                  <span className={`badge ${attestation.status === 'verified' ? 'bg-success' : 'bg-warning'}`}>
                    {attestation.status || 'verified'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted fst-italic">
                You don't have any attestations yet. Request your first attestation to build your identity.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <h5 className="mb-3">Build Your Identity</h5>
      
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3 mx-auto" style={{width: '48px', height: '48px', borderRadius: '50%', background: '#e6f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
              </div>
              <h6 className="card-title">Government ID</h6>
              <p className="card-text small">Add official ID</p>
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => requestAttestation('government-id')}>
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3 mx-auto" style={{width: '48px', height: '48px', borderRadius: '50%', background: '#e6f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" className="bi bi-house" viewBox="0 0 16 16">
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                </svg>
              </div>
              <h6 className="card-title">Address Proof</h6>
              <p className="card-text small">Verify your location</p>
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => requestAttestation('proof-of-address')}>
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3 mx-auto" style={{width: '48px', height: '48px', borderRadius: '50%', background: '#e6f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" className="bi bi-person" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                </svg>
              </div>
              <h6 className="card-title">Biometric</h6>
              <p className="card-text small">Face verification</p>
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => requestAttestation('biometric')}>
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3 mx-auto" style={{width: '48px', height: '48px', borderRadius: '50%', background: '#e6f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" className="bi bi-phone" viewBox="0 0 16 16">
                  <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
                  <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                </svg>
              </div>
              <h6 className="card-title">Phone Number</h6>
              <p className="card-text small">Verify your number</p>
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => requestAttestation('phone-verification')}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="alert alert-primary d-flex">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-info-circle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
        </svg>
        <div>
          <h5 className="alert-heading">Almost There!</h5>
          <p className="mb-0">Add one more attestation to reach Identity Level 3 and unlock more financial services.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
