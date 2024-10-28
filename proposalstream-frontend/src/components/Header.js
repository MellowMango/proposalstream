// src/components/Header.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography
} from '@mui/material';
import { useAuth } from '../CombinedAuthContext';
import logo from '../assets/images/logo-and-name.png';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/dashboard">
            <img 
              src={logo} 
              alt="ProposalStream" 
              style={{ height: '32px', width: 'auto' }}
            />
          </Link>
          <Button
            component={Link}
            to="/dashboard"
            color="inherit"
            sx={{ textTransform: 'none' }}
          >
            Dashboard
          </Button>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
            <Button
              onClick={handleMenu}
              color="inherit"
              sx={{ textTransform: 'none' }}
              startIcon={
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'primary.main' 
                  }}
                >
                  {user.email[0].toUpperCase()}
                </Avatar>
              }
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleLogout}>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
