// frontend/src/pages/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip
} from '@material-ui/core';
import {
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  AccountBalance as AccountBalanceIcon,
  History as HistoryIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  infoBox: {
    backgroundColor: theme.palette.info.light,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  chipSuccess: {
    backgroundColor: theme.palette.success.light,
  },
  chipError: {
    backgroundColor: theme.palette.error.light,
  },
  chipPending: {
    backgroundColor: theme.palette.warning.light,
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    identity: null,
    attestations: [],
    verifications: [],
    stellarAccount: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch identity info
        const identityPromise = axios.get(`${BASE_URL}/api/identities`).catch(err => ({
          data: { success: false, data: null }
        }));
        
        // Fetch attestations
        const attestationsPromise = axios.get(`${BASE_URL}/api/attestations/received`).catch(err => ({
          data: { success: false, data: { attestations: [] } }
        }));
        
        // Fetch verifications
        const verificationsPromise = axios.get(`${BASE_URL}/api/verifications/received`).catch(err => ({
          data: { success: false, data: { verifications: [] } }
        }));
        
        // Fetch Stellar account info
        const stellarPromise = axios.get(`${BASE_URL}/api/stellar/account`).catch(err => ({
          data: { success: false, data: null }
        }));
        
        // Wait for all requests to complete
        const [
          identityResponse,
          attestationsResponse,
          verificationsResponse,
          stellarResponse
        ] = await Promise.all([
          identityPromise,
          attestationsPromise,
          verificationsPromise,
          stellarPromise
        ]);
        
        setDashboardData({
          identity: identityResponse.data.success ? identityResponse.data.data : null,
          attestations: attestationsResponse.data.success ? attestationsResponse.data.data.attestations : [],
          verifications: verificationsResponse.data.success ? verificationsResponse.data.data.verifications : [],
          stellarAccount: stellarResponse.data.success ? stellarResponse.data.data : null,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip size="small" icon={<CheckIcon />} label="Approved" className={classes.chipSuccess} />;
      case 'rejected':
        return <Chip size="small" icon={<ErrorIcon />} label="Rejected" className={classes.chipError} />;
      case 'revoked':
        return <Chip size="small" icon={<ErrorIcon />} label="Revoked" className={classes.chipError} />;
      case 'pending':
      default:
        return <Chip size="small" icon={<PendingIcon />} label="Pending" className={classes.chipPending} />;
    }
  };

  // Handle refresh dashboard data
  const handleRefreshData = async () => {
    await fetchDashboardData();
  };

  if (loading) {
    return (
      <Container className={classes.container}>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  const { identity, attestations, verifications, stellarAccount } = dashboardData;
  const hasIdentity = !!identity;
  const pendingVerifications = verifications.filter(v => v.result && v.result.status === 'pending');

  return (
    <Container className={classes.container}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" className={classes.title}>
          Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleRefreshData}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>
      
      {!hasIdentity && (
        <Paper className={classes.infoBox}>
          <Typography variant="body1" gutterBottom>
            Welcome to StellarID! To begin, you'll need to create your identity profile.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/identity"
          >
            Create Your Identity
          </Button>
        </Paper>
      )}
      
      <Grid container spacing={3}>
        {/* Identity Status Card */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6" component="h2" style={{ marginLeft: 8 }}>
                  Identity Status
                </Typography>
              </Box>
              
              {hasIdentity ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    Tier Level: <strong>{identity.currentTier}</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Stellar Address: <strong>{identity.stellarAddress.substring(0, 8)}...{identity.stellarAddress.substring(identity.stellarAddress.length - 8)}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Verified Fields: <strong>{identity.verifiedFields ? Object.keys(identity.verifiedFields).length : 0}</strong>
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No identity profile created yet.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                component={RouterLink} 
                to="/identity"
              >
                {hasIdentity ? 'View Profile' : 'Create Profile'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Attestations Card */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Box display="flex" alignItems="center" mb={2}>
                <VerifiedUserIcon color="primary" />
                <Typography variant="h6" component="h2" style={{ marginLeft: 8 }}>
                  Recent Attestations
                </Typography>
              </Box>
              
              {attestations.length > 0 ? (
                <List dense>
                  {attestations.slice(0, 3).map((attestation) => (
                    <ListItem key={attestation._id}>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${attestation.type} Attestation`}
                        secondary={`By: ${attestation.attester.username} • Confidence: ${attestation.confidence}%`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No attestations received yet.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                component={RouterLink} 
                to="/attestations"
              >
                View All Attestations
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Pending Verifications Card */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Box display="flex" alignItems="center" mb={2}>
                <HistoryIcon color="primary" />
                <Typography variant="h6" component="h2" style={{ marginLeft: 8 }}>
                  Pending Verification Requests
                </Typography>
              </Box>
              
              {pendingVerifications.length > 0 ? (
                <List dense>
                  {pendingVerifications.map((verification) => (
                    <ListItem key={verification._id}>
                      <ListItemIcon>
                        <PendingIcon color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`From: ${verification.requestor.username}`}
                        secondary={`Fields: ${verification.requestedFields.join(', ')}`}
                      />
                      {getStatusChip(verification.result.status)}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No pending verification requests.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                component={RouterLink} 
                to="/verifications"
              >
                Manage Verifications
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Stellar Account Card */}
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceIcon color="primary" />
                <Typography variant="h6" component="h2" style={{ marginLeft: 8 }}>
                  Stellar Account
                </Typography>
              </Box>
              
              {stellarAccount ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    Public Key: <strong>{stellarAccount.publicKey.substring(0, 8)}...{stellarAccount.publicKey.substring(stellarAccount.publicKey.length - 8)}</strong>
                  </Typography>
                  
                  {stellarAccount.exists === false ? (
                    <Typography variant="body2" color="error">
                      Account not yet created on Stellar network. Fund your account to activate it.
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body1" gutterBottom>
                        Balance: <strong>{stellarAccount.balances && stellarAccount.balances.find(b => b.asset_type === 'native')?.balance || '0'} XLM</strong>
                      </Typography>
                      <Typography variant="body1">
                        Assets: <strong>{stellarAccount.balances ? stellarAccount.balances.filter(b => b.asset_type !== 'native').length : 0}</strong>
                      </Typography>
                    </>
                  )}
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Stellar account information not available.
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                component={RouterLink} 
                to="/stellar"
              >
                Manage Account
              </Button>
              
              {stellarAccount && stellarAccount.exists === false && (
                <Button 
                  size="small"
                  color="secondary"
                  component={RouterLink}
                  to="/stellar"
                >
                  Fund Account
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Next Steps Guidance */}
      <Paper className={classes.paper} style={{ marginTop: 24 }}>
        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Divider className={classes.divider} />
        
        <List>
          {!hasIdentity && (
            <ListItem>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Create your identity profile"
                secondary="Fill in your personal information to establish your digital identity"
              />
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                component={RouterLink} 
                to="/identity"
              >
                Get Started
              </Button>
            </ListItem>
          )}
          
          {hasIdentity && identity.currentTier === 0 && (
            <ListItem>
              <ListItemIcon>
                <VerifiedUserIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Get your first attestation"
                secondary="Find an attester to verify your basic information"
              />
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                component={RouterLink} 
                to="/attestations"
              >
                Find Attesters
              </Button>
            </ListItem>
          )}
          
          {stellarAccount && stellarAccount.exists === false && (
            <ListItem>
              <ListItemIcon>
                <AccountBalanceIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Fund your Stellar account"
                secondary="Activate your account on the Stellar network"
              />
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                component={RouterLink} 
                to="/stellar"
              >
                Fund Account
              </Button>
            </ListItem>
          )}
          
          {pendingVerifications.length > 0 && (
            <ListItem>
              <ListItemIcon>
                <HistoryIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Respond to verification requests"
                secondary={`You have ${pendingVerifications.length} pending verification requests`}
              />
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                component={RouterLink} 
                to="/verifications"
              >
                Review
              </Button>
            </ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default Dashboard;