import React from 'react';
import { Fade } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Fade
      in={true}
      timeout={{
        enter: 500,
        exit: 300,
      }}
      key={location.pathname}
    >
      <div>
        {children}
      </div>
    </Fade>
  );
};

export default PageTransition; 