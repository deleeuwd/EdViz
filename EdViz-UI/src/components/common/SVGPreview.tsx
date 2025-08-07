import React from 'react';
import { Card, CardContent, CardMedia, IconButton, Box } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface SVGPreviewProps {
  svgUrl: string;
  fileName: string;
  onDownload: () => void;
}

const SVGPreview: React.FC<SVGPreviewProps> = ({ svgUrl, fileName, onDownload }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={svgUrl}
        alt={fileName}
        sx={{
          objectFit: 'contain',
          backgroundColor: 'background.paper',
        }}
      />
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={onDownload}
            sx={{
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            size="small"
            component="a"
            href={svgUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <OpenInNewIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SVGPreview; 