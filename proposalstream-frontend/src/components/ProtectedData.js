   // proposalstream-frontend/src/components/ProtectedData.js

   import React, { useEffect, useState } from 'react';
   import { useAxios } from '../utils/axiosInstance';
   import { useAuth } from '../CombinedAuthContext';

   const ProtectedData = () => {
     const axios = useAxios();
     const { user } = useAuth();
     const [data, setData] = useState(null);

     useEffect(() => {
       const fetchData = async () => {
         try {
           const response = await axios.get('/secured-endpoint'); // Adjust endpoint as needed
           setData(response.data);
         } catch (error) {
           console.error('Error fetching secured data:', error);
         }
       };

       if (user && user.accessToken) {
         fetchData();
       }
     }, [axios, user]);

     return (
       <div>
         <h2>Protected Data</h2>
         {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
       </div>
     );
   };

   export default ProtectedData;