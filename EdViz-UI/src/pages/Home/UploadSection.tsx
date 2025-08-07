import React, { useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadPdf, GraphType } from '../../services/api';
import { useHome } from '../../context/HomeContext';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  onSvgRetrieved: (response: any, fileName: string) => void;
  onGraphTypeChange: (type: GraphType) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const UploadSection: React.FC<UploadSectionProps> = ({ 
  onFileUpload, 
  onSvgRetrieved,
  onGraphTypeChange 
}) => {
  const { state, dispatch } = useHome();

  const handleGraphTypeChange = (type: GraphType) => {
    dispatch({ type: 'SET_GRAPH_TYPE', payload: type });
    onGraphTypeChange(type);
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const fileType = rejectedFiles[0].file.type || 'unknown';
      dispatch({
        type: 'SET_UPLOAD_ERROR',
        payload: { message: `Invalid file type: ${fileType}. Please upload only PDF files.` }
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      if (file.size > MAX_FILE_SIZE) {
        dispatch({
          type: 'SET_UPLOAD_ERROR',
          payload: { message: `File is too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.` }
        });
        return;
      }

      // Set uploading state and clear previous error
      dispatch({ type: 'SET_UPLOAD_START', payload: { fileName: file.name } });

      try {
        const response = await uploadPdf(file, state.graphType);

        dispatch({
          type: 'SET_UPLOAD_SUCCESS',
          payload: {
            svgData: response.svg_content,
            graphData: response.graph_json,
            fileName: file.name,
            message: `Successfully uploaded and converted "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
          }
        });

        onFileUpload(file);
        onSvgRetrieved(response, file.name);
      } catch (error) {
        dispatch({
          type: 'SET_UPLOAD_ERROR',
          payload: { message: error instanceof Error && error.message ? error.message : 'Failed to process file' }
        });
      }
    }
  }, [onFileUpload, onSvgRetrieved, state.graphType, dispatch]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: state.isUploading,
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0].file;
      if (file.size > MAX_FILE_SIZE) {
        dispatch({
          type: 'SET_UPLOAD_ERROR',
          payload: { message: `File is too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.` }
        });
      } else {
        const fileType = file.type || 'unknown';
        dispatch({
          type: 'SET_UPLOAD_ERROR',
          payload: { message: `Invalid file type: ${fileType}. Please upload only PDF files.` }
        });
      }
    }
  });

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
        <FormLabel component="legend">Select Graph Type</FormLabel>
        <RadioGroup
          row
          value={state.graphType}
          onChange={(e) => handleGraphTypeChange(e.target.value as GraphType)}
        >
          <FormControlLabel 
            value="mermaid" 
            control={<Radio />} 
            label="Mermaid Graph" 
            disabled={state.isUploading}
          />
          <FormControlLabel 
            value="force" 
            control={<Radio />} 
            label="Force Graph" 
            disabled={state.isUploading}
          />
        </RadioGroup>
      </FormControl>

      {state.uploadMessage && state.uploadMessage.text && (
        <Alert 
          severity={state.uploadMessage.type} 
          sx={{ width: '100%', mb: 2 }}
        >
          {state.uploadMessage.text}
        </Alert>
      )}

      <Box
        {...getRootProps()}
        sx={{
          width: '100%',
          height: '200px',
          border: '2px dashed',
          borderColor: state.isSuccess 
            ? '#4caf50' 
            : isDragReject 
              ? '#d32f2f' 
              : isDragActive 
                ? 'primary.main' 
                : '#ccc',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: state.isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: state.isSuccess
            ? 'rgba(76, 175, 80, 0.04)'
            : isDragReject
              ? 'rgba(211, 47, 47, 0.04)'
              : isDragActive
                ? 'rgba(25, 118, 210, 0.04)'
                : '#fff',
          transition: 'all 0.2s ease-in-out',
          opacity: state.isUploading ? 0.7 : 1,
          '&:hover': {
            borderColor: state.isUploading 
              ? '#ccc'
              : state.isSuccess
                ? '#4caf50'
                : isDragReject
                  ? '#d32f2f'
                  : 'primary.main',
            backgroundColor: state.isUploading
              ? '#fff'
              : state.isSuccess
                ? 'rgba(76, 175, 80, 0.08)'
                : isDragReject
                  ? 'rgba(211, 47, 47, 0.04)'
                  : 'rgba(25, 118, 210, 0.04)',
          },
          gap: 1,
        }}
      >
        <input {...getInputProps()} />
        {state.isUploading ? (
          <>
            <CircularProgress />
            <Typography variant="h6" align="center" sx={{ color: '#666' }}>
              Processing your file...
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: 'primary.main', mt: 1, fontWeight: 500 }}>
              PDF accepted, may take a minute or two
            </Typography>
          </>
        ) : (
          <>
            <CloudUploadIcon 
              sx={{ 
                fontSize: 48, 
                color: state.isSuccess
                  ? '#4caf50'
                  : isDragReject
                    ? '#d32f2f'
                    : isDragActive
                      ? 'primary.main'
                      : '#666'
              }} 
            />
            <Typography variant="h6" align="center" sx={{ color: '#666' }}>
              {state.isSuccess 
                ? 'File uploaded successfully!'
                : isDragActive
                  ? 'Drop your PDF file here'
                  : 'Drag & drop a PDF file here, or click to select'}
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#666' }}>
              Maximum file size: 10MB
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default UploadSection; 