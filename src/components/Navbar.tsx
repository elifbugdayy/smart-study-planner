import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type Theme = {
  accent: string;
  background: string;
  panel: string;
};

type Props = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  presets: Record<string, Theme>;
};

const Navbar: React.FC<Props> = ({ theme, onThemeChange, presets }: Props) => {
  const location = useLocation();

  const presetButtons = (Object.entries(presets) as Array<[string, Theme]>).map(([key, value]) => (
    <button
      key={key}
      type="button"
      className="preset-chip"
      onClick={() => onThemeChange(value)}
    >
      <span className="dot" style={{ background: value.accent }} />
      {key}
    </button>
  ));

  return (
    <header className="nav-neo">
      <Link to="/" className="brand">
        <span className="emoji">🤖</span> Smart Study Co-Pilot
      </Link>

      <div className="nav-right">
        <div className="badge-ai">
          AI mock
          <span className="ping" />
        </div>
        <div className="theme-controls">
          <label className="color-picker">
            Accent
            <input
              type="color"
              aria-label="Accent color"
              value={theme.accent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onThemeChange({ ...theme, accent: e.target.value })
              }
            />
          </label>
          <label className="color-picker">
            Background
            <input
              type="color"
              aria-label="Background color"
              value={theme.background}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onThemeChange({ ...theme, background: e.target.value })
              }
            />
          </label>
          <label className="color-picker">
            Panel
            <input
              type="color"
              aria-label="Panel color"
              value={theme.panel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onThemeChange({ ...theme, panel: e.target.value })
              }
            />
          </label>
          <div className="preset-row">{presetButtons}</div>
        </div>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Create plan
          </Link>
          <Link to="/plan" className={location.pathname === '/plan' ? 'active' : ''}>
            View plan
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
