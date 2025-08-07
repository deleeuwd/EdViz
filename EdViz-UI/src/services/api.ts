import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Basic SVG validation
const isValidSvg = (svgString: string): boolean => {
  // Check if it starts with an SVG tag
  if (!svgString.trim().toLowerCase().startsWith('<svg')) {
    return false;
  }
  
  // Check for common SVG attributes
  const hasViewBox = svgString.includes('viewBox');
  const hasXmlns = svgString.includes('xmlns');
  
  return hasViewBox && hasXmlns;
};

interface UploadResponse {
  message: string;
  file_id: string;
  graph_json: any;
  svg_content: string;
}

export type GraphType = 'mermaid' | 'force';

export const uploadPdf = async (file: File, graphType: GraphType = 'mermaid'): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('graph_type', graphType);

  try {
    console.log('Attempting to upload PDF to:', `${API_URL}/upload-pdf`);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      graphType
    });

    const response = await api.post<UploadResponse>('/upload-pdf', formData);
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        throw new Error(error.response.data?.message || `Failed to upload PDF: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        throw new Error(`Failed to upload PDF: ${error.message}`);
      }
    }
    throw error;
  }
};

// Commented out as we now get SVG content directly from upload response
// export const getSvg = async (fileId: string) => {
//   try {
//     console.log('Attempting to fetch SVG from:', `${API_URL}/get-svg/${fileId}`);
//     const response = await api.get(`/get-svg/${fileId}`);
//     const svgData = response.data;
//     
//     if (!isValidSvg(svgData)) {
//       console.error('Invalid SVG data received:', svgData);
//       throw new Error('Invalid SVG data received from server');
//     }
//     
//     return svgData;
//   } catch (error) {
//     console.error('SVG fetch error:', error);
//     if (axios.isAxiosError(error)) {
//       throw new Error(error.response?.data?.message || 'Failed to retrieve SVG');
//     }
//     throw error;
//   }
// }; 

export const renderGraph = async (graphJson: any): Promise<string> => {
  try {
    const response = await api.post<{ svg_content: string }>('/render-graph', {
      graph_json: graphJson,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.svg_content;
  } catch (error) {
    console.error('Render graph error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to render graph');
    }
    throw error;
  }
}; 