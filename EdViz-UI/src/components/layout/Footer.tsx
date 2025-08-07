import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        py: 3,
        zIndex: 1
      }}
    >
      <Typography 
        variant="body1" 
        align="center" 
        sx={{ 
          color: 'rgba(135, 206, 235, 0.6)',
          textShadow: '0 0 15px rgba(135, 206, 235, 0.3)',
          fontWeight: 300,
          letterSpacing: 1
        }}
      >
        © {new Date().getFullYear()} Ed-Viz
      </Typography>
    </Box>
  );
};

export default Footer; 