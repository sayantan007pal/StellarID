// frontend/src/pages/Attestations.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Box,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@material-ui/core';
import {
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
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
  title: {
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  chipSuccess: {
    backgroundColor: theme.palette.success.light,
  },
  chipWarning: {
    backgroundColor: theme.palette.warning.light,
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  tabContent: {
    marginTop: theme.spacing(2),
  },
  cardRoot: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
  fieldsList: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
  },
  keyDisplay: {
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.875rem',
  },
  noData: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  attesterInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  attesterIcon: {
    marginRight: theme.spacing(1),
  },
}));

const attestationTypes = [
  { value: 'personal', label: 'Personal Information' },
  { value: 'address', label: 'Address Verification' },
  { value: 'financial', label: 'Financial History' },
  { value: 'employment', label: 'Employment Record' },
  { value: 'education', label: 'Educational Background' },
  { value: 'social', label: 'Social Verification' },
  { value: 'other', label: 'Other' }
];

const Attestations = () => {
  const classes = useStyles();
  const { currentUser } = useContext(AuthContext);
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [attestations, setAttestations] = useState({
    received: [],
    issued: []
  });
  const [identities, setIdentities] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Create attestation dialog
  const [createDialog, setCreateDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedAttestation, setSelectedAttestation] = useState(null);
  
  // Create attestation form
  const [attestationForm, setAttestationForm] = useState({
    identityId: '',
    type: 'personal',
    fields: {},
    confidence: 80,
    metadata: {}
  });
  
  // Field form
  const [fieldKey, setFieldKey] = useState('');
  const [fieldValue, setFieldValue] = useState('');

  // Fetch attestations
  const fetchAttestations = async () => {
    setLoading(true);
    
    try {
      // Fetch received attestations (as identity owner)
      const receivedResponse = await axios.get(`${BASE_URL}/api/attestations/received`);
      
      // Fetch issued attestations (as attester)
      const issuedResponse = await axios.get(`${BASE_URL}/api/attestations/issued`);
      
      // Fetch available identities for attestation (for attesters)
      let identitiesData = [];
      if (currentUser.role === 'attester' || currentUser.role === 'admin') {
        try {
          const identitiesResponse = await axios.get(`${BASE_URL}/api/identities/all`);
          if (identitiesResponse.data.success) {
            identitiesData = identitiesResponse.data.data;
          }
        } catch (err) {
          console.error('Fetch identities error:', err);
        }
      }
      
      setAttestations({
        received: receivedResponse.data.success ? receivedResponse.data.data.attestations : [],
        issued: issuedResponse.data.success ? issuedResponse.data.data.attestations : []
      });
      
      setIdentities(identitiesData);
      setSuccessMessage('Attestations loaded successfully');
    } catch (err) {
      console.error('Fetch attestations error:', err);
      setError('Failed to load attestations');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchAttestations();
  };

  useEffect(() => {
    if (currentUser) {
      fetchAttestations();
    }
  }, [currentUser]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open the create attestation dialog
  const handleOpenCreateDialog = () => {
    // Reset form data
    setAttestationForm({
      identityId: identities.length > 0 ? identities[0]._id : '',
      type: 'personal',
      fields: {},
      confidence: 80,
      metadata: {}
    });
    setFieldKey('');
    setFieldValue('');
    setCreateDialog(true);
  };

  // Open details dialog
  const handleOpenDetailsDialog = (attestation) => {
    setSelectedAttestation(attestation);
    setDetailsDialog(true);
  };

  // Handle form changes
  const handleAttestationFormChange = (e) => {
    const { name, value } = e.target;
    setAttestationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a field to the attestation
  const handleAddField = () => {
    if (!fieldKey.trim()) return;
    
    setAttestationForm(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: fieldValue
      }
    }));
    
    // Reset field inputs
    setFieldKey('');
    setFieldValue('');
  };

  // Remove a field from the attestation
  const handleRemoveField = (key) => {
    const updatedFields = { ...attestationForm.fields };
    delete updatedFields[key];
    
    setAttestationForm(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  // Create an attestation
  const handleCreateAttestation = async () => {
    if (!attestationForm.identityId || !attestationForm.type || Object.keys(attestationForm.fields).length === 0) {
      setError('Please fill in all required fields and add at least one attestation field');
      return;
    }
    
    setActionLoading(true);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/attestations`, attestationForm);
      
      if (response.data.success) {
        setSuccessMessage('Attestation created successfully!');
        setCreateDialog(false);
        
        // Refresh issued attestations
        const issuedResponse = await axios.get(`${BASE_URL}/api/attestations/issued`);
        if (issuedResponse.data.success) {
          setAttestations(prev => ({
            ...prev,
            issued: issuedResponse.data.data.attestations
          }));
        }
      }
    } catch (err) {
      console.error('Create attestation error:', err);
      setError(err.response?.data?.message || 'Failed to create attestation');
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke an attestation
  const handleRevokeAttestation = async (attestation) => {
    setActionLoading(true);
    
    try {
      const response = await axios.put(`${BASE_URL}/api/attestations/${attestation._id}/revoke`);
      
      if (response.data.success) {
        setSuccessMessage('Attestation revoked successfully');
        
        // Update attestations list
        const updatedAttestations = attestations.issued.map(a => 
          a._id === attestation._id 
            ? { ...a, isRevoked: true, revokedAt: new Date() }
            : a
        );
        
        setAttestations(prev => ({
          ...prev,
          issued: updatedAttestations
        }));
      }
    } catch (err) {
      console.error('Revoke attestation error:', err);
      setError(err.response?.data?.message || 'Failed to revoke attestation');
    } finally {
      setActionLoading(false);
    }
  };

  // Clear any error or success message
  const handleCloseAlert = () => {
    setError(null);
    setSuccessMessage('');
  };

  // Get the label for attestation type
  const getAttestationTypeLabel = (type) => {
    const attestationType = attestationTypes.find(t => t.value === type);
    return attestationType ? attestationType.label : type;
  };

  // Check if the user is an attester
  const isAttester = currentUser && (currentUser.role === 'attester' || currentUser.role === 'admin');

  if (loading) {
    return (
      <Container className={classes.container}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" className={classes.title}>
          Identity Attestations
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={actionLoading}
            style={{ marginRight: 8 }}
          >
            Refresh
          </Button>
          
          {isAttester && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<VerifiedUserIcon />}
              onClick={handleOpenCreateDialog}
              disabled={actionLoading || identities.length === 0}
            >
              Create Attestation
            </Button>
          )}
        </Box>
      </Box>
      
      <Paper className={classes.paper}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Your Attestations" />
          {isAttester && <Tab label="Attestations You've Issued" />}
        </Tabs>
        
        <Box className={classes.tabContent}>
          {/* Tab 1: Received Attestations (as identity owner) */}
          {tabValue === 0 && (
            <>
              {attestations.received.length > 0 ? (
                <Grid container spacing={3}>
                  {attestations.received.map((attestation) => (
                    <Grid item xs={12} sm={6} md={4} key={attestation._id}>
                      <Card className={classes.cardRoot} 
                        variant="outlined"
                        style={{ 
                          borderColor: attestation.isRevoked ? '#f44336' : '#e0e0e0' 
                        }}
                      >
                        <CardContent className={classes.cardContent}>
                          <Box className={classes.attesterInfo}>
                            <VerifiedUserIcon className={classes.attesterIcon} color="primary" />
                            <Typography variant="subtitle1">
                              {getAttestationTypeLabel(attestation.type)}
                            </Typography>
                            
                            {attestation.isRevoked ? (
                              <Chip 
                                size="small" 
                                icon={<WarningIcon />} 
                                label="Revoked" 
                                className={`${classes.chip} ${classes.chipWarning}`}
                                style={{ marginLeft: 'auto' }}
                              />
                            ) : (
                              <Chip 
                                size="small" 
                                icon={<CheckIcon />} 
                                label={`${attestation.confidence}% Confidence`} 
                                className={`${classes.chip} ${classes.chipSuccess}`}
                                style={{ marginLeft: 'auto' }}
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Attested by: {attestation.attester.username}
                          </Typography>
                          
                          <Divider className={classes.divider} />
                          
                          <Typography variant="body2" gutterBottom>
                            Verified Fields:
                          </Typography>
                          <Box className={classes.fieldsList}>
                            {Object.keys(attestation.fields).slice(0, 3).map((key) => (
                              <Chip
                                key={key}
                                label={key}
                                size="small"
                                className={classes.chip}
                                icon={<CheckIcon fontSize="small" />}
                              />
                            ))}
                            {Object.keys(attestation.fields).length > 3 && (
                              <Chip
                                label={`+${Object.keys(attestation.fields).length - 3} more`}
                                size="small"
                                className={classes.chip}
                              />
                            )}
                          </Box>
                          
                          {attestation.transaction && attestation.transaction.assetCode && (
                            <Box mt={1}>
                              <Typography variant="body2" gutterBottom>
                                Asset Token: {attestation.transaction.assetCode}
                              </Typography>
                            </Box>
                          )}
                          
                          {attestation.expiresAt && (
                            <Typography variant="body2" color="textSecondary">
                              Expires: {new Date(attestation.expiresAt).toLocaleDateString()}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDetailsDialog(attestation)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box className={classes.noData}>
                  <VerifiedUserIcon className={classes.emptyIcon} />
                  <Typography variant="h6" gutterBottom>
                    No attestations yet
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    You haven't received any attestations for your identity yet.
                  </Typography>
                </Box>
              )}
            </>
          )}
          
          {/* Tab 2: Issued Attestations (as attester) */}
          {tabValue === 1 && isAttester && (
            <>
              {attestations.issued.length > 0 ? (
                <Grid container spacing={3}>
                  {attestations.issued.map((attestation) => (
                    <Grid item xs={12} sm={6} md={4} key={attestation._id}>
                      <Card className={classes.cardRoot} 
                        variant="outlined"
                        style={{ 
                          borderColor: attestation.isRevoked ? '#f44336' : '#e0e0e0' 
                        }}
                      >
                        <CardContent className={classes.cardContent}>
                          <Box className={classes.attesterInfo}>
                            <SecurityIcon className={classes.attesterIcon} color="primary" />
                            <Typography variant="subtitle1">
                              {getAttestationTypeLabel(attestation.type)}
                            </Typography>
                            
                            {attestation.isRevoked ? (
                              <Chip 
                                size="small" 
                                icon={<WarningIcon />} 
                                label="Revoked" 
                                className={`${classes.chip} ${classes.chipWarning}`}
                                style={{ marginLeft: 'auto' }}
                              />
                            ) : (
                              <Chip 
                                size="small" 
                                icon={<CheckIcon />} 
                                label={`${attestation.confidence}% Confidence`} 
                                className={`${classes.chip} ${classes.chipSuccess}`}
                                style={{ marginLeft: 'auto' }}
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Identity ID: {attestation.identity._id ? 
                              `${attestation.identity._id.substring(0, 8)}...` : 
                              attestation.identity.substring(0, 8) + '...'}
                          </Typography>
                          
                          <Divider className={classes.divider} />
                          
                          <Typography variant="body2" gutterBottom>
                            Attested Fields:
                          </Typography>
                          <Box className={classes.fieldsList}>
                            {Object.keys(attestation.fields).slice(0, 3).map((key) => (
                              <Chip
                                key={key}
                                label={key}
                                size="small"
                                className={classes.chip}
                                icon={<CheckIcon fontSize="small" />}
                              />
                            ))}
                            {Object.keys(attestation.fields).length > 3 && (
                              <Chip
                                label={`+${Object.keys(attestation.fields).length - 3} more`}
                                size="small"
                                className={classes.chip}
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Created: {new Date(attestation.createdAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDetailsDialog(attestation)}
                          >
                            View Details
                          </Button>
                          
                          {!attestation.isRevoked && (
                            <Button 
                              size="small" 
                              color="secondary"
                              onClick={() => handleRevokeAttestation(attestation)}
                              disabled={actionLoading}
                            >
                              Revoke
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box className={classes.noData}>
                  <SecurityIcon className={classes.emptyIcon} />
                  <Typography variant="h6" gutterBottom>
                    No issued attestations
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    You haven't issued any attestations yet.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
      
      {/* Create Attestation Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Attestation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create an attestation to verify specific aspects of a user's identity.
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="identity-select-label">Select Identity</InputLabel>
                <Select
                  labelId="identity-select-label"
                  id="identityId"
                  name="identityId"
                  value={attestationForm.identityId}
                  onChange={handleAttestationFormChange}
                  label="Select Identity"
                  required
                >
                  {identities.map(identity => (
                    <MenuItem key={identity._id} value={identity._id}>
                      {identity.personalInfo?.firstName ? 
                        `${identity.personalInfo.firstName} ${identity.personalInfo.lastName || ''}` : 
                        `ID: ${identity.stellarAddress.substring(0, 8)}...`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="type-select-label">Attestation Type</InputLabel>
                <Select
                  labelId="type-select-label"
                  id="type"
                  name="type"
                  value={attestationForm.type}
                  onChange={handleAttestationFormChange}
                  label="Attestation Type"
                  required
                >
                  {attestationTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confidence Level (%)"
                name="confidence"
                type="number"
                value={attestationForm.confidence}
                onChange={handleAttestationFormChange}
                variant="outlined"
                inputProps={{ min: 1, max: 100 }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle1" gutterBottom style={{ marginTop: 16 }}>
                Attestation Fields
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Field Name"
                value={fieldKey}
                onChange={(e) => setFieldKey(e.target.value)}
                variant="outlined"
                placeholder="e.g. firstName, address, phoneVerified"
              />
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Field Value"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                variant="outlined"
                placeholder="e.g. true, verified, etc."
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleAddField}
                disabled={!fieldKey.trim()}
                style={{ height: '100%' }}
              >
                Add Field
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              {Object.keys(attestationForm.fields).length > 0 ? (
                <List dense className={classes.fieldsList}>
                  {Object.entries(attestationForm.fields).map(([key, value]) => (
                    <ListItem key={key}>
                      <ListItemIcon>
                        <LockIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={key}
                        secondary={value}
                      />
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => handleRemoveField(key)}
                      >
                        Remove
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                  No fields added yet. Add at least one field to create an attestation.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)} color="default" disabled={actionLoading}>
            Cancel
          </Button>
          <Box position="relative">
            <Button 
              onClick={handleCreateAttestation} 
              color="primary" 
              disabled={
                actionLoading || 
                !attestationForm.identityId || 
                !attestationForm.type || 
                Object.keys(attestationForm.fields).length === 0
              }
            >
              Create Attestation
            </Button>
            {actionLoading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </Box>
        </DialogActions>
      </Dialog>
      
      {/* Attestation Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md">
        <DialogTitle>Attestation Details</DialogTitle>
        <DialogContent>
          {selectedAttestation && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                  {getAttestationTypeLabel(selectedAttestation.type)} Attestation
                </Typography>
                
                {selectedAttestation.isRevoked ? (
                  <Chip 
                    icon={<WarningIcon />} 
                    label="Revoked" 
                    className={`${classes.chip} ${classes.chipWarning}`}
                  />
                ) : (
                  <Chip 
                    icon={<CheckIcon />} 
                    label={`${selectedAttestation.confidence}% Confidence`} 
                    className={`${classes.chip} ${classes.chipSuccess}`}
                  />
                )}
              </Box>
              
              <Divider className={classes.divider} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attestation Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Attestation ID:</strong> {selectedAttestation._id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created By:</strong> {selectedAttestation.attester.username}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created:</strong> {new Date(selectedAttestation.createdAt).toLocaleString()}
                  </Typography>
                  
                  {selectedAttestation.expiresAt && (
                    <Typography variant="body2">
                      <strong>Expires:</strong> {new Date(selectedAttestation.expiresAt).toLocaleString()}
                    </Typography>
                  )}
                  
                  {selectedAttestation.isRevoked && (
                    <>
                      <Typography variant="body2">
                        <strong>Revoked:</strong> {new Date(selectedAttestation.revokedAt).toLocaleString()}
                      </Typography>
                      {selectedAttestation.revokedReason && (
                        <Typography variant="body2">
                          <strong>Revocation Reason:</strong> {selectedAttestation.revokedReason}
                        </Typography>
                      )}
                    </>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Blockchain Information
                  </Typography>
                  
                  {selectedAttestation.transaction ? (
                    <>
                      {selectedAttestation.transaction.assetCode && (
                        <Typography variant="body2">
                          <strong>Asset Code:</strong> {selectedAttestation.transaction.assetCode}
                        </Typography>
                      )}
                      
                      {selectedAttestation.transaction.assetIssuer && (
                        <Typography variant="body2">
                          <strong>Asset Issuer:</strong> {selectedAttestation.transaction.assetIssuer.substring(0, 8)}...{selectedAttestation.transaction.assetIssuer.substring(selectedAttestation.transaction.assetIssuer.length - 8)}
                        </Typography>
                      )}
                      
                      {selectedAttestation.transaction.txHash && (
                        <Typography variant="body2">
                          <strong>Transaction Hash:</strong> {selectedAttestation.transaction.txHash.substring(0, 8)}...{selectedAttestation.transaction.txHash.substring(selectedAttestation.transaction.txHash.length - 8)}
                        </Typography>
                      )}
                      
                      {selectedAttestation.transaction.timestamp && (
                        <Typography variant="body2">
                          <strong>Transaction Time:</strong> {new Date(selectedAttestation.transaction.timestamp).toLocaleString()}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No blockchain transaction information available.
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Divider className={classes.divider} />
                  <Typography variant="subtitle2" gutterBottom>
                    Attested Fields
                  </Typography>
                  
                  {Object.keys(selectedAttestation.fields).length > 0 ? (
                    <List dense className={classes.fieldsList}>
                      {Object.entries(selectedAttestation.fields).map(([key, value]) => (
                        <ListItem key={key}>
                          <ListItemIcon>
                            <CheckIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={key}
                            secondary={value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No fields in this attestation.
                    </Typography>
                  )}
                </Grid>
                
                {selectedAttestation.metadata && Object.keys(selectedAttestation.metadata).length > 0 && (
                  <Grid item xs={12}>
                    <Divider className={classes.divider} />
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Metadata
                    </Typography>
                    
                    <List dense className={classes.fieldsList}>
                      {Object.entries(selectedAttestation.metadata).map(([key, value]) => (
                        <ListItem key={key}>
                          <ListItemIcon>
                            <InfoIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={key}
                            secondary={value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default Attestations;