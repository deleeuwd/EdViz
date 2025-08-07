import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ForceGraphDisplay from '../../components/common/ForceGraphDisplay';
import { GraphEditor } from '../../components/graph/GraphEditor';
import { GraphType, renderGraph } from '../../services/api';
import { GraphData } from '../../types/graph';

interface SvgDisplayProps {
  svgData: string | null;
  setSvgData: (svg: string) => void;
  graphData: GraphData | null;
  fileName: string;
  graphType: GraphType;
  onAddToHistory: (svgData: string, fileName: string) => void;
}

// Utility to ensure SVG fits container
function fitSvgToContainer(svgString: string): string {
  if (!svgString) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      // Ensure viewBox exists
      if (!svg.hasAttribute('viewBox')) {
        const width = svg.getAttribute('width') || '800';
        const height = svg.getAttribute('height') || '600';
        svg.setAttribute('viewBox', `0 0 ${parseInt(width as string)} ${parseInt(height as string)}`);
      }
      return svg.outerHTML;
    }
  } catch (e) {
    // Fallback to original if parsing fails
    return svgString;
  }
  return svgString;
}

const SvgDisplay: React.FC<SvgDisplayProps> = ({ 
  svgData, 
  setSvgData,
  graphData: initialGraphData,
  fileName, 
  graphType,
  onAddToHistory 
}) => {
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string>('');
  const [graphData, setGraphData] = useState<GraphData | null>(initialGraphData);
  const lastAdded = useRef<{svg: string | null, file: string | null}>({svg: null, file: null});

  // Update local state when prop changes
  useEffect(() => {
    setGraphData(initialGraphData);
  }, [initialGraphData]);

  // Reset editor visibility when new file is uploaded
  useEffect(() => {
    if (fileName) {
      setIsEditorVisible(false);
      setCurrentFileId(fileName); // Using fileName as a unique identifier
    }
  }, [fileName]);

  // Show editor after graph is rendered
  useEffect(() => {
    if (graphData && graphData.nodes && graphData.nodes.length > 0) {
      // Small delay to ensure graph is fully rendered
      const timer = setTimeout(() => {
        setIsEditorVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [graphData]);

  const handleGraphUpdate = async (newGraph: GraphData) => {
    try {
      setGraphData({ ...newGraph }); // force new reference for re-render
      if (graphType === 'mermaid') {
        const newSvg = await renderGraph(newGraph);
        setSvgData(newSvg);
      }
      console.log('Graph updated:', newGraph);
    } catch (error) {
      console.error('Failed to update graph:', error);
    }
  };

  const handleDownload = () => {
    if (!svgData) return;
    
    // Sanitize the SVG data before creating blob
    const sanitizedSvg = svgData.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    if (!svgData) return;
    
    // Sanitize the SVG data before creating blob
    const sanitizedSvg = svgData.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    const blob = new Blob([sanitizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };

  // Helper to open D3 graph in a new tab (vanilla force-graph-2d)
  const handleOpenD3InNewTab = () => {
    if (!graphData) return;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>D3 Graph Preview</title>
            <style>
              body { margin: 0; background: #fff; }
              #d3-root { width: 100vw; height: 100vh; }
            </style>
          </head>
          <body>
            <div id="d3-root"></div>
            <script src="https://unpkg.com/force-graph"></script>
            <script>
              window.onload = function() {
                const data = ${JSON.stringify(graphData)};
                ForceGraph()(document.getElementById('d3-root'))
                  .graphData(data)
                  .width(window.innerWidth)
                  .height(window.innerHeight)
                  .backgroundColor('#fff')
                  .nodeId('id')
                  .linkSource('source')
                  .linkTarget('target')
                  .nodeColor(function() { return '#e53935'; })
                  .linkDirectionalArrowLength(6)
                  .linkDirectionalArrowRelPos(1)
                  .linkCurvature(0.1)
                  .nodeCanvasObject(function(node, ctx, globalScale) {
                    var radius = 10 / globalScale;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#e53935';
                    ctx.shadowColor = '#e53935';
                    ctx.shadowBlur = 2;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    var label = node.name || node.label || '';
                    var fontSize = 14 / globalScale;
                    ctx.font = fontSize + 'px Sans-Serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#111';
                    ctx.fillText(label, node.x, node.y - radius - 4);
                  })
                  .linkCanvasObject(function(link, ctx, globalScale) {
                    var start = link.source;
                    var end = link.target;
                    if (!start || !end) return;
                    // Draw the link line
                    ctx.save();
                    ctx.strokeStyle = '#bbb';
                    ctx.lineWidth = 1.5 / globalScale;
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                    ctx.restore();
                    // Draw the label
                    var label = link.type || link.label || '';
                    if (!label) return;
                    var midX = (start.x + end.x) / 2;
                    var midY = (start.y + end.y) / 2;
                    var fontSize = 12 / globalScale;
                    ctx.save();
                    ctx.font = fontSize + 'px Sans-Serif';
                    ctx.fillStyle = '#444';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, midX, midY);
                    ctx.restore();
                  });
              };
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  React.useEffect(() => {
    if (
      svgData &&
      (lastAdded.current.svg !== svgData || lastAdded.current.file !== fileName)
    ) {
      const sanitizedSvg = svgData.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      onAddToHistory(sanitizedSvg, fileName);
      lastAdded.current = {svg: svgData, file: fileName};
    }
  }, [svgData, fileName, onAddToHistory]);

  // Add ResizeObserver/useEffect for layout reflow
  // --- Layout reflow logic ---
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new window.ResizeObserver(() => {
      // Force reflow or update state if needed
      setGraphData(g => g ? { ...g } : g);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [graphType]);

  if (!svgData && !graphData) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Upload a PDF file to see the converted visualization
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '90vh',
        maxHeight: '90vh',
        overflow: 'visible', // Allow children to be fully visible
      }}
      ref={containerRef}
    >
      {/* Graph area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // Required for flex scroll
          overflow: 'auto',
          mb: 2,
        }}
      >
        {graphType === 'mermaid' ? (
          <Box
            sx={{
              width: '100%',
              height: '600px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }
            }}
            dangerouslySetInnerHTML={{ __html: fitSvgToContainer(svgData || '') }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '600px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {graphData && <ForceGraphDisplay graphData={graphData} width={800} height={600} />}
          </Box>
        )}
      </Box>

      {/* Download/Open buttons */}
      <Stack direction="row" spacing={2} justifyContent="center">
        {graphType === 'mermaid' ? (
          <>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download SVG
            </Button>
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={handleOpenInNewTab}
            >
              Open in New Tab
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenD3InNewTab}
          >
            Open in New Tab
          </Button>
        )}
      </Stack>

      {/* Graph Editor always visible at the bottom */}
      {graphData && graphData.nodes && graphData.links && (
        <Box sx={{ mt: 2 }}>
          <GraphEditor
            fileId={currentFileId}
            initialGraph={graphData}
            onGraphUpdate={handleGraphUpdate}
            isVisible={isEditorVisible}
          />
        </Box>
      )}
    </Paper>
  );
};

export default SvgDisplay; 