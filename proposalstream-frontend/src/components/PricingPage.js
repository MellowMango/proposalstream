import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  AppBar,
  Toolbar,
  useScrollTrigger,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from "framer-motion";

// Import your assets
import logoAndName from '../assets/images/logo-and-name.png';

// Styled components
const PricingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  }
}));

const PricingPage = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const vendorFeatures = [
    "Unlimited proposal submissions",
    "Professional proposal templates",
    "Real-time collaboration tools",
    "Automated contract generation",
    "Document tracking & management",
    "24/7 customer support",
    "Mobile app access",
    "Integration with common accounting software"
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar 
        position="fixed" 
        elevation={trigger ? 4 : 0}
        sx={{
          bgcolor: trigger ? 'background.default' : 'transparent',
          transition: 'all 0.3s',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <RouterLink to="/">
              <Box
                component="img"
                src={logoAndName}
                alt="ProposalStream Logo"
                sx={{ height: 40 }}
              />
            </RouterLink>

            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Features', 'Pricing', 'Contact'].map((item) => (
                <Button
                  key={item}
                  component={RouterLink}
                  to={`/${item.toLowerCase()}`}
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                >
                  {item}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Container 
        component={motion.main}
        maxWidth="lg" 
        sx={{ pt: 15, pb: 8 }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <Box 
          component={motion.div}
          variants={fadeInUp}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Choose the plan that's right for your business
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="stretch"
          justifyContent="center"
        >
          {/* Vendor Card */}
          <Box
            component={motion.div}
            variants={fadeInUp}
            sx={{ width: { xs: '100%', md: '45%' } }}
          >
            <PricingCard>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom>
                  Vendors
                </Typography>
                <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                  $100
                  <Typography variant="subtitle1" component="span" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
                <List>
                  {vendorFeatures.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center', pb: 3 }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Start Free Trial
                </Button>
              </CardActions>
            </PricingCard>
          </Box>

          {/* Property Manager Card */}
          <Box
            component={motion.div}
            variants={fadeInUp}
            sx={{ width: { xs: '100%', md: '45%' } }}
          >
            <PricingCard>
              <CardContent>
                <Typography variant="h4" component="h2" gutterBottom>
                  Property Managers
                </Typography>
                <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                  Enterprise
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Custom pricing based on your portfolio size and specific needs. Our enterprise solution includes:
                </Typography>
                <List>
                  {[
                    "Dedicated account manager",
                    "Custom workflow automation",
                    "Advanced reporting & analytics",
                    "API access",
                    "Priority support",
                    "Custom integrations",
                    "Team training & onboarding",
                    "SLA guarantees"
                  ].map((feature, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center', pb: 3 }}>
                <Button
                  component={RouterLink}
                  to="/contact"
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Book a Demo
                </Button>
              </CardActions>
            </PricingCard>
          </Box>
        </Stack>

        {/* FAQ Section */}
        <Box
          component={motion.section}
          variants={fadeInUp}
          sx={{ mt: 8, textAlign: 'center' }}
        >
          <Typography variant="h3" gutterBottom>
            Questions?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Contact our sales team for more information about our enterprise solutions.
          </Typography>
          <Button
            component={RouterLink}
            to="/contact"
            variant="outlined"
            size="large"
          >
            Contact Sales
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center">
            <Box
              component="img"
              src={logoAndName}
              alt="ProposalStream Logo"
              sx={{ height: 40 }}
            />
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} ProposalStream. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((item) => (
                <Button
                  key={item}
                  component={RouterLink}
                  to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                >
                  {item}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default PricingPage;