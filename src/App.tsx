import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import StudyPlanForm from './components/StudyPlanForm';
import StudyPlanView from './components/StudyPlanView';

import './App.css';

export type Theme = {
  accent: string;
  background: string;
  panel: string;
};

const presetThemes: Record<string, Theme> = {
  neon: { accent: '#ff7ac3', background: '#0b1224', panel: '#0f172a' },
  sunrise: { accent: '#ffb347', background: '#1f0a2f', panel: '#2b1440' },
  mint: { accent: '#38f2af', background: '#0f2d2f', panel: '#0e1f24' },
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(presetThemes.neon);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--bg', theme.background);
    root.style.setProperty('--panel', theme.panel);
  }, [theme]);

  return (
    <Router>
      <div className="app-shell">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <Navbar
          theme={theme}
          onThemeChange={setTheme}
          presets={presetThemes}
        />
        <div className="container app-container">
          <Routes>
            <Route path="/" element={<StudyPlanForm />} />
            <Route path="/plan" element={<StudyPlanView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
