import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, X } from 'lucide-react';

function Chatbot({ token, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Hello! I am your MedSENSE AI assistant. How can I help you today? Please remember I am an AI and you should consult a doctor for serious concerns.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat',
        { message: userMsg.content, history: messages.slice(1) }, // exclude initial greeting from history if needed, or keep it
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { role: 'model', content: response.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={chatContainerStyle}>
      <div style={chatHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={20} />
          <h3 style={{ margin: 0 }}>MedSENSE Assistant</h3>
        </div>
        <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>

      <div style={chatMessagesStyle}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div style={{
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              padding: '0.8rem 1rem',
              borderRadius: '1rem',
              maxWidth: '75%',
              borderTopRightRadius: msg.role === 'user' ? '0' : '1rem',
              borderTopLeftRadius: msg.role === 'model' ? '0' : '1rem',
            }}>
              <ReactMarkdown components={{
                p: ({node, ...props}) => <p style={{margin:0}} {...props} />,
                a: ({node, ...props}) => <a style={{color: 'var(--accent)'}} {...props} />
              }}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
               <Bot size={16} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '1rem', borderTopLeftRadius: 0 }}>
              <div className="loader" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={chatInputAreaStyle}>
        <input
          type="text"
          placeholder="Ask a medical question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={chatInputStyle}
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading} style={sendButtonStyle}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

const chatContainerStyle = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  width: '350px',
  height: '500px',
  background: 'var(--bg-card)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '1rem',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  zIndex: 100,
  animation: 'slideUp 0.3s ease-out',
  overflow: 'hidden'
};

const chatHeaderStyle = {
  padding: '1rem',
  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'white',
  borderTopLeftRadius: '1rem',
  borderTopRightRadius: '1rem'
};

const chatMessagesStyle = {
  flex: 1,
  padding: '1rem',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
};

const chatInputAreaStyle = {
  padding: '1rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  gap: '0.5rem'
};

const chatInputStyle = {
  flex: 1,
  padding: '0.8rem',
  borderRadius: '2rem',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: 'rgba(255, 255, 255, 0.05)',
  color: 'white',
  outline: 'none',
  fontFamily: 'inherit'
};

const sendButtonStyle = {
  background: 'var(--accent)',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '3rem',
  height: '3rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s',
};

export default Chatbot;
