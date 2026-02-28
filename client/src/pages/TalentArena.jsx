import { useState, useEffect } from 'react';
import { SectionHeader, Loader } from '../components/shared';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const CATEGORIES = [
  { id: 'poetry',      emoji: '🎤', label: 'Poetry' },
  { id: 'project',     emoji: '💻', label: 'Project' },
  { id: 'art',         emoji: '🎨', label: 'Artwork' },
  { id: 'music',       emoji: '🎵', label: 'Music' },
  { id: 'photography', emoji: '📸', label: 'Photo' },
  { id: 'meme',        emoji: '😂', label: 'Meme' },
  { id: 'writing',     emoji: '✍️', label: 'Writing' },
];

const ScoreBar = ({ label, score }) => (
  <div className="score-bar-row">
    <span className="score-label">{label}</span>
    <div className="score-track">
      <div className="score-fill" style={{ width: `${score * 10}%` }} />
    </div>
    <span className="score-num">{score}/10</span>
  </div>
);

const TalentCard = ({ talent, onVote }) => {
  const cat = CATEGORIES.find(c => c.id === talent.category);
  const totalVotes = (talent.votes?.fire || 0) + (talent.votes?.heart || 0) + (talent.votes?.mindblown || 0);

  return (
    <div className="talent-card fade-in">
      <div className="talent-card-header">
        <div>
          <span className={`talent-category cat-${talent.category}`}>
            {cat?.emoji} {cat?.label}
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginTop: '0.4rem' }}>
            {talent.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            by @{talent.nickname}
          </div>
        </div>
        <div className="talent-score">{talent.scores?.overall}/10</div>
      </div>

      <div className="talent-content">{talent.content}</div>

      {talent.badge && (
        <div style={{ fontSize: '0.78rem', color: 'var(--violet-light)', marginBottom: '0.75rem', padding: '0.3rem 0.7rem', background: 'rgba(124,58,237,0.1)', borderRadius: 20, display: 'inline-block' }}>
          🏆 {talent.badge}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="vote-bar">
          {[['fire', '🔥'], ['heart', '❤️'], ['mindblown', '🤯']].map(([type, emoji]) => (
            <button key={type} className="vote-btn" onClick={() => onVote(talent._id, type)}>
              {emoji} {talent.votes?.[type] || 0}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{totalVotes} reactions</span>
      </div>
    </div>
  );
};

const TalentArena = () => {
  const { nickname, addToast } = useApp();
  const [view, setView] = useState('feed'); // 'feed' | 'submit' | 'feedback'
  const [talents, setTalents] = useState([]);
  const [filterCat, setFilterCat] = useState('all');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);

  // Submit form state
  const [form, setForm] = useState({ category: '', title: '', content: '' });

  useEffect(() => { loadFeed(); }, [filterCat]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const params = filterCat !== 'all' ? `?category=${filterCat}` : '';
      const { data } = await api.get(`/api/talent/feed${params}`);
      setTalents(data.talents);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.category || !form.title || !form.content) {
      addToast('Fill in all fields! 📝', 'error'); return;
    }
    setSubmitLoading(true);
    try {
      const { data } = await api.post('/api/talent/submit', { nickname, ...form });
      setLatestFeedback(data.talent);
      setView('feedback');
      addToast('Talent submitted! AI scored it 🌟');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setSubmitLoading(false); }
  };

  const handleVote = async (id, emoji) => {
    try {
      const { data } = await api.put(`/api/talent/vote/${id}`, { emoji });
      setTalents(prev => prev.map(t => t._id === id ? { ...t, votes: data.votes } : t));
    } catch (err) { addToast(err.message, 'error'); }
  };

  return (
    <div>
      <SectionHeader emoji="🌟" title="TalentArena" subtitle="Show your skills. Get AI feedback. Let campus vote." />

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {[['feed', '🏆 Live Feed'], ['submit', '➕ Submit Talent']].map(([id, label]) => (
          <button key={id} className={`btn ${view === id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setView(id); if (id === 'feed') loadFeed(); }}>
            {label}
          </button>
        ))}
      </div>

      {/* FEED VIEW */}
      {view === 'feed' && (
        <div>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <button className={`chip ${filterCat === 'all' ? 'active' : ''}`} style={filterCat === 'all' ? { borderColor: 'var(--violet)', color: 'var(--violet-light)' } : {}} onClick={() => setFilterCat('all')}>
              🎯 All
            </button>
            {CATEGORIES.map(c => (
              <button key={c.id} className="chip" style={filterCat === c.id ? { borderColor: 'var(--violet)', color: 'var(--violet-light)' } : {}} onClick={() => setFilterCat(c.id)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {loading ? <Loader text="Loading talents..." /> : (
            <div className="talent-grid">
              {talents.length === 0
                ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    No talents yet. Be the first! 🌟
                  </div>
                : talents.map(t => <TalentCard key={t._id} talent={t} onVote={handleVote} />)
              }
            </div>
          )}
        </div>
      )}

      {/* SUBMIT VIEW */}
      {view === 'submit' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
              🎯 Share Your Talent
            </h3>

            {/* Category picker */}
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {CATEGORIES.map(c => (
                <button key={c.id} className={`mode-card ${form.category === c.id ? 'active' : ''}`}
                  style={{ textAlign: 'center', padding: '0.6rem' }}
                  onClick={() => setForm(f => ({ ...f, category: c.id }))}>
                  <span style={{ fontSize: '1.5rem' }}>{c.emoji}</span>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>{c.label}</div>
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Title</label>
              <input className="input-field" placeholder="Give your talent a catchy title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Your Work</label>
              <textarea className="input-field" style={{ minHeight: 160 }}
                placeholder="Paste your poem, project description, idea, lyrics, or any creative work here..."
                value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                AI will read this and give you a detailed score + feedback 🤖
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? '⏳ AI is judging...' : '🚀 Submit & Get AI Score'}
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK VIEW */}
      {view === 'feedback' && latestFeedback && (
        <div style={{ maxWidth: 650, margin: '0 auto' }} className="fade-in">
          <div className="score-card">
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--amber)' }}>
                {latestFeedback.scores?.overall}/10
              </div>
              {latestFeedback.badge && (
                <div style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(124,58,237,0.2)', borderRadius: 20, display: 'inline-block', fontSize: '0.88rem', color: 'var(--violet-light)' }}>
                  🏆 {latestFeedback.badge}
                </div>
              )}
            </div>

            <div className="score-bars">
              <ScoreBar label="Creativity" score={latestFeedback.scores?.creativity || 7} />
              <ScoreBar label="Originality" score={latestFeedback.scores?.originality || 7} />
              <ScoreBar label="Expression" score={latestFeedback.scores?.expression || 7} />
              <ScoreBar label="Overall Vibe" score={latestFeedback.scores?.overall || 7} />
            </div>

            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {latestFeedback.aiFeedback}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setView('feed'); loadFeed(); }}>
                See Live Feed 🏆
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setView('submit'); setForm({ category: '', title: '', content: '' }); }}>
                Submit Another ➕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentArena;
