import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const FEATURES = ['💬 AI Chat Modes', '🧠 Idea Brainstormer', '🌟 Talent Arena', '🎨 Poster Maker', '💼 Mock Interviews', '🧩 DSA Practice', '📄 Resume Forge', '🔥 Resume Roaster'];

const Landing = () => {
  const [input, setInput] = useState('');
  const { saveNickname } = useApp();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!input.trim()) return;
    saveNickname(input.trim());
    navigate('/chat');
  };

  return (
    <div className="landing-screen">
      <span className="landing-logo">🎓</span>

      <h1 className="landing-title">
        Campus<span>Bot</span> Pro
      </h1>

      <p className="landing-sub">
        Your AI-powered college companion. Chat, brainstorm, showcase talent, prep for placements — all in one place.
      </p>

      <div className="landing-form">
        <input
          placeholder="Enter your nickname..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
          autoFocus
        />
        <button className="btn btn-primary" onClick={handleStart} disabled={!input.trim()}>
          Let's Go →
        </button>
      </div>

      <div className="features-preview">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-pill" style={{ animationDelay: `${i * 0.07}s` }}>
            {f}
          </div>
        ))}
      </div>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />
    </div>
  );
};

export default Landing;
