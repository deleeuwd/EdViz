import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GraphEditorProps, EditorMode, GraphData, GraphNode, GraphLink } from '../../types/graph';
import {
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  updateNodeLabel,
  updateEdgeLabel,
  getNodeConnections,
} from '../../utils/graphOperations';

// Responsive container for Graph Editor
const EditorContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(2),
  margin: theme.spacing(0),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  // Prevent overflow
  overflow: 'hidden',
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const GraphEditor: React.FC<GraphEditorProps> = ({
  fileId,
  initialGraph,
  onGraphUpdate,
  isVisible,
}) => {
  const [graph, setGraph] = useState<GraphData>(initialGraph);
  const [mode, setMode] = useState<EditorMode>('none');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [selectedEdge, setSelectedEdge] = useState<{ source: string; target: string } | null>(null);
  const [formData, setFormData] = useState<{ name: string }>({ name: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    setGraph(initialGraph);
    setMode('none');
    setDialogOpen(false);
    setSelectedNode('');
    setSelectedEdge(null);
    setFormData({ name: '' });
  }, [initialGraph]);

  if (!isVisible) return null;

  const handleModeChange = (newMode: EditorMode) => {
    setMode(newMode);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setMode('none');
    setFormData({ name: '' });
    setSelectedNode('');
    setSelectedEdge(null);
  };

  const handleSubmit = async () => {
    try {
      let newGraph = { ...graph };

      switch (mode) {
        case 'add-node':
          newGraph = addNode(graph, formData.name);
          break;
        case 'remove-node':
          newGraph = removeNode(graph, selectedNode);
          break;
        case 'add-edge':
          if (selectedEdge) {
            newGraph = addEdge(graph, selectedEdge.source, selectedEdge.target, formData.name);
          }
          break;
        case 'remove-edge':
          if (selectedEdge) {
            newGraph = removeEdge(graph, selectedEdge.source, selectedEdge.target);
          }
          break;
        case 'edit-node-label':
          newGraph = updateNodeLabel(graph, selectedNode, formData.name);
          break;
        case 'edit-edge-label':
          if (selectedEdge) {
            newGraph = updateEdgeLabel(graph, selectedEdge.source, selectedEdge.target, formData.name);
          }
          break;
      }

      await onGraphUpdate(newGraph);
      setGraph(newGraph);
      setSuccess(`Successfully ${mode.replace('-', 'ed ')}`);
      handleDialogClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const renderDialogContent = () => {
    switch (mode) {
      case 'add-node':
        return (
          <TextField
            fullWidth
            label="Node Name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
          />
        );
      case 'remove-node': {
        const node = graph.nodes.find(n => n.id === selectedNode);
        const connections = getNodeConnections(graph, selectedNode);
        const incomingEdges = graph.links.filter(e => e.target === selectedNode);
        const outgoingEdges = graph.links.filter(e => e.source === selectedNode);
        return (
          <>
            <FormControl fullWidth>
              <InputLabel>Select Node</InputLabel>
              <Select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                label="Select Node"
              >
                {graph.nodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                The following edges will also be deleted:
              </Typography>
              {incomingEdges.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">Incoming Edges:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {incomingEdges.map(edge => (
                      <li key={`in-${edge.source}-${edge.target}`}>
                        {`"${edge.type || edge.label}" from ${graph.nodes.find(n => n.id === edge.source)?.name} → ${node?.name}`}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
              {outgoingEdges.length > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight="bold">Outgoing Edges:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {outgoingEdges.map(edge => (
                      <li key={`out-${edge.source}-${edge.target}`}>
                        {`"${edge.type || edge.label}" from ${node?.name} → ${graph.nodes.find(n => n.id === edge.target)?.name}`}
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          </>
        );
      }
      case 'add-edge':
        return (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Source Node</InputLabel>
              <Select
                value={selectedEdge?.source || ''}
                onChange={(e) => setSelectedEdge({ ...selectedEdge, source: e.target.value } as any)}
                label="Source Node"
              >
                {graph.nodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Node</InputLabel>
              <Select
                value={selectedEdge?.target || ''}
                onChange={(e) => setSelectedEdge({ ...selectedEdge, target: e.target.value } as any)}
                label="Target Node"
              >
                {graph.nodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Edge Type"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
            />
          </>
        );
      case 'remove-edge':
        return (
          <FormControl fullWidth>
            <InputLabel>Select Edge</InputLabel>
            <Select
              value={selectedEdge ? `${selectedEdge.source}-${selectedEdge.target}` : ''}
              onChange={(e) => {
                const [source, target] = e.target.value.split('-');
                setSelectedEdge({ source, target });
              }}
              label="Select Edge"
            >
              {graph.links.map((edge) => (
                <MenuItem key={`${edge.source}-${edge.target}`} value={`${edge.source}-${edge.target}`}>
                  {`${edge.type || edge.label} (${graph.nodes.find(n => n.id === edge.source)?.name} → ${graph.nodes.find(n => n.id === edge.target)?.name})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'edit-node-label':
        return (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Node</InputLabel>
              <Select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                label="Select Node"
              >
                {graph.nodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="New Name"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
            />
          </>
        );
      case 'edit-edge-label':
        return (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Edge</InputLabel>
              <Select
                value={selectedEdge ? `${selectedEdge.source}-${selectedEdge.target}` : ''}
                onChange={(e) => {
                  const [source, target] = e.target.value.split('-');
                  setSelectedEdge({ source, target });
                }}
                label="Select Edge"
              >
                {graph.links.map((edge) => (
                  <MenuItem key={`${edge.source}-${edge.target}`} value={`${edge.source}-${edge.target}`}>
                    {`${edge.type || edge.label} (${graph.nodes.find(n => n.id === edge.source)?.name} → ${graph.nodes.find(n => n.id === edge.target)?.name})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="New Type"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <EditorContainer elevation={3}>
      <Typography variant="h6" gutterBottom>
        Graph Editor
      </Typography>

      <ButtonContainer>
        <ButtonGroup orientation="vertical" fullWidth>
          <Button
            variant="contained"
            onClick={() => handleModeChange('add-node')}
          >
            Add Node
          </Button>
          <Button
            variant="contained"
            onClick={() => handleModeChange('remove-node')}
          >
            Remove Node
          </Button>
          <Button
            variant="contained"
            onClick={() => handleModeChange('add-edge')}
          >
            Add Edge
          </Button>
          <Button
            variant="contained"
            onClick={() => handleModeChange('remove-edge')}
          >
            Remove Edge
          </Button>
          <Button
            variant="contained"
            onClick={() => handleModeChange('edit-node-label')}
          >
            Edit Node Label
          </Button>
          <Button
            variant="contained"
            onClick={() => handleModeChange('edit-edge-label')}
          >
            Edit Edge Label
          </Button>
        </ButtonGroup>
      </ButtonContainer>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </DialogTitle>
        <DialogContent>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </EditorContainer>
  );
}; 