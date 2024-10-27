import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#1f2937',
    },
    text: {
      primary: '#334155',
      secondary: '#64748b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Work Sans", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      '@media (max-width:768px)': {
        fontSize: '2.5rem',
      },
    },
    // ... other typography variants
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          letterSpacing: '0.025em',
          textTransform: 'none',
        },
      },
    },
    // ... other component overrides
  },
});

export default theme;