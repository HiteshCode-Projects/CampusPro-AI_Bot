import { useState, useRef, useEffect } from 'react';
import { TypingIndicator } from '../components/shared';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const MODES = [
  { id: 'fest',      emoji: '🎉', name: 'Fest Mode',      desc: 'Events & college fun',   color: '#F59E0B' },
  { id: 'placement', emoji: '💼', name: 'Placement',      desc: 'Job prep & careers',     color: '#06B6D4' },
  { id: 'study',     emoji: '📚', name: 'Study Mode',     desc: 'Doubts & academics',     color: '#10B981' },
  { id: 'rant',      emoji: '😤', name: 'Rant Mode',      desc: 'Vent & feel better',     color: '#EC4899' },
];

const QUICK_CHIPS = {
  fest:      ['When is the next fest? 🎊', 'Best events to join?', 'How to join organising committee?', 'Sponsorship ideas 💡'],
  placement: ['How to crack TCS NQT? 💼', 'Resume tips for freshers', 'Best DSA roadmap?', 'Mock interview tips 🎯'],
  study:     ['Calculate my CGPA 📊', 'Best study techniques?', 'Explain recursion simply', 'How to focus better? 🧠'],
  rant:      ['Canteen food is terrible 😭', 'Professor gave 0 internals!', "Exam tomorrow, haven't studied 😱", 'Hostel wifi is dead again'],
};

