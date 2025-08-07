import React, { useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Box } from '@mui/material';
import { GraphData } from '../../types/graph';

// Define the node type that ForceGraph2D actually uses internally
interface ForceGraphNodeInternal {
  id: string;
  name: string;
  group?: number;
  val?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

// Define the link type that ForceGraph2D actually uses internally
interface ForceGraphLinkInternal {
  source: ForceGraphNodeInternal | string;
  target: ForceGraphNodeInternal | string;
  type?: string;
}

interface ForceGraphDisplayProps {
  graphData: GraphData;
  width?: number;
  height?: number;
}

const ForceGraphDisplay: React.FC<ForceGraphDisplayProps> = ({ 
  graphData, 
  width = 800, 
  height = 600 
}) => {
  // Filter out links that reference missing nodes
  const nodeIds = new Set(graphData.nodes.map(n => n.id));
  const safeLinks = graphData.links.filter(
    link =>
      nodeIds.has(typeof link.source === 'string' ? link.source : link.source.id) &&
      nodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
  );

  // Convert our GraphData to the format expected by ForceGraph2D
  const forceGraphData = {
    nodes: graphData.nodes.map(node => ({
      id: node.id,
      name: node.name || node.label || '', // Use name or label for display
      group: node.group || 0,
      x: node.x,
      y: node.y,
      fx: node.fx,
      fy: node.fy,
      val: node.val
    } as ForceGraphNodeInternal)),
    links: safeLinks.map(link => ({
      source: typeof link.source === 'string' ? link.source : link.source.id,
      target: typeof link.target === 'string' ? link.target : link.target.id,
      type: link.type || link.label || '' // Use type or label for display
    }))
  };

  const nodeCanvasObject = useCallback((node: ForceGraphNodeInternal, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    if (!label) return;

    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

    // Draw node circle
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.group === 1 ? '#ff0000' : '#1a237e';
    ctx.fill();

    // Draw label background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(
      node.x! - bckgDimensions[0] / 2,
      node.y! + 8,
      bckgDimensions[0],
      bckgDimensions[1]
    );

    // Draw label text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(
      label,
      node.x!,
      node.y! + 8 + bckgDimensions[1] / 2
    );
  }, []);

  const linkCanvasObject = useCallback((link: ForceGraphLinkInternal, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = link.type || '';
    if (!label) return;

    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

    // Calculate midpoint
    const start = typeof link.source === 'string' 
      ? forceGraphData.nodes.find(n => n.id === link.source)
      : link.source as ForceGraphNodeInternal;
    const end = typeof link.target === 'string'
      ? forceGraphData.nodes.find(n => n.id === link.target)
      : link.target as ForceGraphNodeInternal;
    
    if (!start || !end || !start.x || !start.y || !end.x || !end.y) return;

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Draw link line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw label background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(
      midX - bckgDimensions[0] / 2,
      midY - bckgDimensions[1] / 2,
      bckgDimensions[0],
      bckgDimensions[1]
    );

    // Draw label text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(label, midX, midY);
  }, [forceGraphData.nodes]);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: height }}>
      <ForceGraph2D
        graphData={forceGraphData}
        nodeId="id"
        linkSource="source"
        linkTarget="target"
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        width={width}
        height={height}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        nodeRelSize={6}
        cooldownTicks={100}
        onEngineStop={() => {
          // Optional: Add any logic to run when the graph stops moving
        }}
      />
    </Box>
  );
};

export default ForceGraphDisplay; 