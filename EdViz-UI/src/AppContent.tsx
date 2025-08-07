import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PreviousWorks from './pages/PreviousWorks';
import Contact from './pages/Contact';

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/previous-works" element={<PreviousWorks />} />
      <Route path="/contact" element={<Contact />} />      
    </Routes>
  );
};

export default AppContent; 