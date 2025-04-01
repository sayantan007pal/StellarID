import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function CreateIdentity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    country: '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, use the sample user seed
      // In a real app, this would create a new keypair
      const seed = 'SCDJF3DQC7TZHKYISOA7E6TXYD7EXT3QVQNL3DWOSIBWRBWYDBIYV3E2';
      
      const identityData = {
        ...formData,
        birthYear: parseInt(formData.birthYear, 10),
        type: 'basic-info'
      };
      
      const response = await api.createIdentity(seed, identityData);
      
      if (response.success) {
        // Store the account info
        const accountData = {
          publicKey: 'GBZXGFRCTV4QAE6LOSXAEY6U2EN4FUQA4GHBC255QB24BUTD46SRA3AK',
          secretSeed: seed
        };
        
        localStorage.setItem('stellarId_auth', JSON.stringify(accountData));
        navigate('/dashboard');
      } else {
        throw new Error(response.error || 'Failed to create identity');
      }
    } catch (error) {
      console.error('Error creating identity:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <h2 className="mb-4">Create Your Identity</h2>
        
        <p className="text-muted mb-4">
          Let's start building your digital identity. We'll begin with some basic information.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="birthYear" className="form-label">Birth Year</label>
            <input
              type="number"
              className="form-control"
              id="birthYear"
              name="birthYear"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.birthYear}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="country" className="form-label">Country</label>
            <input
              type="text"
              className="form-control"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}
          
          <div className="d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : "Create Identity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateIdentity;
