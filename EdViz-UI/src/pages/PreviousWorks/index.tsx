import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  IconButton,
  Stack,
  Container,
  Card,
  CardHeader,
  CardActions,
  Button,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../../components/common/SearchBar';
import BaseLayout from '../../components/layout/BaseLayout';
import { format } from 'date-fns';
import axios from 'axios';
import { usePreviousWorks } from '../../context/PreviousWorksContext';

// Animated card component
const MotionCard = motion(Card);

const PreviousWorks: React.FC = () => {
  const { 
    searchResults, 
    isLoading, 
    error, 
    search, 
    isSearching, 
    refreshPreviousWorks,
    hasInitialLoad 
  } = usePreviousWorks();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleOpenInNewTab = async (graphData: any) => {
    console.log('Opening in new tab, graphData:', graphData);
    if (!graphData) {
      console.error('No graph data available to open');
      return;
    }
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/graphs/generate-svg`, graphData);
      const svgContent = response.data.svg_content;
      const sanitizedSvg = svgContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating SVG:', error);
    }
  };

  const handleDownload = async (graphData: any, fileName: string) => {
    if (!graphData) {
      console.error('No graph data available for download');
      return;
    }
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/graphs/generate-svg`, graphData);
      const svgContent = response.data.svg_content;
      const sanitizedSvg = svgContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace('.pdf', '')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating SVG:', error);
    }
  };

  return (
    <BaseLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Previous Works
              {hasInitialLoad && (
                <Typography 
                  component="span" 
                  variant="caption" 
                  sx={{ 
                    ml: 1, 
                    color: 'text.secondary',
                    fontSize: '0.8rem'
                  }}
                >
                  (Data loaded)
                </Typography>
              )}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refreshPreviousWorks()}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            {searchResults.length} {searchResults.length === 1 ? 'Concept Map' : 'Concept Maps'} in total
          </Typography>
          <Box sx={{ maxWidth: 600, mb: 4 }}>
            <SearchBar
              onSearch={search}
              placeholder="Search your concept maps..."
              disabled={isLoading}
            />
          </Box>
        </Box>

        {isLoading && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            mt: 4,
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Typography color="text.secondary">
              Loading concept maps...
            </Typography>
          </Box>
        )}

        {error && (
          <Paper sx={{ p: 3, mt: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>
              {error}
            </Typography>
          </Paper>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && !error && searchResults.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Grid container spacing={3}>
                {searchResults.map((result) => (
                  <Grid item xs={12} sm={6} md={4} key={result.id}>
                    <MotionCard
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.3s ease-in-out',
                        '&:hover': {
                          boxShadow: 6
                        }
                      }}
                    >
                      <CardHeader
                        title={result.title}
                        subheader={format(new Date(result.created_at), 'PPP p')}
                        titleTypographyProps={{
                          variant: 'h6',
                          component: 'h2',
                          sx: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }
                        }}
                      />
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenInNewTab(result.graph_data)}
                            title="Open in new tab"
                          >
                            <OpenInNewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(result.graph_data, result.title)}
                            title="Download SVG"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Stack>
                      </CardActions>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !error && searchResults.length === 0 && (
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2
          }}>
            <Typography variant="body1" color="text.secondary">
              {isSearching 
                ? 'No matching concept maps found'
                : 'No concept maps available. Convert your first PDF to see it here!'}
            </Typography>
          </Paper>
        )}
      </Container>
    </BaseLayout>
  );
};

export default PreviousWorks; 