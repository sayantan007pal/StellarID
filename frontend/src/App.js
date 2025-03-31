// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IdentityProfile from './pages/IdentityProfile';
import Attestations from './pages/Attestations';
import Verifications from './pages/Verifications';
import StellarAccount from './pages/StellarAccount';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Import Context
import { AuthProvider } from './context/AuthContext';

// Create theme
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3e64ff',
    },
    secondary: {
      main: '#5edfff',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header />
          <main>
            <Switch>
              <Route exact path="/" component={LandingPage} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <PrivateRoute path="/identity" component={IdentityProfile} />
              <PrivateRoute path="/attestations" component={Attestations} />
              <PrivateRoute path="/verifications" component={Verifications} />
              <PrivateRoute path="/stellar" component={StellarAccount} />
              <PrivateRoute path="/admin" component={AdminPanel} roles={['admin']} />
              <Route path="/404" component={NotFound} />
              <Redirect to="/404" />
            </Switch>
          </main>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;