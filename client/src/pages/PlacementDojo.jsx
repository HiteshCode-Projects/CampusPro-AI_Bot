import { useState, useRef, useEffect } from 'react';
import { SectionHeader, Loader, TypingIndicator } from '../components/shared';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const DSA_TOPICS = ['Arrays', 'Strings', 'LinkedList', 'Trees', 'Graphs', 'DP', 'Sorting', 'Binary Search', 'Stacks', 'Queues', 'Recursion', 'Hashing'];

const COMPANIES = [
  { id: 'TCS',      emoji: '💙', name: 'TCS' },
  { id: 'Infosys',  emoji: '🟣', name: 'Infosys' },
  { id: 'Amazon',   emoji: '🟠', name: 'Amazon' },
  { id: 'Google',   emoji: '🔴', name: 'Google' },
  { id: 'Startup',  emoji: '🚀', name: 'Startup' },
  { id: 'Wipro',    emoji: '🟡', name: 'Wipro' },
];

const ROUNDS = ['Technical', 'HR', 'Managerial'];

// ── DSA Arena ──────────────────────────────────────────────
const DSAArena = () => {
  const { addToast } = useApp();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [problem, setProblem] = useState('');
  const [approach, setApproach] = useState('');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  const generateProblem = async () => {
    if (!topic || !difficulty) { addToast('Pick a topic and difficulty!', 'error'); return; }
    setLoading(true); setProblem(''); setHint(''); setApproach('');
    try {
      const { data } = await api.post('/api/placement/dsa/problem', { topic, difficulty });
      setProblem(data.problem);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const getHint = async (level) => {
    if (!approach.trim()) { addToast('Write your approach first!', 'error'); return; }
    setHintLoading(true);
    try {
      const { data } = await api.post('/api/placement/dsa/hint', { problem, approach, hintLevel: level });
      setHint(data.hint);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setHintLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>🧩 Pick Your Challenge</h3>

        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Topic</label>
        <div className="topic-grid" style={{ marginBottom: '1rem' }}>
          {DSA_TOPICS.map(t => (
            <button key={t} className={`topic-btn ${topic === t ? 'selected' : ''}`} onClick={() => setTopic(t)}>{t}</button>
          ))}
        </div>

        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Difficulty</label>
        <div className="difficulty-row" style={{ marginBottom: '1.25rem' }}>
          {['Easy', 'Medium', 'Hard'].map(d => (
            <button key={d} className={`diff-btn ${d.toLowerCase()} ${difficulty === d ? 'selected' : ''}`} onClick={() => setDifficulty(d)}>
              {d === 'Easy' ? '🟢' : d === 'Medium' ? '🟡' : '🔴'} {d}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={generateProblem} disabled={loading}>
          {loading ? '⏳ Generating...' : '🎯 Generate Problem'}
        </button>
      </div>

      {loading && <Loader text="AI is crafting a problem for you... 🤔" />}

      {problem && (
        <div className="fade-in">
          <div className="problem-box">{problem}</div>

          <div className="card">
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              ✍️ Your Approach (explain in plain words, no code needed)
            </label>
            <textarea className="input-field" style={{ minHeight: 100, marginBottom: '1rem' }} placeholder="e.g. I'll use a sliding window to track the subarray sum and expand/shrink based on the target..." value={approach} onChange={e => setApproach(e.target.value)} />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => getHint(1)} disabled={hintLoading}>💡 Tiny Nudge</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => getHint(2)} disabled={hintLoading}>🧭 Direction</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => getHint(3)} disabled={hintLoading}>🗺️ Full Approach</button>
            </div>
          </div>

          {hintLoading && <Loader text="Mentor is thinking..." />}
          {hint && (
            <div className="card fade-in" style={{ borderColor: 'var(--amber)', background: 'rgba(245,158,11,0.05)' }}>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{hint}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Mock Interview ──────────────────────────────────────────
const MockInterview = () => {
  const { nickname, addToast } = useApp();
  const [company, setCompany] = useState('');
  const [round, setRound] = useState('');
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const startInterview = async () => {
    if (!company || !round) { addToast('Pick company and round!', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/placement/interview/start', { nickname, company, round });
      setSessionId(data.sessionId);
      setMessages([{ role: 'assistant', content: data.message }]);
      setStarted(true);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const sendAnswer = async () => {
    if (!answer.trim()) return;
    const ans = answer.trim();
    setAnswer('');
    setMessages(prev => [...prev, { role: 'user', content: ans }]);
    setLoading(true);
    try {
      const { data } = await api.post('/api/placement/interview/respond', { sessionId, answer: ans });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const endInterview = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/placement/interview/end', { sessionId });
      setFeedback(data.feedback);
      setEnded(true);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  if (!started) {
    return (
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>🎤 Setup Your Mock Interview</h3>

        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Select Company</label>
        <div className="company-grid" style={{ marginBottom: '1.25rem' }}>
          {COMPANIES.map(c => (
            <div key={c.id} className={`company-card ${company === c.id ? 'selected' : ''}`} onClick={() => setCompany(c.id)}>
              <span className="co-emoji">{c.emoji}</span>
              <span className="co-name">{c.name}</span>
            </div>
          ))}
        </div>

        <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Round Type</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {ROUNDS.map(r => (
            <button key={r} className={`btn ${round === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRound(r)}>{r}</button>
          ))}
        </div>

        {company && round && (
          <div style={{ padding: '0.75rem', background: 'rgba(124,58,237,0.1)', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--violet-light)' }}>
            🎯 Ready: {company} — {round} Round. AI will act as your {company} interviewer.
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={startInterview} disabled={loading || !company || !round}>
          {loading ? '⏳ Starting...' : '🚀 Start Interview'}
        </button>
      </div>
    );
  }

  if (ended && feedback) {
    return (
      <div className="card fade-in" style={{ borderColor: 'var(--green)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🏁</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginTop: '0.5rem' }}>Interview Complete!</h3>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.8, padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
          {feedback}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => { setStarted(false); setEnded(false); setMessages([]); setCompany(''); setRound(''); setFeedback(''); }}>
          🔄 Try Another Interview
        </button>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <div className="interview-header">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>🎤 {company} — {round} Round</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>You are: {nickname} | Answer each question naturally</div>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={endInterview} disabled={loading}>
          🏁 End & Get Feedback
        </button>
      </div>

      <div className="chat-window" style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`bubble-row ${msg.role === 'user' ? 'user' : ''}`}>
            <div className={`avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-bot'}`}>
              {msg.role === 'user' ? '🧑' : '👔'}
            </div>
            <div className={`bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>{msg.content}</div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      <div className="input-bar">
        <input className="input-field" style={{ borderRadius: 24, padding: '0.7rem 1.2rem' }} value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAnswer()} placeholder="Type your answer..." disabled={loading} />
        <button className="send-btn" onClick={sendAnswer} disabled={loading || !answer.trim()}>➤</button>
      </div>
    </div>
  );
};

// ── Resume Forge ────────────────────────────────────────────
const ResumeForge = () => {
  const { nickname, addToast } = useApp();
  const [form, setForm] = useState({ name: nickname, email: '', phone: '', college: '', degree: 'B.Tech', branch: '', gradYear: '2025', cgpa: '', skills: '', projects: '', internships: '', achievements: '', certifications: '', targetRole: '' });
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleForge = async () => {
    if (!form.name || !form.skills || !form.projects) { addToast('Fill name, skills, and projects at minimum!', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/placement/resume/forge', { formData: form });
      setResume(data.resume);
      addToast('Resume forged! 📄✨');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>📄 Resume Forge</h3>
        <div className="forge-grid">
          {[['name', 'Full Name *'], ['email', 'Email *'], ['phone', 'Phone'], ['college', 'College Name *'], ['degree', 'Degree'], ['branch', 'Branch *'], ['gradYear', 'Graduation Year'], ['cgpa', 'CGPA'], ['targetRole', 'Target Role *']].map(([field, label]) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input className="input-field" value={form[field]} onChange={e => update(field, e.target.value)} placeholder={label.replace(' *', '')} />
            </div>
          ))}
          {[['skills', 'Technical Skills * (comma separated)', true], ['projects', 'Projects * (describe each briefly)', true], ['internships', 'Internships / Experience', true], ['achievements', 'Achievements & Awards', true], ['certifications', 'Certifications', false]].map(([field, label, tall]) => (
            <div key={field} className="form-group full">
              <label className="form-label">{label}</label>
              <textarea className="input-field" style={{ minHeight: tall ? 90 : 70 }} value={form[field]} onChange={e => update(field, e.target.value)} placeholder={label.replace(' *', '').replace(' (comma separated)', '').replace(' (describe each briefly)', '')} />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleForge} disabled={loading}>
          {loading ? '⏳ Forging your resume...' : '⚡ Forge My Resume'}
        </button>
      </div>

      {loading && <Loader text="AI is crafting your ATS-friendly resume... 📝" />}

      {resume && (
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)' }}>✅ Your Resume</h3>
            <button className="btn btn-amber" onClick={() => navigator.clipboard.writeText(resume).then(() => addToast('Copied! 📋'))}>Copy</button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.83rem', lineHeight: 1.8, fontFamily: 'monospace', background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius)', overflowX: 'auto' }}>
            {resume}
          </pre>
        </div>
      )}
    </div>
  );
};

// ── Main PlacementDojo Page ──────────────────────────────────
const PlacementDojo = () => {
  const [activeSection, setActiveSection] = useState('dsa');

  const SECTIONS = [
    { id: 'dsa',       emoji: '🧩', label: 'DSA Arena' },
    { id: 'interview', emoji: '🎤', label: 'Mock Interview' },
    { id: 'resume',    emoji: '📄', label: 'Resume Forge' },
  ];

  return (
    <div>
      <SectionHeader emoji="💼" title="PlacementDojo" subtitle="Everything you need to crack placements. No BS. Just prep." />

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {SECTIONS.map(s => (
          <button key={s.id} className={`btn ${activeSection === s.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSection(s.id)}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'dsa'       && <DSAArena />}
      {activeSection === 'interview' && <MockInterview />}
      {activeSection === 'resume'    && <ResumeForge />}
    </div>
  );
};

export default PlacementDojo;
