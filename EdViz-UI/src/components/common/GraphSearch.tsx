import React from 'react';
import { Box, CircularProgress, Typography, Grid, Card, CardContent, CardHeader, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';
import { usePreviousWorks } from '../../context/PreviousWorksContext';
import { format } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';

// Define the type for search results
interface GraphSearchResult {
  id: string;
  title: string;
  summary_text: string;
  created_at: string;
  description?: string;
  graph_data: {
    svg_content: string;
    [key: string]: any;
  };
}

// Animated card component
const MotionCard = motion(Card);

const GraphSearch: React.FC = () => {
  const { searchResults, isLoading, error, search, isSearching, refreshPreviousWorks } = usePreviousWorks();

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

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <SearchBar
              onSearch={search}
              placeholder="Search graphs..."
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refreshPreviousWorks()}
            disabled={isLoading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      <AnimatePresence>
        {!isLoading && !error && searchResults.length > 0 && (
          <>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 3, 
                textAlign: 'center',
                color: 'text.primary'
              }}
            >
              {isSearching ? 'Search Results' : 'Latest Graphs'}
            </Typography>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <Grid container spacing={3}>
                {searchResults.map((result: GraphSearchResult) => (
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
                        subheader={format(new Date(result.created_at), 'PPP')}
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
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {result.summary_text}
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!isLoading && !error && searchResults.length === 0 && (
        <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          {isSearching ? 'No matching graphs found' : 'No graphs available'}
        </Typography>
      )}
    </Box>
  );
};

export default GraphSearch; 