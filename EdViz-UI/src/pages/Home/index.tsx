import React, { useCallback } from 'react';
import { Grid } from '@mui/material';
import AboutSection from './AboutSection';
import UploadSection from './UploadSection';
import SvgDisplay from './SvgDisplay';
import BaseLayout from '../../components/layout/BaseLayout';
import { usePreviousWorks } from '../../context/PreviousWorksContext';
import { useHome } from '../../context/HomeContext';
import { GraphType } from '../../services/api';

const Home: React.FC = () => {
  const { state, dispatch } = useHome();
  const { addWork } = usePreviousWorks();

  const handleUpload = (file: File) => {
    dispatch({ 
      type: 'SET_UPLOAD_START', 
      payload: { fileName: file.name } 
    });
  };

  const handleSvgRetrieved = (response: any, fileName: string) => {
    dispatch({
      type: 'SET_UPLOAD_SUCCESS',
      payload: {
        svgData: response.svg_content,
        graphData: response.graph_json,
        fileName,
        message: `Successfully processed "${fileName}"`
      }
    });
  };

  const handleGraphTypeChange = (type: GraphType) => {
    dispatch({ type: 'SET_GRAPH_TYPE', payload: type });
  };

  const handleAddToHistory = useCallback((svgData: string, fileName: string) => {
    addWork(svgData, fileName);
  }, [addWork]);

  const handleSetSvgData = (svg: string) => {
    dispatch({ type: 'UPDATE_SVG_DATA', payload: svg });
  };

  return (
    <BaseLayout>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <AboutSection />
        </Grid>
        <Grid item xs={12} md={6}>
          <UploadSection 
            onFileUpload={handleUpload} 
            onSvgRetrieved={handleSvgRetrieved}
            onGraphTypeChange={handleGraphTypeChange}
          />
        </Grid>
        {(state.svgData || state.graphData) && !state.isUploading && (
          <Grid item xs={12}>
            <SvgDisplay 
              svgData={state.svgData} 
              setSvgData={handleSetSvgData}
              graphData={state.graphData}
              fileName={state.fileName}
              graphType={state.graphType}
              onAddToHistory={handleAddToHistory}
            />
          </Grid>
        )}
      </Grid>
    </BaseLayout>
  );
};

export default Home; 