export interface GraphNode {
  id: string;
  name: string;
  label?: string;
  group?: number;
  val?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

export interface GraphLink {
  source: GraphNode | string;
  target: GraphNode | string;
  type?: string;
  label?: string;
  description?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphEditorProps {
  fileId: string;
  initialGraph: GraphData;
  onGraphUpdate: (newGraph: GraphData) => Promise<void>;
  isVisible: boolean;
}

export type EditorMode = 
  | 'add-node'
  | 'remove-node'
  | 'add-edge'
  | 'remove-edge'
  | 'edit-node-label'
  | 'edit-edge-label'
  | 'none';

export interface NodeFormData {
  name: string;
  connections?: {
    incoming: string[];
    outgoing: string[];
  };
}

export interface EdgeFormData {
  source: string;
  target: string;
  type: string;
} 