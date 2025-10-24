import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './styles/index.css';

function App() {
  const [darkModeState, setDarkModeState] = useState(false);

  useEffect(() => {
    // Check system preference and saved preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedPreference = localStorage.getItem('darkMode');
    
    if (savedPreference !== null) {
      setDarkModeState(savedPreference === 'true');
    } else {
      setDarkModeState(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkModeState) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Save preference
    localStorage.setItem('darkMode', darkModeState.toString());
  }, [darkModeState]);

  return (
    <div className="App">
      <Dashboard darkMode={darkModeState} setDarkMode={setDarkModeState} />
    </div>
  );
}

export default App;