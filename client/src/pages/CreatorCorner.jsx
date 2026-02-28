import { useState } from 'react';
import { SectionHeader, Loader } from '../components/shared';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const MOODS = ['Stressed 😰', 'Motivated 💪', 'Heartbroken 💔', 'Bored 😐', 'Hyped 🔥', 'Confused 😵', 'Grateful 🙏', 'Lonely 😔'];

const CreatorCorner = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('poster');

  // Poster state
  const [posterForm, setPosterForm] = useState({ festName: '', theme: '', colors: '' });
  const [posterResult, setPosterResult] = useState(null);
  const [posterLoading, setPosterLoading] = useState(false);

  // Quote state
  const [mood, setMood] = useState('');
  const [quoteResult, setQuoteResult] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Roast state
  const [resumeText, setResumeText] = useState('');
  const [roastResult, setRoastResult] = useState('');
  const [roastLoading, setRoastLoading] = useState(false);

  const handlePoster = async () => {
    if (!posterForm.festName || !posterForm.theme) { addToast('Fill fest name & theme!', 'error'); return; }
    setPosterLoading(true);
    setPosterResult(null);
    try {
      const { data } = await api.post('/api/creator/poster-prompt', posterForm);
      setPosterResult(data);
      addToast('Poster generated! 🎨');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setPosterLoading(false); }
  };

  const handleQuote = async (selectedMood) => {
    const m = selectedMood || mood;
    if (!m) { addToast('Pick a mood first!', 'error'); return; }
    setQuoteLoading(true);
    setQuoteResult(null);
    try {
      const { data } = await api.post('/api/creator/quote', { mood: m });
      setQuoteResult(data);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setQuoteLoading(false); }
  };

  const handleRoast = async () => {
    if (resumeText.trim().length < 50) { addToast('Paste your full resume text!', 'error'); return; }
    setRoastLoading(true);
    setRoastResult('');
    try {
      const { data } = await api.post('/api/creator/roast', { resumeText });
      setRoastResult(data.roast);
      addToast('Roasted! 🔥😂');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setRoastLoading(false); }
  };

  return (
    <div>
      <SectionHeader emoji="🎨" title="CreatorCorner" subtitle="AI-powered creative tools for every college moment" />

      {/* Tabs */}
      <div className="tool-tabs" style={{ justifyContent: 'center', display: 'flex', gap: '0.25rem', maxWidth: 700, margin: '0 auto 1.5rem' }}>
        {[['poster', '🖼️ Poster Maker'], ['quote', '💬 Quote Card'], ['roast', '🔥 Resume Roast']].map(([id, label]) => (
          <button key={id} className={`tool-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* ── POSTER MAKER ─────────────────────────────── */}
        {activeTab === 'poster' && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>🖼️ AI Fest Poster Generator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Describe your fest — AI generates a prompt → Pollinations.ai renders the image. Zero cost, zero API key!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <input className="input-field" placeholder="Fest Name (e.g. Techzilla 2025 🚀)" value={posterForm.festName} onChange={e => setPosterForm(f => ({ ...f, festName: e.target.value }))} />
              <input className="input-field" placeholder="Theme (e.g. Cyberpunk, Space, Nature, Retro)" value={posterForm.theme} onChange={e => setPosterForm(f => ({ ...f, theme: e.target.value }))} />
              <input className="input-field" placeholder="Colors (e.g. neon purple and gold)" value={posterForm.colors} onChange={e => setPosterForm(f => ({ ...f, colors: e.target.value }))} />
            </div>

            <button className="btn btn-primary" onClick={handlePoster} disabled={posterLoading} style={{ width: '100%' }}>
              {posterLoading ? '⏳ Generating...' : '🎨 Generate Poster'}
            </button>

            {posterLoading && <Loader text="AI is painting your poster... 🖌️" />}

            {posterResult && (
              <div className="poster-result fade-in">
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  🤖 Prompt: {posterResult.imagePrompt}
                </div>
                <img
                  src={posterResult.imageUrl}
                  alt="AI Generated Poster"
                  onLoad={() => addToast('Poster loaded! Right-click to save 🖼️')}
                  style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginTop: '1rem' }}
                />
                <a href={posterResult.imageUrl} download target="_blank" rel="noreferrer">
                  <button className="btn btn-amber" style={{ width: '100%', marginTop: '0.75rem' }}>⬇️ Save Poster</button>
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── QUOTE CARD ───────────────────────────────── */}
        {activeTab === 'quote' && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>💬 Vibe Quote Generator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Tell us how you feel → get a quote written just for you + a Spotify playlist vibe 🎵
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {MOODS.map(m => (
                <button key={m} className="chip" style={mood === m ? { borderColor: 'var(--amber)', color: 'var(--amber)' } : {}}
                  onClick={() => { setMood(m); handleQuote(m); }}>
                  {m}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="input-field" placeholder="Or type your own mood..." value={mood} onChange={e => setMood(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuote()} />
              <button className="btn btn-primary" onClick={() => handleQuote()} disabled={quoteLoading || !mood}>
                {quoteLoading ? '⏳' : '✨'}
              </button>
            </div>

            {quoteLoading && <Loader text="AI is channeling your energy... ✨" />}

            {quoteResult && (
              <div className="quote-result fade-in">
                <div className="quote-text">"{quoteResult.quote}"</div>
                <div className="quote-author">— {quoteResult.author}</div>
                <div className="quote-meta">
                  <span>🎵 {quoteResult.playlist}</span>
                  <span>⚡ {quoteResult.action}</span>
                </div>
                <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => navigator.clipboard.writeText(`"${quoteResult.quote}" — ${quoteResult.author}`).then(() => addToast('Quote copied! 📋'))}>
                  📋 Copy Quote
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── RESUME ROAST ─────────────────────────────── */}
        {activeTab === 'roast' && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>🔥 Resume Roaster</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Paste your resume → AI roasts it like a savage senior who actually wants you to succeed 😂
            </p>

            <textarea
              className="input-field"
              style={{ minHeight: 200, marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.82rem' }}
              placeholder={`Paste your resume text here...\n\nExample:\nJohn Doe\njohndoe@gmail.com\nSkills: MS Word, Powerpoint, Teamwork...\nProjects: Made a website for school assignment...`}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />

            <button className="btn" style={{ width: '100%', background: 'linear-gradient(135deg, #EF4444, #F97316)', color: 'white' }}
              onClick={handleRoast} disabled={roastLoading || resumeText.trim().length < 50}>
              {roastLoading ? '⏳ Preparing the roast...' : '🔥 Roast My Resume!'}
            </button>

            {roastLoading && <Loader text="AI is sharpening its claws... 😈" />}

            {roastResult && (
              <div className="fade-in" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.8 }}>
                {roastResult}
                <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => setActiveTab('poster')}>
                  ✅ Okay okay, what else can I do?
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorCorner;
