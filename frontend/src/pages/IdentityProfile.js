// frontend/src/pages/IdentityProfile.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Box,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Snackbar
} from '@material-ui/core';
import { 
  Person as PersonIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  ContactMail as ContactMailIcon,
  Lock as LockIcon
} from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  tierCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
  },
  activeTier: {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.paper,
  },
  tierHeader: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  tierContent: {
    flexGrow: 1,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  verifiedChip: {
    backgroundColor: theme.palette.success.light,
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

const IdentityProfile = () => {
  const classes = useStyles();
  const { currentUser } = useContext(AuthContext);
  
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
  });
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    alternativeContact: '',
  });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Define identity tiers
  const tiers = [
    {
      level: 0,
      name: 'Basic',
      description: 'Initial identity with minimal verification',
      requiredFields: ['stellarAddress'],
      minimumAttestations: 0,
    },
    {
      level: 1,
      name: 'Standard',
      description: 'Identity with basic personal information verified',
      requiredFields: ['firstName', 'lastName', 'email', 'phone'],
      minimumAttestations: 2,
    },
    {
      level: 2,
      name: 'Enhanced',
      description: 'Identity with full profile and multiple attestations',
      requiredFields: ['firstName', 'lastName', 'dateOfBirth', 'address', 'nationality'],
      minimumAttestations: 5,
    },
    {
      level: 3,
      name: 'Premium',
      description: 'Fully verified identity with official document verification',
      requiredFields: ['firstName', 'lastName', 'dateOfBirth', 'address', 'nationality', 'documents'],
      minimumAttestations: 8,
    },
  ];

  // Fetch identity data
  useEffect(() => {
    const fetchIdentity = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/identities`);
        
        if (response.data.success) {
          const identityData = response.data.data;
          setIdentity(identityData);
          
          // Populate form fields if identity exists
          if (identityData.personalInfo) {
            setPersonalInfo(identityData.personalInfo);
          }
          
          if (identityData.contactInfo) {
            setContactInfo(identityData.contactInfo);
          }
          
          if (identityData.personalInfo?.address) {
            setAddress(identityData.personalInfo.address);
          }
        }
      } catch (err) {
        // If 404, the user doesn't have an identity yet
        if (err.response && err.response.status === 404) {
          setIdentity(null);
        } else {
          console.error('Fetch identity error:', err);
          setError('Failed to load identity information');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchIdentity();
    }
  }, [currentUser]);

  // Handle creating new identity
  const handleCreateIdentity = async () => {
    setSaving(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/identities`, {
        personalInfo,
        contactInfo: {
          ...contactInfo,
          email: contactInfo.email || currentUser.email,
          phone: contactInfo.phone || currentUser.phoneNumber,
        },
      });
      
      if (response.data.success) {
        setIdentity(response.data.data);
        setSuccessMessage('Identity created successfully!');
      }
    } catch (err) {
      console.error('Create identity error:', err);
      setError(err.response?.data?.message || 'Failed to create identity');
    } finally {
      setSaving(false);
    }
  };

  // Handle updating identity
  const handleUpdateIdentity = async () => {
    setSaving(true);
    try {
      // Prepare address if any field is filled
      const hasAddressData = Object.values(address).some(value => !!value);
      const updatedPersonalInfo = {
        ...personalInfo,
        ...(hasAddressData ? { address } : {}),
      };
      
      const response = await axios.put(`${BASE_URL}/api/identities`, {
        personalInfo: updatedPersonalInfo,
        contactInfo,
      });
      
      if (response.data.success) {
        setIdentity(prevIdentity => ({
          ...prevIdentity,
          personalInfo: updatedPersonalInfo,
          contactInfo,
        }));
        setSuccessMessage('Identity updated successfully!');
      }
    } catch (err) {
      console.error('Update identity error:', err);
      setError(err.response?.data?.message || 'Failed to update identity');
    } finally {
      setSaving(false);
    }
  };

  // Handle personal info changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle contact info changes
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle address changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear any error or success message
  const handleCloseAlert = () => {
    setError(null);
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress />
      </div>
    );
  }

  const currentTier = identity ? tiers.find(tier => tier.level === identity.currentTier) : tiers[0];
  const nextTier = identity ? tiers.find(tier => tier.level === identity.currentTier + 1) : null;

  return (
    <Container className={classes.container}>
      <Typography variant="h4" component="h1" className={classes.title}>
        Identity Profile
      </Typography>
      
      {/* Identity Status */}
      <Paper className={classes.paper}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon fontSize="small" /> Identity Status
            </Typography>
            {identity ? (
              <>
                <Typography variant="body1">
                  Stellar Address: <strong>{identity.stellarAddress}</strong>
                </Typography>
                <Typography variant="body1">
                  Current Tier: <Chip 
                    label={currentTier.name} 
                    color="primary" 
                    size="small" 
                    className={classes.chip} 
                  />
                </Typography>
                <Typography variant="body1">
                  Verified Fields: {identity.verifiedFields ? 
                    Object.keys(identity.verifiedFields).map(field => (
                      <Chip 
                        key={field}
                        label={field} 
                        size="small" 
                        className={`${classes.chip} ${classes.verifiedChip}`}
                        icon={<CheckCircleIcon />} 
                      />
                    )) : 'None yet'}
                </Typography>
              </>
            ) : (
              <Typography variant="body1">
                You haven't created your identity yet. Complete the profile information below to create it.
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              <LockIcon fontSize="small" /> Verification Progress
            </Typography>
            <Stepper activeStep={identity ? identity.currentTier : -1} alternativeLabel>
              {tiers.map((tier) => (
                <Step key={tier.level}>
                  <StepLabel>{tier.name}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {nextTier && (
              <Typography variant="body2" align="center" color="textSecondary">
                Next level: {nextTier.name} - {nextTier.description}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Personal Information */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          <PersonIcon fontSize="small" /> Personal Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={personalInfo.firstName || ''}
              onChange={handlePersonalInfoChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={personalInfo.lastName || ''}
              onChange={handlePersonalInfoChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={personalInfo.dateOfBirth || ''}
              onChange={handlePersonalInfoChange}
              variant="outlined"
              className={classes.formControl}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Gender"
              name="gender"
              value={personalInfo.gender || ''}
              onChange={handlePersonalInfoChange}
              variant="outlined"
              className={classes.formControl}
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value=""></option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nationality"
              name="nationality"
              value={personalInfo.nationality || ''}
              onChange={handlePersonalInfoChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Contact Information */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          <ContactMailIcon fontSize="small" /> Contact Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={contactInfo.email || currentUser?.email || ''}
              onChange={handleContactInfoChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={contactInfo.phone || currentUser?.phoneNumber || ''}
              onChange={handleContactInfoChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Alternative Contact Method"
              name="alternativeContact"
              value={contactInfo.alternativeContact || ''}
              onChange={handleContactInfoChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Address Information */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          <ContactMailIcon fontSize="small" /> Address Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street"
              value={address.street || ''}
              onChange={handleAddressChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={address.city || ''}
              onChange={handleAddressChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State/Province"
              name="state"
              value={address.state || ''}
              onChange={handleAddressChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postalCode"
              value={address.postalCode || ''}
              onChange={handleAddressChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={address.country || ''}
              onChange={handleAddressChange}
              variant="outlined"
              className={classes.formControl}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Submit Button */}
      <Box position="relative" display="flex" justifyContent="center" mt={3}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={identity ? handleUpdateIdentity : handleCreateIdentity}
          disabled={saving}
        >
          {identity ? 'Update Identity Profile' : 'Create Identity Profile'}
        </Button>
        {saving && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
      </Box>
      
      {/* Error/Success Messages */}
      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={error ? 'error' : 'success'}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IdentityProfile;