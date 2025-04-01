// ===============================================
// StellarID Mobile App (React Native)
// ===============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StellarIDApp from './components/StellarIDApp';
import StellarSdk from 'stellar-sdk';
import * as LocalAuthentication from 'expo-local-authentication';
import { Camera } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

// API endpoint configuration
const API_URL = 'http://localhost:3001';

// ===============================================
// Main App Component
// ===============================================

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userAccount, setUserAccount] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [identityLevel, setIdentityLevel] = useState(0);
  const [attestations, setAttestations] = useState([]);

  useEffect(() => {
    // Check if user has an existing account
    checkExistingAccount();
  }, []);

  const checkExistingAccount = async () => {
    try {
      const storedAccount = await AsyncStorage.getItem('userAccount');
      if (storedAccount) {
        const accountData = JSON.parse(storedAccount);
        setUserAccount(accountData);
        setCurrentScreen('dashboard');
        
        // Fetch user's identity level and attestations
        fetchUserIdentity(accountData.publicKey);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load account:', error);
      setIsLoading(false);
    }
  };

  const fetchUserIdentity = async (publicKey) => {
    try {
      const response = await axios.get(`${API_URL}/api/identity/verify/${publicKey}`);
      if (response.data.success) {
        setIdentityLevel(Math.floor(response.data.data.verificationScore / 20));
        setAttestations(response.data.data.attestations);
      }
    } catch (error) {
      console.error('Failed to fetch identity:', error);
      Alert.alert('Error', 'Failed to load identity information.');
    }
  };

  const createNewAccount = async () => {
    setIsLoading(true);
    try {
      // Generate a new Stellar keypair
      const keypair = StellarSdk.Keypair.random();
      
      // Fund the account using Friendbot (testnet only)
      await fetch(
        `https://friendbot.stellar.org?addr=${keypair.publicKey()}`
      );
      
      // Save the account information
      const accountData = {
        publicKey: keypair.publicKey(),
        secretSeed: keypair.secret()
      };
      
      await AsyncStorage.setItem('userAccount', JSON.stringify(accountData));
      setUserAccount(accountData);
      setCurrentScreen('createIdentity');
    } catch (error) {
      console.error('Failed to create account:', error);
      Alert.alert('Error', 'Failed to create new account.');
    } finally {
      setIsLoading(false);
    }
  };

  const createIdentity = async (identityData) => {
    setIsLoading(true);
    try {
      // Send identity data to API
      const response = await axios.post(`${API_URL}/api/identity/create`, {
        seed: userAccount.secretSeed,
        identityData
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'Your identity has been created!');
        setCurrentScreen('dashboard');
        fetchUserIdentity(userAccount.publicKey);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to create identity:', error);
      Alert.alert('Error', 'Failed to create identity.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestAttestation = async (attestationType) => {
    // Show a form to collect required data for the attestation type
    // This would be implemented as a modal or new screen
    setCurrentScreen(`attestation-${attestationType}`);
  };

  const submitAttestationRequest = async (attestationType, attestationData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/attestation/request`, {
        userPublicKey: userAccount.publicKey,
        attestationType,
        attestationData
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'Attestation request submitted successfully!');
        setCurrentScreen('dashboard');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Failed to request attestation:', error);
      Alert.alert('Error', 'Failed to submit attestation request.');
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================================
  // Screen Rendering Functions
  // ===============================================

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to StellarID</Text>
      <Text style={styles.subtitle}>Your decentralized identity on the Stellar blockchain</Text>
      
      <TouchableOpacity style={styles.button} onPress={createNewAccount}>
        <Text style={styles.buttonText}>Create New Account</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setCurrentScreen('importAccount')}
      >
        <Text style={styles.secondaryButtonText}>Import Existing Account</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateIdentityScreen = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Identity</Text>
      <Text style={styles.description}>
        Let's start building your digital identity. We'll begin with some basic information.
      </Text>
      
      {/* In a real app, this would be a form with input fields */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          // Sample identity data - in a real app, this would come from form inputs
          createIdentity({
            name: 'Sample User',
            birthYear: 1990,
            country: 'United States',
            type: 'basic-info'
          });
        }}
      >
        <Text style={styles.buttonText}>Create Basic Identity</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDashboardScreen = () => (
    <ScrollView contentContainerStyle={styles.containerLeft}>
      <Text style={styles.title}>Your Identity Dashboard</Text>
      
      <View style={styles.identityCard}>
        <View style={styles.identityHeader}>
          <Text style={styles.identityTitle}>Identity Level {identityLevel}</Text>
          <View style={styles.levelIndicator}>
            {[1, 2, 3, 4, 5].map(level => (
              <View 
                key={level}
                style={[
                  styles.levelDot,
                  level <= identityLevel ? styles.activeLevelDot : {}
                ]}
              />
            ))}
          </View>
        </View>
        
        <Text style={styles.publicKey}>
          {userAccount?.publicKey.substring(0, 10)}...
          {userAccount?.publicKey.substring(userAccount.publicKey.length - 10)}
        </Text>
        
        <View style={styles.attestationsContainer}>
          <Text style={styles.attestationsTitle}>Attestations</Text>
          {attestations.length === 0 ? (
            <Text style={styles.noAttestations}>
              You don't have any attestations yet. Request your first attestation to build your identity.
            </Text>
          ) : (
            attestations.map((attestation, index) => (
              <View key={index} style={styles.attestationItem}>
                <Text style={styles.attestationType}>
                  {attestation.attestationData.type}
                </Text>
                <Text style={styles.attestationDate}>
                  {new Date(attestation.attestedAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Request Attestations</Text>
      <View style={styles.attestationButtons}>
        <TouchableOpacity 
          style={styles.attestationButton}
          onPress={() => requestAttestation('government-id')}
        >
          <Text style={styles.attestationButtonText}>Government ID</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.attestationButton}
          onPress={() => requestAttestation('proof-of-address')}
        >
          <Text style={styles.attestationButtonText}>Proof of Address</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.attestationButton}
          onPress={() => requestAttestation('biometric')}
        >
          <Text style={styles.attestationButtonText}>Biometric</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.attestationButton}
          onPress={() => requestAttestation('social-verification')}
        >
          <Text style={styles.attestationButtonText}>Social Verification</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ===============================================
  // Main Render Logic
  // ===============================================

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0080FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Render the appropriate screen based on the current state
  switch (currentScreen) {
    case 'welcome':
      return renderWelcomeScreen();
    case 'createIdentity':
      return renderCreateIdentityScreen();
    case 'dashboard':
      return renderDashboardScreen();
    // Additional screens would be implemented here
    default:
      return renderWelcomeScreen();
  }
  return <StellarIDApp />;
}

// ===============================================
// Styles
// ===============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  containerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666'
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22
  },
  button: {
    backgroundColor: '#0080FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0080FF'
  },
  secondaryButtonText: {
    color: '#0080FF',
    fontSize: 16,
    fontWeight: '600'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  identityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
    width: '100%'
  },
  identityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  identityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  levelIndicator: {
    flexDirection: 'row'
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD',
    marginLeft: 4
  },
  activeLevelDot: {
    backgroundColor: '#0080FF'
  },
  publicKey: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15
  },
  attestationsContainer: {
    marginTop: 10
  },
  attestationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333'
  },
  noAttestations: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic'
  },
  attestationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  attestationType: {
    fontSize: 14,
    color: '#333'
  },
  attestationDate: {
    fontSize: 14,
    color: '#888'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
    color: '#333'
  },
  attestationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  attestationButton: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D0E3FF'
  },
  attestationButtonText: {
    color: '#0080FF',
    fontSize: 14
  }
});