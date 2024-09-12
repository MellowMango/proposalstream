import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import JobRequestForm from './components/JobRequestForm';
import VendorSubmissionForm from './components/VendorSubmissionForm';
import ContractManagement from './components/ContractManagement';
import JobRequestManagement from './components/JobRequestManagement';
import Notification from './components/Notification';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ContractTemplateUpload from './components/ContractTemplateUpload';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const [notification, setNotification] = useState(null);
  const [authError, setAuthError] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (authError) {
      showNotification(`Authentication error: ${authError}`, 'error');
    }
  }, [authError]);

  return (
    <AuthProvider onError={setAuthError}>
      <Router>
        <div className="App">
          <Header />
          {notification && <Notification message={notification.message} type={notification.type} />}
          <main>
            <Routes>
              <Route path="/login" element={<Login showNotification={showNotification} />} />
              <Route path="/register" element={<Register showNotification={showNotification} />} />
              <Route path="/" element={<ProtectedRoute><Dashboard showNotification={showNotification} /></ProtectedRoute>} />
              <Route path="/job-request" element={<ProtectedRoute allowedRoles={['client', 'admin']}><JobRequestForm showNotification={showNotification} /></ProtectedRoute>} />
              <Route path="/job-request-management" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><JobRequestManagement showNotification={showNotification} /></ProtectedRoute>} />
              <Route path="/vendor-submission" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorSubmissionForm showNotification={showNotification} /></ProtectedRoute>} />
              <Route path="/contract-management" element={<ProtectedRoute allowedRoles={['client', 'admin']}><ContractManagement showNotification={showNotification} /></ProtectedRoute>} />
              <Route path="/admin/user-management" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement showNotification={showNotification} /></ProtectedRoute>} />
              <Route path="/contract-template-upload" element={<ProtectedRoute allowedRoles={['client', 'admin']}><ContractTemplateUpload showNotification={showNotification} /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
