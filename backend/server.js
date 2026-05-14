const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = require('./database');

// Services
const geminiService = require('./services/gemini');
const emailService = require('./services/email');
const chatService = require('./services/chat');

// Setup File Upload
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// --- Routes: Authentication ---
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists.' });
                }
                return res.status(500).json({ error: 'Database error.' });
            }
            
            // Auto login after register
            const token = jwt.sign({ id: this.lastID, name, email }, JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({ message: 'User registered successfully', token, user: { name, email } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error.' });
        if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email } });
    });
});

// --- Routes: Medical Analyzer ---
app.post('/api/analyze', authenticateToken, upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname;

        console.log(`Analyzing file: ${originalName} (${mimeType}) for user ${req.user.email}`);

        const analysisResult = await geminiService.analyzeMedicalReport(filePath, mimeType);
        
        // Use user's email if available, otherwise fallback to dest
        const destinationEmail = req.user.email || process.env.EMAIL_DEST;
        await emailService.sendAnalysisEmail(analysisResult.markdown_analysis, originalName, analysisResult.severity, analysisResult.emergency_message);

        res.json({ 
            success: true, 
            message: 'Analysis completed and email sent successfully.',
            analysis: analysisResult.markdown_analysis,
            severity: analysisResult.severity,
            emergency_message: analysisResult.emergency_message || null
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to process the report', 
            details: error.message 
        });
    } finally {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Failed to delete temp file:", err);
            });
        }
    }
});

// --- Routes: AI Chatbot ---
app.post('/api/chat', authenticateToken, async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const reply = await chatService.getChatResponse(message, history || []);
        res.json({ reply });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to get chat response.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
