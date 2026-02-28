import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import { ToastContainer } from './components/shared';
import Landing from './pages/Landing';
import ChatHub from './pages/ChatHub';
import BrainSpace from './pages/BrainSpace';
import TalentArena from './pages/TalentArena';
import CreatorCorner from './pages/CreatorCorner';
import PlacementDojo from './pages/PlacementDojo';
import './styles/main.css';

const ProtectedRoute = ({ children }) => {
  const { nickname } = useApp();
  return nickname ? children : <Navigate to="/" replace />;
};

const AppShell = () => {
  const { nickname } = useApp();
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  return (
    <div className="app-layout">
      {nickname && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Chat Hub — full height, zero padding wrapper */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <div style={{
              marginTop: 'var(--nav-h)',
              height: 'calc(100vh - var(--nav-h))',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <ChatHub />
            </div>
          </ProtectedRoute>
        } />

        {/* All other pages — standard padded layout */}
        <Route path="/brainstorm" element={
          <ProtectedRoute>
            <main className="page-content">
              <BrainSpace />
            </main>
          </ProtectedRoute>
        } />
        <Route path="/talent" element={
          <ProtectedRoute>
            <main className="page-content">
              <TalentArena />
            </main>
          </ProtectedRoute>
        } />
        <Route path="/creator" element={
          <ProtectedRoute>
            <main className="page-content">
              <CreatorCorner />
            </main>
          </ProtectedRoute>
        } />
        <Route path="/placement" element={
          <ProtectedRoute>
            <main className="page-content">
              <PlacementDojo />
            </main>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
    </div>
  );
};

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </AppProvider>
);

export default App;
