import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none', mt: 3.75 }}>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            color: 'white',
            fontSize: '2rem',
            fontWeight: 500,
            textAlign: 'center',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '0.05em',
            '& span': {
              color: '#1a237e',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(255, 255, 255, 0.5)',
              fontFamily: "'Orbitron', sans-serif",
            }
          }}
        >
          <span>Ed-Viz</span> - Transform your PDF documents into interactive Concept Maps
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 