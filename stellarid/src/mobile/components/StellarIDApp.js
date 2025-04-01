import React, { useState } from 'react';
import { Camera, ArrowRight, Check, Shield, AlertCircle, Upload, User, Key, Smartphone, ChevronRight, Home, CreditCard, File, AlertTriangle } from 'lucide-react';

const StellarIDApp = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [identityLevel, setIdentityLevel] = useState(2);
  
  // Mock data for the app
  const attestations = [
    { type: 'basic-info', date: '2025-01-15', status: 'verified' },
    { type: 'proof-of-address', date: '2025-02-03', status: 'verified' },
    { type: 'government-id', date: '2025-02-20', status: 'pending' },
  ];
  
  const publicKey = 'GDZKIZ3UPUSNRGVBWZISL4DESFOUJY2DEMIGF7WVRYMHJ3QRHLIGJZB4';
  
  // Render different screens based on the current state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onContinue={() => setCurrentScreen('dashboard')} />;
      case 'dashboard':
        return (
          <DashboardScreen 
            identityLevel={identityLevel} 
            attestations={attestations}
            publicKey={publicKey}
            onRequestAttestation={() => setCurrentScreen('attestation')}
            onViewDetails={() => {}}
          />
        );
      case 'attestation':
        return <AttestationScreen onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return <WelcomeScreen onContinue={() => setCurrentScreen('dashboard')} />;
    }
  };
  
  return (
    <div className="w-full h-full flex justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white h-full shadow-lg flex flex-col">
        {currentScreen !== 'welcome' && (
          <Header 
            currentScreen={currentScreen} 
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}
        <div className="flex-1 overflow-auto">
          {renderScreen()}
        </div>
        {currentScreen !== 'welcome' && (
          <Footer 
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
          />
        )}
      </div>
    </div>
  );
};

// Welcome Screen Component
const WelcomeScreen = ({ onContinue }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full text-center">
      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-8">
        <Shield className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Welcome to StellarID</h1>
      <p className="text-gray-600 mb-8">
        Your decentralized identity on the Stellar blockchain
      </p>
      
      <div className="space-y-6 w-full mb-12">
        <div className="flex items-center text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">Privacy Focused</h3>
            <p className="text-sm text-gray-500">You control what you share</p>
          </div>
        </div>
        
        <div className="flex items-center text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">Secure by Design</h3>
            <p className="text-sm text-gray-500">Built on Stellar blockchain</p>
          </div>
        </div>
        
        <div className="flex items-center text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">Financial Access</h3>
            <p className="text-sm text-gray-500">Open doors to services</p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onContinue}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
      >
        Get Started
      </button>
      
      <p className="mt-4 text-sm text-gray-500">
        Already have an account? <a href="#" className="text-blue-600">Sign in</a>
      </p>
    </div>
  );
};

// Dashboard Screen Component
const DashboardScreen = ({ identityLevel, attestations, publicKey, onRequestAttestation, onViewDetails }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Identity Dashboard</h2>
      
      {/* Identity Card */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-medium">Identity Level {identityLevel}</h3>
            <p className="text-xs text-gray-500">Partially Verified</p>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= identityLevel ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs font-mono text-gray-600 break-all">
            {publicKey.substring(0, 10)}...{publicKey.substring(publicKey.length - 4)}
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between mb-2">
            <h4 className="text-sm font-medium">Attestations</h4>
            <button onClick={onViewDetails} className="text-xs text-blue-600">
              View All
            </button>
          </div>
          
          {attestations.map((attestation, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium capitalize">
                  {attestation.type.replace(/-/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">{attestation.date}</p>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                attestation.status === 'verified' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {attestation.status}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Cards */}
      <h3 className="text-lg font-medium mb-3">Build Your Identity</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={onRequestAttestation}
          className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <File className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-medium text-sm mb-1">Government ID</h4>
          <p className="text-xs text-gray-500">Add official ID</p>
        </button>
        
        <button 
          onClick={onRequestAttestation}
          className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-medium text-sm mb-1">Address Proof</h4>
          <p className="text-xs text-gray-500">Verify your location</p>
        </button>
        
        <button 
          onClick={onRequestAttestation}
          className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-medium text-sm mb-1">Biometric</h4>
          <p className="text-xs text-gray-500">Face verification</p>
        </button>
        
        <button 
          onClick={onRequestAttestation}
          className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-medium text-sm mb-1">Phone Number</h4>
          <p className="text-xs text-gray-500">Verify your number</p>
        </button>
      </div>
      
      {/* Ready for Financial Services */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">Almost There!</h4>
            <p className="text-xs text-gray-600 mb-3">
              Add one more attestation to reach Identity Level 3 and unlock more financial services.
            </p>
            <button className="text-xs text-blue-600 font-medium">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attestation Screen Component
const AttestationScreen = ({ onBack }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Government ID Verification</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700">
              Your ID document will be securely encrypted and only viewed by verified attesters.
            </p>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-3">Upload Your Document</h3>
      <p className="text-sm text-gray-600 mb-4">
        We accept passport, national ID card, or driver's license.
      </p>
      
      <div className="space-y-4 mb-6">
        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
          <Camera className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">Take Photo</p>
          <p className="text-xs text-gray-500">Use camera to capture your ID</p>
        </button>
        
        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">Upload File</p>
          <p className="text-xs text-gray-500">Select image from your device</p>
        </button>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <h4 className="text-sm font-medium mb-3">Verification Process</h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
              1
            </div>
            <div className="h-12 w-0.5 bg-gray-200 mx-3"></div>
            <div>
              <p className="text-sm font-medium">Upload Document</p>
              <p className="text-xs text-gray-500">Add your ID document</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">
              2
            </div>
            <div className="h-12 w-0.5 bg-gray-200 mx-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-400">Verification</p>
              <p className="text-xs text-gray-500">Document checked by attester</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Attestation</p>
              <p className="text-xs text-gray-500">Credential added to your identity</p>
            </div>
          </div>
        </div>
      </div>
      
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
        Continue
      </button>
    </div>
  );
};

// Header Component
const Header = ({ currentScreen, onBack }) => {
  const titles = {
    dashboard: 'StellarID',
    attestation: 'Add Attestation',
    settings: 'Settings'
  };
  
  return (
    <div className="px-4 py-3 border-b border-gray-200 flex items-center">
      {currentScreen !== 'dashboard' && (
        <button onClick={onBack} className="mr-2">
          <ArrowRight className="w-5 h-5 transform rotate-180" />
        </button>
      )}
      <h1 className="text-lg font-bold">{titles[currentScreen]}</h1>
    </div>
  );
};

// Footer Component
const Footer = ({ currentScreen, onNavigate }) => {
  return (
    <div className="px-4 py-3 border-t border-gray-200 flex justify-around">
      <button 
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center ${
          currentScreen === 'dashboard' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button 
        onClick={() => onNavigate('financial')}
        className={`flex flex-col items-center ${
          currentScreen === 'financial' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <CreditCard className="w-6 h-6" />
        <span className="text-xs mt-1">Services</span>
      </button>
      
      <button 
        onClick={() => onNavigate('settings')}
        className={`flex flex-col items-center ${
          currentScreen === 'settings' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <User className="w-6 h-6" />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
};

export default StellarIDApp;