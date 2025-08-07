import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GraphType } from '../services/api';

interface HomeState {
  svgData: string | null;
  graphData: any | null;
  fileName: string;
  graphType: GraphType;
  isUploading: boolean;
  uploadMessage: { text: string; type: 'error' | 'success' } | null;
  isSuccess: boolean;
}

type HomeAction =
  | { type: 'SET_UPLOAD_START'; payload: { fileName: string } }
  | { type: 'SET_UPLOAD_SUCCESS'; payload: { svgData: string; graphData: any; fileName: string; message: string } }
  | { type: 'SET_UPLOAD_ERROR'; payload: { message: string } }
  | { type: 'SET_GRAPH_TYPE'; payload: GraphType }
  | { type: 'UPDATE_SVG_DATA'; payload: string }
  | { type: 'RESET_STATE' };

const initialState: HomeState = {
  svgData: null,
  graphData: null,
  fileName: '',
  graphType: 'mermaid',
  isUploading: false,
  uploadMessage: null,
  isSuccess: false,
};

const homeReducer = (state: HomeState, action: HomeAction): HomeState => {
  switch (action.type) {
    case 'SET_UPLOAD_START':
      return {
        ...state,
        isUploading: true,
        uploadMessage: null,
        isSuccess: false,
        fileName: action.payload.fileName,
      };
    case 'SET_UPLOAD_SUCCESS':
      return {
        ...state,
        isUploading: false,
        svgData: action.payload.svgData,
        graphData: action.payload.graphData,
        fileName: action.payload.fileName,
        uploadMessage: { text: action.payload.message, type: 'success' },
        isSuccess: true,
      };
    case 'SET_UPLOAD_ERROR':
      return {
        ...state,
        isUploading: false,
        uploadMessage: { text: action.payload.message, type: 'error' },
        isSuccess: false,
      };
    case 'SET_GRAPH_TYPE':
      return {
        ...state,
        graphType: action.payload,
      };
    case 'UPDATE_SVG_DATA':
      return {
        ...state,
        svgData: action.payload,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

interface HomeContextType {
  state: HomeState;
  dispatch: React.Dispatch<HomeAction>;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const HomeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(homeReducer, initialState);

  return (
    <HomeContext.Provider value={{ state, dispatch }}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
}; 