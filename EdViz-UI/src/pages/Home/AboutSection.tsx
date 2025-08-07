import React from 'react';
import { Typography, Box } from '@mui/material';

const AboutSection: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        About Ed-Viz
      </Typography>
      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
        Easily convert your course syllabus or study materials into an interactive concept map. Simply upload a PDF, and the app will extract and analyze key topics, formulas, and relationships to help you visualize and understand the content better.
      </Typography>
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Features:
        </Typography>
        <Box component="ul" sx={{ pl: 2, '& > *': { mb: 1.5 } }}>
          <Typography component="li">Interactive concept mapping</Typography>
          <Typography component="li">Key topic extraction</Typography>
          <Typography component="li">Relationship analysis</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AboutSection; 