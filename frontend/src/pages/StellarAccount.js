// frontend/src/pages/StellarAccount.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Box,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@material-ui/core';
import { 
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon
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
    margin: theme.spacing(3, 0),
  },
  accountInfo: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  balanceItem: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  assetCard: {
    marginBottom: theme.spacing(2),
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  keyDisplay: {
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.875rem',
  },
  actionButton: {
    margin: theme.spacing(1),
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
}));

const StellarAccount = () => {
  const classes = useStyles();
  const { currentUser } = useContext(AuthContext);
  
  const [accountInfo, setAccountInfo] = useState(null);
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dialog state
  const [assetDialog, setAssetDialog] = useState(false);
  const [trustlineDialog, setTrustlineDialog] = useState(false);
  
  // Form state
  const [assetForm, setAssetForm] = useState({
    assetCode: '',
    memo: ''
  });
  
  const [trustlineForm, setTrustlineForm] = useState({
    assetCode: '',
    assetIssuer: '',
    limit: '1000000'
  });

  // Fetch Stellar account data
  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      
      try {
        // Fetch account info
        const accountResponse = await axios.get(`${BASE_URL}/api/stellar/account`);
        if (accountResponse.data.success) {
          setAccountInfo(accountResponse.data.data);
        }
        
        // Fetch assets
        const assetsResponse = await axios.get(`${BASE_URL}/api/stellar/assets`);
        if (assetsResponse.data.success) {
          setAssets(assetsResponse.data.data.assets || []);
        }
        
        // Fetch transactions
        const transactionsResponse = await axios.get(`${BASE_URL}/api/stellar/transactions`);
        if (transactionsResponse.data.success) {
          setTransactions(transactionsResponse.data.data.transactions || []);
        }
      } catch (err) {
        console.error('Fetch Stellar data error:', err);
        setError('Failed to load Stellar account information');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchAccountData();
    }
  }, [currentUser]);

  // Fund testnet account
  const handleFundTestnet = async () => {
    setActionLoading(true);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/stellar/fund-testnet`);
      
      if (response.data.success) {
        setSuccessMessage('Account funded successfully on testnet!');
        
        // Refresh account data after funding
        const accountResponse = await axios.get(`${BASE_URL}/api/stellar/account`);
        if (accountResponse.data.success) {
          setAccountInfo(accountResponse.data.data);
        }
      }
    } catch (err) {
      console.error('Fund testnet error:', err);
      setError(err.response?.data?.message || 'Failed to fund testnet account');
    } finally {
      setActionLoading(false);
    }
  };

  // Create asset
  const handleCreateAsset = async () => {
    setActionLoading(true);
    
    try {
      if (!assetForm.assetCode) {
        setError('Asset code is required');
        return;
      }
      
      const response = await axios.post(`${BASE_URL}/api/stellar/create-asset`, assetForm);
      
      if (response.data.success) {
        setSuccessMessage(`Asset ${assetForm.assetCode} created successfully!`);
        setAssetDialog(false);
        
        // Reset form
        setAssetForm({
          assetCode: '',
          memo: ''
        });
        
        // Refresh assets list
        const assetsResponse = await axios.get(`${BASE_URL}/api/stellar/assets`);
        if (assetsResponse.data.success) {
          setAssets(assetsResponse.data.data.assets || []);
        }
      }
    } catch (err) {
      console.error('Create asset error:', err);
      setError(err.response?.data?.message || 'Failed to create asset');
    } finally {
      setActionLoading(false);
    }
  };

  // Create trustline
  const handleCreateTrustline = async () => {
    setActionLoading(true);
    
    try {
      if (!trustlineForm.assetCode || !trustlineForm.assetIssuer) {
        setError('Asset code and issuer are required');
        return;
      }
      
      const response = await axios.post(`${BASE_URL}/api/stellar/create-trustline`, trustlineForm);
      
      if (response.data.success) {
        setSuccessMessage(`Trustline for ${trustlineForm.assetCode} created successfully!`);
        setTrustlineDialog(false);
        
        // Reset form
        setTrustlineForm({
          assetCode: '',
          assetIssuer: '',
          limit: '1000000'
        });
        
        // Refresh assets list
        const assetsResponse = await axios.get(`${BASE_URL}/api/stellar/assets`);
        if (assetsResponse.data.success) {
          setAssets(assetsResponse.data.data.assets || []);
        }
      }
    } catch (err) {
      console.error('Create trustline error:', err);
      setError(err.response?.data?.message || 'Failed to create trustline');
    } finally {
      setActionLoading(false);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setActionLoading(true);
    
    try {
      // Fetch account info
      const accountResponse = await axios.get(`${BASE_URL}/api/stellar/account`);
      if (accountResponse.data.success) {
        setAccountInfo(accountResponse.data.data);
      }
      
      // Fetch assets
      const assetsResponse = await axios.get(`${BASE_URL}/api/stellar/assets`);
      if (assetsResponse.data.success) {
        setAssets(assetsResponse.data.data.assets || []);
      }
      
      // Fetch transactions
      const transactionsResponse = await axios.get(`${BASE_URL}/api/stellar/transactions`);
      if (transactionsResponse.data.success) {
        setTransactions(transactionsResponse.data.data.transactions || []);
      }
      
      setSuccessMessage('Account data refreshed');
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh account data');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle form changes
  const handleAssetFormChange = (e) => {
    const { name, value } = e.target;
    setAssetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrustlineFormChange = (e) => {
    const { name, value } = e.target;
    setTrustlineForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear any error or success message
  const handleCloseAlert = () => {
    setError(null);
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <Container className={classes.container}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const hasTestnetOption = process.env.REACT_APP_STELLAR_NETWORK === 'testnet';
  const isAccountCreated = accountInfo && accountInfo.exists !== false;

  return (
    <Container className={classes.container}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" className={classes.title}>
          Stellar Account Management
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={actionLoading}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Account Information */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          <AccountBalanceIcon fontSize="small" style={{ marginRight: 8 }} />
          Account Information
        </Typography>
        
        {accountInfo ? (
          <>
            <Box className={classes.accountInfo}>
              <Typography variant="subtitle2" gutterBottom>
                Public Key
              </Typography>
              <Typography variant="body2" className={classes.keyDisplay}>
                {accountInfo.publicKey}
              </Typography>
            </Box>
            
            {!isAccountCreated ? (
              <Alert severity="warning" style={{ marginBottom: 16 }}>
                Your account has not yet been created on the Stellar network. Fund your account with XLM to activate it.
                {hasTestnetOption && (
                  <Box mt={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleFundTestnet}
                      disabled={actionLoading}
                      startIcon={<AttachMoneyIcon />}
                    >
                      Fund with Testnet XLM
                    </Button>
                  </Box>
                )}
              </Alert>
            ) : (
              <Box className={classes.balanceItem}>
                <Typography variant="subtitle2" gutterBottom>
                  XLM Balance
                </Typography>
                <Typography variant="h6">
                  {accountInfo.balances?.find(b => b.asset_type === 'native')?.balance || '0'} XLM
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body1" color="textSecondary">
            Stellar account information not available.
          </Typography>
        )}
        
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            className={classes.actionButton}
            onClick={() => setAssetDialog(true)}
            disabled={!isAccountCreated || actionLoading}
            startIcon={<AddIcon />}
          >
            Create Asset
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            className={classes.actionButton}
            onClick={() => setTrustlineDialog(true)}
            disabled={!isAccountCreated || actionLoading}
            startIcon={<AddIcon />}
          >
            Create Trustline
          </Button>
        </Box>
      </Paper>
      
      {/* Custom Assets */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Custom Assets
        </Typography>
        
        {assets.length > 0 ? (
          <Grid container spacing={2}>
            {assets.map((asset, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card className={classes.assetCard}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {asset.asset_code}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Issuer: {asset.asset_issuer.substring(0, 10)}...{asset.asset_issuer.substring(asset.asset_issuer.length - 5)}
                    </Typography>
                    <Typography variant="body1">
                      Balance: {asset.balance}
                    </Typography>
                    {asset.limit && (
                      <Typography variant="body2" color="textSecondary">
                        Limit: {asset.limit}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No custom assets found.
          </Typography>
        )}
      </Paper>
      
      {/* Recent Transactions */}
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        
        {transactions.length > 0 ? (
          <List>
            {transactions.map((tx, index) => (
              <React.Fragment key={tx.id || index}>
                <ListItem>
                  <ListItemText
                    primary={`Transaction ${tx.id ? tx.id.substring(0, 8) + '...' : '#' + (index + 1)}`}
                    secondary={new Date(tx.created_at).toLocaleString()}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={tx.successful ? 'Successful' : 'Failed'} 
                      color={tx.successful ? 'primary' : 'default'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < transactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No transactions found.
          </Typography>
        )}
      </Paper>
      
      {/* Create Asset Dialog */}
      <Dialog open={assetDialog} onClose={() => setAssetDialog(false)}>
        <DialogTitle>Create Custom Asset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a custom asset on the Stellar network that can be used for identity attestations.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="assetCode"
            name="assetCode"
            label="Asset Code (1-12 characters)"
            type="text"
            fullWidth
            required
            value={assetForm.assetCode}
            onChange={handleAssetFormChange}
            inputProps={{ maxLength: 12 }}
          />
          <TextField
            margin="dense"
            id="memo"
            name="memo"
            label="Memo (Optional)"
            type="text"
            fullWidth
            value={assetForm.memo}
            onChange={handleAssetFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssetDialog(false)} color="default" disabled={actionLoading}>
            Cancel
          </Button>
          <Box position="relative">
            <Button onClick={handleCreateAsset} color="primary" disabled={actionLoading || !assetForm.assetCode}>
              Create
            </Button>
            {actionLoading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </Box>
        </DialogActions>
      </Dialog>
      
      {/* Create Trustline Dialog */}
      <Dialog open={trustlineDialog} onClose={() => setTrustlineDialog(false)}>
        <DialogTitle>Create Trustline</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a trustline to accept tokens from other users or issuers.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="assetCode"
            name="assetCode"
            label="Asset Code"
            type="text"
            fullWidth
            required
            value={trustlineForm.assetCode}
            onChange={handleTrustlineFormChange}
          />
          <TextField
            margin="dense"
            id="assetIssuer"
            name="assetIssuer"
            label="Asset Issuer (Stellar Address)"
            type="text"
            fullWidth
            required
            value={trustlineForm.assetIssuer}
            onChange={handleTrustlineFormChange}
          />
          <TextField
            margin="dense"
            id="limit"
            name="limit"
            label="Trust Limit"
            type="text"
            fullWidth
            value={trustlineForm.limit}
            onChange={handleTrustlineFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrustlineDialog(false)} color="default" disabled={actionLoading}>
            Cancel
          </Button>
          <Box position="relative">
            <Button 
              onClick={handleCreateTrustline} 
              color="primary" 
              disabled={actionLoading || !trustlineForm.assetCode || !trustlineForm.assetIssuer}
            >
              Create
            </Button>
            {actionLoading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </Box>
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

export default StellarAccount;