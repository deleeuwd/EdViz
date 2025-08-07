import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './assets/theme/theme';
import { PreviousWorksProvider } from './context/PreviousWorksContext';
import { HomeProvider } from './context/HomeContext';
import AppContent from './AppContent';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <PreviousWorksProvider>
          <HomeProvider>
            <AppContent />
          </HomeProvider>
        </PreviousWorksProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
