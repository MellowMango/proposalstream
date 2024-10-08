// proposalstream-frontend/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import msalInstance from './msalInstance'; // Import the dedicated MSAL instance
import { AuthProvider } from './CombinedAuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
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
import Onboarding from './components/Onboarding'; // Import the Onboarding component
import AuthCallback from './AuthCallback'; // Import the AuthCallback component

function App() {
  const [notification, setNotification] = useState(null);

  // Function to display notifications
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleError = (message) => {
    showNotification(message, 'error');
  };

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <AuthProvider onError={handleError}>
          <ErrorBoundary>
            <div className="App">
              <Header />
              {/* Notification component for user feedback */}
              {notification && (
                <Notification
                  message={notification.message}
                  type={notification.type}
                />
              )}
              <main>
                <Routes>
                  {/* Auth Callback Route */}
                  <Route
                    path="/auth/callback"
                    element={<AuthCallback />}
                  />

                  {/* Public Routes */}
                  <Route
                    path="/login"
                    element={<Login showNotification={showNotification} />}
                  />
                  <Route
                    path="/register"
                    element={<Register showNotification={showNotification} provider="proposalStream" />}
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute
                        allowedRoles={['client', 'vendor', 'admin']}
                        provider="proposalStream"
                      >
                        <Dashboard showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute
                        allowedRoles={['client', 'vendor', 'admin']}
                        provider="proposalStream"
                      >
                        <Onboarding showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/job-request-form"
                    element={
                      <ProtectedRoute
                        allowedRoles={['client', 'admin', 'vendor']}
                        provider="proposalStream"
                      >
                        <JobRequestForm showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-property"
                    element={
                      <ProtectedRoute
                        allowedRoles={['client', 'admin']}
                        provider="proposalStream"
                      >
                        <AddProperty showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/job-request-management"
                    element={
                      <ProtectedRoute
                        allowedRoles={['vendor', 'admin']}
                        provider="proposalStream"
                      >
                        <JobRequestManagement showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contract-management"
                    element={
                      <ProtectedRoute
                        allowedRoles={['client', 'admin']}
                        provider="proposalStream"
                      >
                        <ContractManagement showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/user-management"
                    element={
                      <ProtectedRoute
                        allowedRoles={['admin']}
                        provider="proposalStream"
                      >
                        <UserManagement showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contract-template-upload"
                    element={
                      <ProtectedRoute
                        allowedRoles={['client', 'admin']}
                        provider="proposalStream"
                      >
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
                      <ProtectedRoute
                        allowedRoles={['client', 'admin', 'vendor']}
                        provider="microsoftProvider"
                      >
                        <Dashboard showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-All Route for 404 Not Found */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute
                        allowedRoles={['client', 'vendor', 'admin']}
                        provider="proposalStream"
                      >
                        <Dashboard showNotification={showNotification} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </MsalProvider>
  );
}

export default App;