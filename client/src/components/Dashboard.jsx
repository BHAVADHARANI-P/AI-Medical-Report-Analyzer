import React, { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { UploadCloud, File, Activity, Mail, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ token, user, setToken, setUser }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('report', file);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data.success) {
        setResult(response.data);
        showToast('Analysis complete! Email sent to destination.');
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      showToast(
        error.response?.data?.error || 'Failed to analyze report. Please check server logs.', 
        'error'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container">
      <header style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', width: 'auto', marginTop: 0, background: 'rgba(255,255,255,0.1)' }}>
                <LogOut size={16} /> Logout
            </button>
        </div>
        <h1>MedSENSE AI</h1>
        <p>Intelligent Medical Report Analysis & Delivery System</p>
      </header>

      <div className="main-content">
        {/* Left Column: Upload */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity className="upload-icon" style={{ width: '2rem', height: '2rem', margin: 0 }} />
            Upload Report
          </h2>
          
          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <UploadCloud className="upload-icon" />
            <div className="upload-text">Drag & Drop your report here</div>
            <div className="upload-subtext">Supports PDF, JPG, PNG (Max 10MB)</div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: 'none' }}
              accept=".pdf,image/*"
            />
          </div>

          {file && (
            <div className="file-info" style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <File style={{ color: 'var(--accent)' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            </div>
          )}

          <button 
            className="btn" 
            onClick={handleAnalyze} 
            disabled={!file || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="loader"></div>
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Mail size={18} />
                Analyze & Send Email
              </>
            )}
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="card">
          <div className="result-card">
            <div className="result-header">
              <CheckCircle2 />
              <h2>Analysis Results</h2>
            </div>
            
            {isAnalyzing ? (
              <div className="empty-state">
                <div className="loader" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
                <p>AI is analyzing the report and extracting insights...</p>
              </div>
            ) : result ? (
              <div className="markdown-content">
                {/* Emergency 1-Line Banner */}
                {result.severity === 'EMERGENCY' && result.emergency_message && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(220,53,69,0.25), rgba(220,53,69,0.1))',
                    border: '1px solid #ff6b6b',
                    borderLeft: '4px solid #ff6b6b',
                    borderRadius: '0.6rem',
                    padding: '0.85rem 1.2rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    animation: 'emergencyPulse 1.5s ease-in-out infinite',
                    color: '#ff6b6b',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🚨</span>
                    {result.emergency_message}
                  </div>
                )}

                {/* Severity Badge */}
                {result.severity && (
                  <div style={{ 
                    display: 'inline-block',
                    padding: '0.4rem 1rem', 
                    borderRadius: '2rem', 
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    backgroundColor: result.severity === 'EMERGENCY' ? 'rgba(220, 53, 69, 0.2)' : 
                                   result.severity === 'MID' ? 'rgba(253, 126, 20, 0.2)' : 
                                   'rgba(40, 167, 69, 0.2)',
                    color: result.severity === 'EMERGENCY' ? '#ff6b6b' : 
                           result.severity === 'MID' ? '#fca311' : 
                           '#51cf66',
                    border: `1px solid ${result.severity === 'EMERGENCY' ? '#ff6b6b' : result.severity === 'MID' ? '#fca311' : '#51cf66'}`
                  }}>
                    {result.severity === 'EMERGENCY' ? '🔴' : result.severity === 'MID' ? '🟠' : '🟢'} Severity: {result.severity}
                  </div>
                )}

                <ReactMarkdown>{result.analysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="empty-state">
                <Activity size={48} opacity={0.5} />
                <p>Upload a report and click analyze to see the AI-generated insights here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
