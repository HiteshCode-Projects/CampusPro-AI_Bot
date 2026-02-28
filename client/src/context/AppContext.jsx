import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [nickname, setNickname] = useState(() => localStorage.getItem('cb_nickname') || '');
  const [toasts, setToasts] = useState([]);

  const saveNickname = (name) => {
    localStorage.setItem('cb_nickname', name);
    setNickname(name);
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  return (
    <AppContext.Provider value={{ nickname, saveNickname, toasts, addToast }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
