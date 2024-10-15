// proposalstream-frontend/src/HandleRedirect.js

import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useLocation } from 'react-router-dom';
import { protectedRoutes } from './routeConfig'; // Ensure the path is correct

const HandleRedirect = () => {
  const { instance } = useMsal();
  const location = useLocation();

  useEffect(() => {
    const isProtected = protectedRoutes.includes(location.pathname);

    if (!isProtected) {
      // Do not handle redirect on public routes
      return;
    }

    const handleRedirect = async () => {
      try {
        await instance.handleRedirectPromise();
      } catch (error) {
        console.error('Redirect error:', error);
      }
    };

    handleRedirect();
  }, [instance, location.pathname]);

  return null;
};

export default HandleRedirect;