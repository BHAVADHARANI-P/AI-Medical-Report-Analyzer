import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import { MessageCircle } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <Router>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Auth setToken={setToken} setUser={setUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={
              token ? (
                <Dashboard token={token} user={user} setToken={setToken} setUser={setUser} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>

        {/* Global Chatbot Bubble (only visible when logged in) */}
        {token && (
          <>
            {!isChatOpen && (
              <button 
                onClick={() => setIsChatOpen(true)}
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  right: '2rem',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '4rem',
                  height: '4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.5)',
                  zIndex: 90,
                  transition: 'transform 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <MessageCircle size={32} />
              </button>
            )}
            <Chatbot token={token} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
