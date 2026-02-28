import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { path: '/chat',      emoji: '💬', label: 'Chat Hub' },
  { path: '/brainstorm',emoji: '🧠', label: 'BrainSpace' },
  { path: '/talent',    emoji: '🌟', label: 'TalentArena' },
  { path: '/creator',   emoji: '🎨', label: 'CreatorCorner' },
  { path: '/placement', emoji: '💼', label: 'PlacementDojo' },
];

const Navbar = () => {
  const { nickname, saveNickname } = useApp();

  const handleNicknameClick = () => {
    const newName = prompt('Change your nickname:', nickname);
    if (newName?.trim()) saveNickname(newName.trim());
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        🎓 Campus<span>Bot</span> Pro
      </NavLink>

      <ul className="navbar-tabs">
        {NAV_ITEMS.map(({ path, emoji, label }) => (
          <li key={path}>
            <NavLink to={path} className={({ isActive }) => isActive ? 'active' : ''}>
              {emoji} {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div
        className="nickname-badge"
        onClick={handleNicknameClick}
        title="Click to change nickname"
      >
        👤 {nickname || 'Set nickname'}
      </div>
    </nav>
  );
};

export default Navbar;