const ChatHub = () => {
  const { nickname } = useApp();
  const [mode, setMode]           = useState('study');
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(''); // 'listening' | 'done' | ''
  const chatEndRef  = useRef(null);
  const inputRef    = useRef(null);
  const recRef      = useRef(null);

  /* ── Welcome message on mode change ─────────────── */
  useEffect(() => {
    const welcomes = {
      fest:      `Hey ${nickname}! 🎉 I'm FestBot! Ask me anything about college fests, events, or how to make yours legendary!`,
      placement: `Welcome ${nickname}! 💼 I'm your placement mentor. Let's crack those interviews together. What do you need help with?`,
      study:     `Hi ${nickname}! 📚 I'm StudyBot. Any doubts, CGPA calculations, or concepts you're struggling with?`,
      rant:      `Yooo ${nickname} 😤 Rant Mode activated! What's bothering you today? I'm all ears (and maybe a few jokes 😂)`,
    };
    setMessages([{ role: 'assistant', content: welcomes[mode] }]);
    setSessionId(null);
  }, [mode, nickname]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── Send message ────────────────────────────────── */
  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/api/chat', { nickname, message: msg, mode, sessionId });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setSessionId(data.sessionId);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Oops! ${err.message}. Check if the server is running.` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── Voice with clear recording states ───────────── */
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input needs Chrome browser. Try Chrome!');
      return;
    }

    if (isRecording && recRef.current) {
      recRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    recRef.current = rec;

    rec.onstart = () => {
      setIsRecording(true);
      setVoiceStatus('listening');
    };

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setVoiceStatus('done');
    };

    rec.onerror = () => {
      setIsRecording(false);
      setVoiceStatus('');
    };

    rec.onend = () => {
      setIsRecording(false);
      setTimeout(() => setVoiceStatus(''), 2000);
    };

    rec.start();
  };

  const currentMode = MODES.find(m => m.id === mode);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - var(--nav-h))',
      padding: '0',
      maxWidth: 820,
      margin: '0 auto',
      width: '100%',
    }}>

      {/* ── Compact Mode Selector Bar ─────────────────── */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {/* Title inline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>💬</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Chat Hub</span>
        </div>

        {/* Mode pills — compact */}
        {MODES.map(m => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '50px',
                border: active ? `2px solid ${m.color}` : '2px solid var(--border)',
                background: active ? `${m.color}18` : 'var(--bg-input)',
                color: active ? m.color : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: active ? 700 : 400,
                fontFamily: 'var(--font-body)',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{m.emoji}</span>
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Chat Messages — takes all remaining height ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.25rem 1rem',
        background: 'var(--bg)',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '0.6rem',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              animation: 'bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0,
              background: msg.role === 'user' ? 'rgba(245,158,11,0.15)' : 'rgba(124,58,237,0.15)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.3)'}`,
            }}>
              {msg.role === 'user' ? '🧑' : '🤖'}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '72%',
              padding: '0.85rem 1.1rem',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: '0.97rem',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              whiteSpace: 'pre-wrap',
              background: msg.role === 'user'
                ? `linear-gradient(135deg, ${currentMode.color}CC, ${currentMode.color}99)`
                : 'var(--bg-elevated)',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              boxShadow: msg.role === 'user' ? `0 4px 15px ${currentMode.color}30` : 'none',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Chips ───────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        padding: '0.6rem 1rem',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {QUICK_CHIPS[mode].map((chip, i) => (
          <button
            key={i}
            onClick={() => sendMessage(chip)}
            style={{
              padding: '0.38rem 0.85rem',
              borderRadius: '50px',
              border: '1px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.target.style.borderColor = currentMode.color; e.target.style.color = currentMode.color; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── Voice Status Banner ───────────────────────── */}
      {voiceStatus && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          padding: '0.5rem 1rem',
          background: voiceStatus === 'listening'
            ? 'rgba(239,68,68,0.12)'
            : 'rgba(16,185,129,0.12)',
          borderTop: `1px solid ${voiceStatus === 'listening' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
          fontSize: '0.88rem',
          fontWeight: 500,
          color: voiceStatus === 'listening' ? '#EF4444' : '#10B981',
          flexShrink: 0,
        }}>
          {voiceStatus === 'listening' ? (
            <>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
              🎙️ Listening... Speak now! Tap mic to stop.
            </>
          ) : (
            <>✅ Got it! Your message is ready — hit send!</>
          )}
        </div>
      )}

      {/* ── Input Bar ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        flexShrink: 0,
      }}>

        {/* Voice Button */}
        <button
          onClick={toggleVoice}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
          style={{
            width: 44, height: 44,
            borderRadius: '50%',
            border: `2px solid ${isRecording ? '#EF4444' : 'var(--border)'}`,
            background: isRecording ? 'rgba(239,68,68,0.15)' : 'var(--bg-input)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
            flexShrink: 0,
            transition: 'all 0.2s',
            animation: isRecording ? 'voicePulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {isRecording ? '🔴' : '🎤'}
        </button>

        {/* Text input — grows with content */}
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            // Auto-grow
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKey}
          placeholder={`Message ${currentMode.name}... (Enter to send, Shift+Enter for new line)`}
          disabled={loading}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: `1.5px solid ${input.trim() ? currentMode.color + '60' : 'var(--border)'}`,
            borderRadius: 16,
            color: 'var(--text)',
            padding: '0.75rem 1.1rem',
            fontSize: '0.97rem',
            lineHeight: 1.5,
            fontFamily: 'var(--font-body)',
            resize: 'none',
            overflowY: 'hidden',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: input.trim() ? `0 0 0 3px ${currentMode.color}15` : 'none',
            outline: 'none',
            minHeight: 44,
            maxHeight: 120,
          }}
        />

        {/* Send Button */}
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 44, height: 44,
            borderRadius: '50%',
            border: 'none',
            background: (loading || !input.trim())
              ? 'var(--bg-input)'
              : `linear-gradient(135deg, var(--violet), var(--violet-light))`,
            color: (loading || !input.trim()) ? 'var(--text-subtle)' : '#fff',
            cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            flexShrink: 0,
            transition: 'all 0.2s',
            transform: (!loading && input.trim()) ? 'scale(1)' : 'scale(0.9)',
            boxShadow: (!loading && input.trim()) ? '0 4px 15px rgba(124,58,237,0.4)' : 'none',
          }}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>

      {/* Inline CSS for pulse animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
};

export default ChatHub;
