import React, { useState, useEffect, useCallback } from 'react';
import api, { clearAllNonAdminUsers } from '../utils/api';

function UserManagement({ showNotification }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Token before fetching users:', localStorage.getItem('token'));
      const response = await api.get('/api/users');
      console.log('Users fetched:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      showNotification('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await api.delete(`/api/users/${userId}`);
      showNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllUsers = async () => {
    if (window.confirm('Are you sure you want to delete all non-admin users? This action cannot be undone.')) {
      try {
        setLoading(true);
        console.log('Sending request to clear all users');
        const response = await clearAllNonAdminUsers();
        console.log('Clear all users response:', response);
        showNotification(response.message, 'success');
        fetchUsers();
      } catch (error) {
        console.error('Error clearing users:', error);
        showNotification(`Error clearing users: ${error.response?.data?.message || error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <button 
        onClick={handleClearAllUsers} 
        style={{ backgroundColor: 'red', color: 'white', marginBottom: '20px' }}
      >
        Clear All Non-Admin Users
      </button>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
