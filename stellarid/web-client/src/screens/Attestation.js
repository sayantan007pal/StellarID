import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Attestation() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getTypeLabel = () => {
    switch(type) {
      case 'government-id': return 'Government ID';
      case 'proof-of-address': return 'Proof of Address';
      case 'biometric': return 'Biometric Verification';
      case 'phone-verification': return 'Phone Number Verification';
      default: return 'Verification';
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const auth = JSON.parse(localStorage.getItem('stellarId_auth'));
      if (!auth || !auth.publicKey) {
        throw new Error('Authentication data not found');
      }
      
      // Simulated attestation data
      const attestationData = {
        type: type,
        submitted: new Date().toISOString()
      };
      
      const response = await api.requestAttestation(
        auth.publicKey,
        type,
        attestationData
      );
      
      if (response.success) {
        alert('Attestation request submitted successfully!');
        navigate('/dashboard');
      } else {
        throw new Error(response.error || 'Failed to submit attestation request');
      }
    } catch (error) {
      console.error('Error submitting attestation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2 className="mb-4">{getTypeLabel()} Verification</h2>
      
      <div className="alert alert-warning mb-4">
        <div className="d-flex">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <div>
            Your document will be securely encrypted and only viewed by verified attesters.
          </div>
        </div>
      </div>
      
      <h5 className="mb-3">Upload Your Document</h5>
      
      <p className="text-muted mb-4">
        {type === 'government-id' && 'We accept passport, national ID card, or driver\'s license.'}
        {type === 'proof-of-address' && 'We accept utility bills, bank statements, or official government correspondence.'}
        {type === 'biometric' && 'We need a clear photo of your face for biometric verification.'}
        {type === 'phone-verification' && 'We will send a verification code to your phone number.'}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card p-3 text-center">
              <div className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#adb5bd" className="bi bi-camera" viewBox="0 0 16 16">
                  <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                  <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                </svg>
              </div>
              <h6>Take Photo</h6>
              <p className="text-muted small">Use camera to capture your document</p>
            </div>
          </div>
          
          <div className="col-md-6 mb-3">
            <div className="card p-3 text-center">
              <div className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#adb5bd" className="bi bi-upload" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                </svg>
              </div>
              <h6>Upload File</h6>
              <p className="text-muted small">Select file from your device</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h5 className="mb-3">Verification Process</h5>
          
          <div className="d-flex mb-3">
            <div className="badge bg-primary rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1</div>
            <div className="ms-3">
              <h6 className="mb-0">Upload Document</h6>
              <p className="text-muted small">Add your document</p>
            </div>
          </div>
          
          <div className="d-flex mb-3">
            <div className="badge bg-light text-dark rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2</div>
            <div className="ms-3">
              <h6 className="mb-0 text-muted">Verification</h6>
              <p className="text-muted small">Document checked by attester</p>
            </div>
          </div>
          
          <div className="d-flex">
            <div className="badge bg-light text-dark rounded-circle" style={{width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>3</div>
            <div className="ms-3">
              <h6 className="mb-0 text-muted">Attestation</h6>
              <p className="text-muted small">Credential added to your identity</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : "Submit Document"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Attestation;
