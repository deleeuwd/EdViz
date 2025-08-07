import { GraphData, GraphNode, GraphLink } from '../types/graph';

export const generateNodeId = (name: string): string => {
  const words = name.toLowerCase().split(/\s+/);
  return words.join('_');
};

export const addNode = (graph: GraphData, name: string): GraphData => {
  const id = generateNodeId(name);
  const newNode: GraphNode = { 
    id, 
    name,
    label: name // Keep label for backward compatibility
  };
  
  return {
    nodes: [...graph.nodes, newNode],
    links: [...graph.links]
  };
};

export const removeNode = (graph: GraphData, nodeId: string): GraphData => {
  return {
    nodes: graph.nodes.filter(node => node.id !== nodeId),
    links: graph.links.filter(link => 
      (typeof link.source === 'string' ? link.source : link.source.id) !== nodeId && 
      (typeof link.target === 'string' ? link.target : link.target.id) !== nodeId
    )
  };
};

export const addEdge = (
  graph: GraphData, 
  source: string, 
  target: string, 
  type: string
): GraphData => {
  const newLink: GraphLink = { 
    source, 
    target, 
    type,
    label: type // Keep label for backward compatibility
  };
  
  // Check if edge already exists
  const linkExists = graph.links.some(
    link => 
      (typeof link.source === 'string' ? link.source : link.source.id) === source && 
      (typeof link.target === 'string' ? link.target : link.target.id) === target
  );
  
  if (linkExists) {
    return graph;
  }
  
  return {
    nodes: [...graph.nodes],
    links: [...graph.links, newLink]
  };
};

export const removeEdge = (
  graph: GraphData,
  source: string,
  target: string
): GraphData => {
  return {
    nodes: [...graph.nodes],
    links: graph.links.filter(link => 
      !((typeof link.source === 'string' ? link.source : link.source.id) === source && 
        (typeof link.target === 'string' ? link.target : link.target.id) === target)
    )
  };
};

export const updateNodeLabel = (
  graph: GraphData,
  nodeId: string,
  newName: string
): GraphData => {
  return {
    nodes: graph.nodes.map(node =>
      node.id === nodeId 
        ? { ...node, name: newName, label: newName } // Update both name and label
        : node
    ),
    links: [...graph.links]
  };
};

export const updateEdgeLabel = (
  graph: GraphData,
  source: string,
  target: string,
  newType: string
): GraphData => {
  return {
    nodes: [...graph.nodes],
    links: graph.links.map(link => 
      (typeof link.source === 'string' ? link.source : link.source.id) === source && 
      (typeof link.target === 'string' ? link.target : link.target.id) === target
        ? { ...link, type: newType, label: newType } // Update both type and label
        : link
    )
  };
};

export const getNodeConnections = (graph: GraphData, nodeId: string) => {
  return {
    incoming: graph.links
      .filter(link => (typeof link.target === 'string' ? link.target : link.target.id) === nodeId)
      .map(link => typeof link.source === 'string' ? link.source : link.source.id),
    outgoing: graph.links
      .filter(link => (typeof link.source === 'string' ? link.source : link.source.id) === nodeId)
      .map(link => typeof link.target === 'string' ? link.target : link.target.id)
  };
}; 