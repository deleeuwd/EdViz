declare module 'react-force-graph-2d' {
  import { Component } from 'react';

  interface ForceGraphProps {
    graphData: {
      nodes: any[];
      links: any[];
    };
    nodeId?: string;
    linkSource?: string;
    linkTarget?: string;
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    linkCanvasObject?: (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    width?: number;
    height?: number;
    linkDirectionalParticles?: number;
    linkDirectionalParticleWidth?: number;
    nodeRelSize?: number;
    cooldownTicks?: number;
    onEngineStop?: () => void;
  }

  export default class ForceGraph2D extends Component<ForceGraphProps> {}
} 