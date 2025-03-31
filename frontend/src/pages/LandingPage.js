// frontend/src/pages/LandingPage.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider
} from '@material-ui/core';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
  AccountBalance as AccountBalanceIcon,
  VerifiedUser as VerifiedUserIcon,
  Lock as LockIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  heroSection: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(8, 0, 6),
    marginBottom: theme.spacing(4),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  infoSection: {
    padding: theme.spacing(8, 0),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9 ratio
  },
  cardContent: {
    flexGrow: 1,
  },
  featureIcon: {
    fontSize: 40,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  callToAction: {
    backgroundColor: theme.palette.secondary.light,
    padding: theme.spacing(6),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
  },
  divider: {
    margin: theme.spacing(4, 0),
  },
  section: {
    marginBottom: theme.spacing(4),
  },
}));

const LandingPage = () => {
  const classes = useStyles();

  return (
    <>
      {/* Hero Section */}
      <Box className={classes.heroSection}>
        <Container maxWidth="md">
          <Typography component="h1" variant="h2" align="center" gutterBottom>
            StellarID
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Decentralized Identity for Financial Inclusion
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Build your digital identity on the Stellar blockchain and gain access to financial services previously out of reach.
          </Typography>
          <Box className={classes.heroButtons}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button variant="contained" color="secondary" component={RouterLink} to="/register">
                  Get Started
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" color="inherit" component={RouterLink} to="/login">
                  Sign In
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Main content */}
      <Container maxWidth="md">
        {/* Problem Statement */}
        <Box className={classes.section}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            The Problem
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                Over 1 billion people worldwide lack official identification, making it impossible to access basic financial services.
              </Typography>
              <Typography variant="body1" paragraph>
                Without verifiable identity, individuals are excluded from:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Banking services" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Loans and credit" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Secure savings options" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} style={{ padding: 16 }}>
                <Typography variant="h6" gutterBottom>
                  Financial Exclusion by the Numbers
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box width="70%" mr={2}>
                    <Typography variant="body2">Global population with no ID</Typography>
                  </Box>
                  <Box width="30%" bgcolor="primary.light" p={1} borderRadius={5}>
                    <Typography variant="body1" align="center">1+ billion</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box width="70%" mr={2}>
                    <Typography variant="body2">Adults without bank accounts</Typography>
                  </Box>
                  <Box width="30%" bgcolor="primary.light" p={1} borderRadius={5}>
                    <Typography variant="body1" align="center">1.4 billion</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box width="70%" mr={2}>
                    <Typography variant="body2">Cost of financial exclusion</Typography>
                  </Box>
                  <Box width="30%" bgcolor="primary.light" p={1} borderRadius={5}>
                    <Typography variant="body1" align="center">$250B+</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider className={classes.divider} />

        {/* Solution */}
        <Box className={classes.section}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Our Solution
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <FingerprintIcon className={classes.featureIcon} />
                <Typography variant="h6" gutterBottom>
                  Self-Sovereign Identity
                </Typography>
                <Typography>
                  You own and control your digital identity. No central authority can revoke or control access to your credentials.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <VerifiedUserIcon className={classes.featureIcon} />
                <Typography variant="h6" gutterBottom>
                  Progressive Verification
                </Typography>
                <Typography>
                  Start with minimal verification and build credibility over time through trusted attesters in your community.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <SecurityIcon className={classes.featureIcon} />
                <Typography variant="h6" gutterBottom>
                  Blockchain Security
                </Typography>
                <Typography>
                  Built on Stellar blockchain technology for immutable, secure, and globally accessible identity credentials.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider className={classes.divider} />

        {/* How It Works */}
        <Box className={classes.section}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            How It Works
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={2} style={{ padding: 16 }}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Create Your Digital Identity" 
                      secondary="Register and build your basic identity profile with whatever information you have available."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Collect Attestations" 
                      secondary="Get your identity information verified by trusted community attesters."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LockIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Control Your Data" 
                      secondary="You decide what information to share and with whom. Your data is never shared without your explicit consent."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccountBalanceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Access Financial Services" 
                      secondary="Use your verified digital identity to access banking, credit, and other financial services."
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box className={classes.callToAction}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Start Building Your Digital Identity Today
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Join the movement for financial inclusion through decentralized identity.
          </Typography>
          <Box textAlign="center" mt={3}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={RouterLink} 
              to="/register"
            >
              Create Your StellarID
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box className={classes.footer}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="textSecondary" align="center">
            StellarID - Powered by Stellar Blockchain
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Copyright © StellarID 2025
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;