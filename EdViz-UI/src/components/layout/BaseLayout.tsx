import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { Box, Container, IconButton, Tooltip } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import NetworkBackground from '../common/NetworkBackground';
import EnvelopeIcon from '../common/EnvelopeIcon';
import ContactForm from '../common/ContactForm';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [currentChildren, setCurrentChildren] = useState(children);
  const [nextChildren, setNextChildren] = useState<React.ReactNode>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEnvelopeHovered, setIsEnvelopeHovered] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const currentRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const iconStyle = {
    fontSize: '2rem'
  };

  const MotionHomeIcon = motion(HomeIcon);
  const MotionFolderIcon = motion(FolderIcon);

  const buttonStyle = {
    position: 'relative',
    color: 'white',
    padding: '12px',
  };

  const activeButtonStyle = (path: string) => ({
    ...buttonStyle,
    '&::after': isActive(path) ? {
      content: '""',
      position: 'absolute',
      bottom: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderBottom: '8px solid white',
      zIndex: 1,
    } : {},
  });

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } }
  };

  const homeIconVariants = {
    hover: {
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity
      }
    }
  };

  const folderIconVariants = {
    hover: {
      rotateY: [0, 180],
      transition: {
        duration: 0.6
      }
    }
  };

  const settingsIconVariants = {
    hover: {
      rotate: 180,
      transition: {
        duration: 0.6,
        ease: "linear"
      }
    }
  };

  useEffect(() => {
    if (children !== currentChildren) {
      setIsTransitioning(true);
      setNextChildren(children);
      
      const transitionTimeout = setTimeout(() => {
        if (nextRef.current) {
          setContentHeight(nextRef.current.scrollHeight);
        }
      }, 50);

      const cleanupTimeout = setTimeout(() => {
        setCurrentChildren(children);
        setNextChildren(null);
        setIsTransitioning(false);
      }, 500);

      return () => {
        clearTimeout(transitionTimeout);
        clearTimeout(cleanupTimeout);
      };
    }
  }, [children]);

  useEffect(() => {
    if (currentRef.current && !contentHeight) {
      setContentHeight(currentRef.current.scrollHeight);
    }
  }, [contentHeight]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative',
      '& > *:not(canvas)': {
        position: 'relative',
        zIndex: 1
      }
    }}>
      <NetworkBackground />
      <Navbar />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 3, 
              mb: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '12px',
            }}
          >
            <Tooltip title="Home" arrow placement="top">
              <RouterLink to="/">
                <IconButton
                  sx={activeButtonStyle('/')}
                >
                  <motion.div
                    whileHover="hover"
                    variants={iconVariants}
                  >
                    <MotionHomeIcon 
                      sx={iconStyle} 
                      variants={homeIconVariants}
                    />
                  </motion.div>
                </IconButton>
              </RouterLink>
            </Tooltip>

            <Tooltip title="Previous Works" arrow placement="top">
              <RouterLink to="/previous-works">
                <IconButton
                  sx={activeButtonStyle('/previous-works')}
                >
                  <motion.div
                    whileHover="hover"
                    variants={iconVariants}
                  >
                    <MotionFolderIcon 
                      sx={iconStyle} 
                      variants={folderIconVariants}
                    />
                  </motion.div>
                </IconButton>
              </RouterLink>
            </Tooltip>

            <Tooltip title="Contact Us" arrow placement="top">
              <IconButton
                sx={activeButtonStyle('/contact')}
                onMouseEnter={() => setIsEnvelopeHovered(true)}
                onMouseLeave={() => setIsEnvelopeHovered(false)}
                onClick={() => setContactOpen(true)}
              >
                <motion.div
                  whileHover="hover"
                  variants={iconVariants}
                >
                  <EnvelopeIcon isHovered={isEnvelopeHovered} />
                </motion.div>
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '100%',
              height: contentHeight,
              transition: 'height 450ms cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              ref={currentRef}
              sx={{
                position: 'absolute',
                width: '100%',
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 200ms',
                p: 4,
              }}
            >
              {currentChildren}
            </Box>
            {nextChildren && (
              <Box
                ref={nextRef}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  opacity: isTransitioning ? 1 : 0,
                  transition: 'opacity 200ms',
                  p: 4,
                }}
              >
                {nextChildren}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
      <Footer />
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4 }}>
          <ContactForm onSuccess={() => setContactOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BaseLayout; 