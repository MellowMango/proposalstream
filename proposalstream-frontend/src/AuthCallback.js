// src/AuthCallback.js

import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';

function AuthCallback() {
  const { instance, inProgress } = useMsal();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (inProgress === 'none') {
        try {
          const response = await instance.handleRedirectPromise();
          if (response) {
            // Successful login
            navigate('/dashboard');
          } else {
            // No response, might be initial page load or user hasn't logged in
            const accounts = instance.getAllAccounts();
            if (accounts.length > 0) {
              // User is already logged in
              navigate('/dashboard');
            } else {
              // User hasn't logged in
              navigate('/login');
            }
          }
        } catch (error) {
          console.error('Error handling redirect:', error);
          navigate('/login');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handleRedirect();
  }, [instance, navigate, inProgress]);

  if (isProcessing) {
    return <div>Processing login...</div>;
  }

  return null;
}

export default AuthCallback;