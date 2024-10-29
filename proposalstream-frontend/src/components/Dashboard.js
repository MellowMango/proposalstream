import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../CombinedAuthContext';
import navLinks from '../utils/navLinks';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled components
const StyledCard = styled(Card)(({ theme, category }) => ({
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
  borderTop: `4px solid ${
    category === 'admin'
      ? theme.palette.error.main
      : category === 'client'
      ? theme.palette.success.main
      : theme.palette.info.main
  }`,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  textAlign: 'left',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

function Dashboard({ showNotification }) {
  const { user } = useAuth();
  const theme = useTheme();

  // Function to filter links based on user roles and exclude the Home link
  const getFilteredLinks = () => {
    return navLinks.filter(
      (link) => link.roles.some((role) => user.role === role) && link.path !== '/'
    );
  };

  // Separate links by category for better UI (optional)
  const categorizedLinks = {
    client: [],
    vendor: [],
    admin: [],
  };

  getFilteredLinks().forEach((link) => {
    // Categorize Client Links
    if (link.roles.includes('client')) {
      categorizedLinks.client.push(link);
    }

    // Categorize Vendor Links
    if (link.roles.includes('vendor')) {
      categorizedLinks.vendor.push(link);
    }

    // Categorize Admin Links (Only if the link is exclusively for admin)
    if (link.roles.includes('admin') && link.roles.length === 1) {
      categorizedLinks.admin.push(link);
    }
  });

  // Helper function to create option cards based on categories
  const createOptionCard = (title, links, category) => (
    <Grid item xs={12} sm={6} md={4} key={title}>
      <StyledCard category={category}>
        <CardContent>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            color={
              category === 'admin'
                ? 'error'
                : category === 'client'
                ? 'success'
                : 'info'
            }
            sx={{ mb: 3, fontWeight: 600 }}
          >
            {title} Options
          </Typography>
          <Box>
            {links.map((link) => (
              <StyledButton
                key={link.path}
                component={Link}
                to={link.path}
                variant="text"
                color={
                  category === 'admin'
                    ? 'error'
                    : category === 'client'
                    ? 'success'
                    : 'info'
                }
              >
                {link.name}
              </StyledButton>
            ))}
          </Box>
        </CardContent>
      </StyledCard>
    </Grid>
  );

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            mb: 6,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              mb: 2,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {user.email[0].toUpperCase()}
          </Avatar>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Welcome to Your Dashboard
          </Typography>
          <Typography
            variant="h6"
            color="textSecondary"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Hello, {user.email}!
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Render Client Options if applicable */}
          {(user.role === 'client' || user.role === 'admin') &&
            categorizedLinks.client.length > 0 &&
            createOptionCard('Client', categorizedLinks.client, 'client')}

          {/* Render Vendor Options if applicable */}
          {(user.role === 'vendor' || user.role === 'admin') &&
            categorizedLinks.vendor.length > 0 &&
            createOptionCard('Vendor', categorizedLinks.vendor, 'vendor')}

          {/* Render Admin Options if applicable */}
          {user.role === 'admin' &&
            categorizedLinks.admin.length > 0 &&
            createOptionCard('Admin', categorizedLinks.admin, 'admin')}
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;
