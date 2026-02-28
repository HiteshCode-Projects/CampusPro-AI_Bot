import { useApp } from '../../context/AppContext';

// ─── Loader ──────────────────────────────────────────
export const Loader = ({ text = 'Thinking...' }) => (
  <div className="loader">
    <div className="spinner" />
    <span>{text}</span>
  </div>
);

// ─── Toast Container ─────────────────────────────────
export const ToastContainer = () => {
  const { toasts } = useApp();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? '✅' : '❌'} {t.message}
        </div>
      ))}
    </div>
  );
};

// ─── Section Header ───────────────────────────────────
export const SectionHeader = ({ emoji, title, subtitle }) => (
  <div className="section-header fade-in">
    <span className="emoji">{emoji}</span>
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
  </div>
);

// ─── Typing Indicator ────────────────────────────────
export const TypingIndicator = () => (
  <div className="bubble-row">
    <div className="avatar avatar-bot">🤖</div>
    <div className="typing-indicator">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
        CampusBot is thinking...
      </span>
    </div>
  </div>
);
