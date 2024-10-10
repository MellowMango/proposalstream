// proposalstream-frontend/src/App.js

import React, { useState } from 'react';
import { MsalProvider } from "@azure/msal-react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import msalInstance from './msalInstance';
import { AuthProvider } from './CombinedAuthContext';
import Header from './components/Header';
import JobRequestForm from './components/JobRequestForm';
import ContractManagement from './components/ContractManagement';
import JobRequestManagement from './components/JobRequestManagement';
import Notification from './components/Notification';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ContractTemplateUpload from './components/ContractTemplateUpload';
import AddProperty from './components/AddProperty';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Onboarding from './components/Onboarding';
import AuthCallback from './AuthCallback';
import HomePage from './components/HomePage';
import './App.css';
import { protectedRoutes } from './routeConfig'; // Import protected routes

function App() {
  console.log("Rendering App component");
  const [notification, setNotification] = useState(null);

  // Function to display notifications
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleError = (message) => {
    showNotification(message, 'error');
  };

  // Define routes where the Header should be shown
  const routesWithHeader = protectedRoutes; // Reuse protectedRoutes for consistency

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <AuthProvider onError={handleError}>
          <ErrorBoundary>
            <div className="App">
              {/* Conditionally render Header based on current route */}
              {routesWithHeader.includes(window.location.pathname) && <Header />}
              {notification && (
                <Notification
                  message={notification.message}
                  type={notification.type}
                />
              )}
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login showNotification={showNotification} />} />
                  <Route path="/register" element={<Register showNotification={showNotification} provider="proposalStream" />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'vendor', 'admin']} provider="proposalStream">
                        <Dashboard showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'vendor', 'admin']} provider="proposalStream">
                        <Onboarding showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/job-request-form"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'admin', 'vendor']} provider="proposalStream">
                        <JobRequestForm showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-property"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'admin']} provider="proposalStream">
                        <AddProperty showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/job-request-management"
                    element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']} provider="proposalStream">
                        <JobRequestManagement showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contract-management"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'admin']} provider="proposalStream">
                        <ContractManagement showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/user-management"
                    element={
                      <ProtectedRoute allowedRoles={['admin']} provider="proposalStream">
                        <UserManagement showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contract-template-upload"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'admin']} provider="proposalStream">
                        <ContractTemplateUpload showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />

                  {/* MicrosoftProvider Public Routes */}
                  <Route
                    path="/microsoft-login"
                    element={<Login showNotification={showNotification} provider="microsoftProvider" />}
                  />

                  {/* MicrosoftProvider Protected Routes */}
                  <Route
                    path="/microsoft-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['client', 'admin', 'vendor']} provider="microsoftProvider">
                        <Dashboard showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />

                  {/* Auth Callback Route */}
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Catch-All Route for 404 Not Found */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </MsalProvider>
  );
}

export default App;