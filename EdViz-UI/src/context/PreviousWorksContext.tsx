import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';

// Add debug logging utility
const DEBUG = process.env.NODE_ENV === 'development';
const logDebug = (...args: any[]) => {
  if (DEBUG) {
    console.log('[PreviousWorksContext]', ...args);
  }
};

// Define types
export interface PreviousWork {
  id: string;
  fileName: string;
  svgData: string;
  date: Date;
}

export interface GraphSearchResult {
  id: string;
  title: string;
  summary_text: string;
  created_at: string;
  description?: string;
  graph_data: {
    svg_content: string;
    [key: string]: any;
  };
}

export interface PreviousWorksContextType {
  works: PreviousWork[];
  searchResults: GraphSearchResult[];
  isLoading: boolean;
  error: string | null;
  addWork: (svgData: string, fileName: string) => void;
  search: (query: string) => void;
  isSearching: boolean;
  refreshPreviousWorks: () => Promise<void>;
  hasInitialLoad: boolean;
}

// Create and export the context
export const PreviousWorksContext = createContext<PreviousWorksContextType | undefined>(undefined);

// Export the hook
export const usePreviousWorks = () => {
  const context = useContext(PreviousWorksContext);
  if (!context) {
    throw new Error('usePreviousWorks must be used within a PreviousWorksProvider');
  }
  return context;
};

// Export the provider component
export interface PreviousWorksProviderProps {
  children: ReactNode;
}

export const PreviousWorksProvider: React.FC<PreviousWorksProviderProps> = ({ children }) => {
  const [works, setWorks] = useState<PreviousWork[]>([]);
  const [searchResults, setSearchResults] = useState<GraphSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // Track if initial load completed

  const fetchLatestGraphs = useCallback(async () => {
    // Only set loading if we haven't done initial load
    if (!hasInitialLoad) {
      setIsLoading(true);
    }
    setError(null);

    try {
      logDebug('Fetching latest graphs...');
      const response = await axios.get<GraphSearchResult[]>(
        `${process.env.REACT_APP_API_URL}/graphs`,
        {
          params: {
            limit: 20
          }
        }
      );
      logDebug('Fetched graphs:', response.data.length);
      setSearchResults(response.data);
      setHasInitialLoad(true);
    } catch (err) {
      logDebug('Error fetching graphs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching graphs');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [hasInitialLoad]);

  const refreshPreviousWorks = useCallback(async () => {
    await fetchLatestGraphs();
  }, [fetchLatestGraphs]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      fetchLatestGraphs();
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSearching(true);

    try {
      const response = await axios.get<GraphSearchResult[]>(
        `${process.env.REACT_APP_API_URL}/graphs/search`,
        {
          params: {
            q: query,
            limit: 20
          }
        }
      );
      setSearchResults(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLatestGraphs]);

  const addWork = (svgData: string, fileName: string) => {
    const newWork: PreviousWork = {
      id: Date.now().toString(),
      fileName,
      svgData,
      date: new Date(),
    };
    setWorks(prev => [newWork, ...prev]);
  };

  // Fetch latest graphs when the provider mounts
  useEffect(() => {
    logDebug('Provider mounted, fetching initial data...');
    fetchLatestGraphs();
  }, [fetchLatestGraphs]);

  const value = {
    works,
    searchResults,
    isLoading: isLoading && !hasInitialLoad, // Only show loading on initial load
    error,
    addWork,
    search,
    isSearching,
    refreshPreviousWorks,
    hasInitialLoad // Expose this for debugging
  };

  logDebug('Context state:', { 
    isLoading: value.isLoading, 
    hasInitialLoad, 
    resultsCount: searchResults.length 
  });

  return (
    <PreviousWorksContext.Provider value={value}>
      {children}
    </PreviousWorksContext.Provider>
  );
};

// Ensure this file is treated as a module
export default PreviousWorksProvider; 