import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import SVGPreview from '../../components/common/SVGPreview';

interface SVGItem {
  id: string;
  svgUrl: string;
  fileName: string;
}

interface SVGListProps {
  items: SVGItem[];
  onDownload: (id: string) => void;
}

const SVGList: React.FC<SVGListProps> = ({ items, onDownload }) => {
  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No SVG files available. Upload a PDF to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} key={item.id}>
          <SVGPreview
            svgUrl={item.svgUrl}
            fileName={item.fileName}
            onDownload={() => onDownload(item.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SVGList; 