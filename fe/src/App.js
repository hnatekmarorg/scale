import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './styles/index.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference and saved preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedPreference = localStorage.getItem('darkMode');
    
    if (savedPreference !== null) {
      setDarkMode(savedPreference === 'true');
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Save preference
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <div className="App">
      <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}

export default App;