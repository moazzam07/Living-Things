import './App.css';
import React, {useContext, useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './components/Dashboard/dashboard';
import { AuthProvider, useAuth} from './authProvider';
import Register from './components/Register/register';
import Login from './components/Login/login';
import '@fortawesome/fontawesome-free/css/all.min.css';


const PrivateRoute = ({children}) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/"/>;
};
function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Routes> 
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;