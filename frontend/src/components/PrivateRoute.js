// frontend/src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

const PrivateRoute = ({ component: Component, roles, ...rest }) => {
  const { currentUser, isAuthenticated, loading } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        // Show loading while checking authentication
        if (loading) {
          return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          );
        }

        // If not authenticated, redirect to login
        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location }
              }}
            />
          );
        }

        // Check role-based access if roles are specified
        if (roles && !roles.includes(currentUser.role)) {
          return (
            <Redirect
              to={{
                pathname: '/dashboard',
                state: { from: props.location }
              }}
            />
          );
        }

        // If authenticated and authorized, render the component
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;