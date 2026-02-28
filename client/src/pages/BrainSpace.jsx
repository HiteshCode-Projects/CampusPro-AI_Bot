import { useState, useEffect } from 'react';
import { SectionHeader, Loader } from '../components/shared';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const EXAMPLE_IDEAS = [
  'An app to track hostel food quality and rate meals 🍱',
  'A carpooling system for college students going home on weekends 🚗',
  'A platform to rent textbooks between students 📚',
  'College fest ticket booking with QR check-in system 🎟️',
];

const MindMap = ({ idea, sections }) => (
  <div className="mindmap fade-in">
    <div className="mindmap-center">💡 {idea.slice(0, 40)}{idea.length > 40 ? '...' : ''}</div>
    <div className="mindmap-branches">
      {sections.map((s, i) => (
        <div key={i} className="mindmap-node" style={{ animationDelay: `${i * 0.08}s` }}>
          {s}
        </div>
      ))}
    </div>
  </div>
);

const BrainSpace = () => {
  const { nickname, addToast } = useApp();
  const [idea, setIdea] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [vault, setVault] = useState([]);
  const [showVault, setShowVault] = useState(false);
  const [currentIdeaId, setCurrentIdeaId] = useState(null);

  useEffect(() => {
    if (showVault) loadVault();
  }, [showVault]);

  const loadVault = async () => {
    try {
      const { data } = await api.get(`/api/brainstorm/vault/${nickname}`);
      setVault(data.ideas);
    } catch (err) { console.error(err); }
  };

  const handleBrainstorm = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setOutput('');
    try {
      const { data } = await api.post('/api/brainstorm', { nickname, idea });
      setOutput(data.output);
      setCurrentIdeaId(data.ideaId);
      addToast('Idea expanded! 🧠✨');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Extract mind map bullet points from AI output
  const extractSections = (text) => {
    const lines = text.split('\n').filter(l => l.trim() && l.includes('✅') || l.match(/^[•\-\*]\s/) || l.match(/^\d+\./));
    return lines.slice(0, 8).map(l => l.replace(/^[•\-\*\d\.]\s*/, '').trim()).filter(Boolean);
  };

  return (
    <div>
      <SectionHeader
        emoji="🧠"
        title="BrainSpace"
        subtitle="Drop your roughest idea. AI turns it into a full action plan."
      />

      <div style={{ maxWidth: 750, margin: '0 auto' }}>
        {/* Idea Input */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            💡 What's your idea? (rough is fine!)
          </label>
          <textarea
            className="input-field"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="e.g. I want to create an app for college students to find study partners..."
            style={{ minHeight: 100, marginBottom: '1rem' }}
          />

          {/* Example chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {EXAMPLE_IDEAS.map((ex, i) => (
              <button key={i} className="chip" onClick={() => setIdea(ex)}>{ex.slice(0, 35)}...</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleBrainstorm} disabled={loading || !idea.trim()}>
              {loading ? '⏳ Expanding...' : '✨ Expand My Idea'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowVault(!showVault)}>
              🗄️ My Vault ({vault.length})
            </button>
          </div>
        </div>

        {loading && <Loader text="AI is building your plan... ☕" />}

        {/* AI Output */}
        {output && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Full Output */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>📋 Your Full Plan</h3>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text)' }}>
                {output}
              </div>
            </div>

            {/* Mind Map */}
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '1rem' }}>🗺️ Mind Map</h3>
              <MindMap idea={idea} sections={extractSections(output)} />
            </div>

            {/* Actions */}
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', fontSize: '1rem' }}>🚀 What now?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your idea has been saved to your vault automatically.</p>
                <button className="btn btn-amber" style={{ width: '100%' }} onClick={() => { setIdea(''); setOutput(''); }}>
                  💡 New Idea
                </button>
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigator.clipboard.writeText(output).then(() => addToast('Copied to clipboard! 📋'))}>
                  📋 Copy Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vault */}
        {showVault && (
          <div className="card fade-in" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>🗄️ Idea Vault</h3>
            {vault.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No saved ideas yet. Start brainstorming! 💡</p>
              : vault.map(v => (
                <div key={v._id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => { setIdea(v.rawIdea); setOutput(v.aiOutput); setShowVault(false); }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{v.rawIdea.slice(0, 80)}...</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(v.savedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default BrainSpace;
