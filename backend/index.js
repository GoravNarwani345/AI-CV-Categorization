const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');


// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // User joins their personal room (by user ID)
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
    });

    // User is typing
    socket.on('typing', ({ conversationId, userId, userName }) => {
        socket.broadcast.emit('user_typing', { conversationId, userId, userName });
    });

    // User stopped typing
    socket.on('stop_typing', ({ conversationId, userId }) => {
        socket.broadcast.emit('user_stop_typing', { conversationId, userId });
    });

    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
    });
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📁 Created uploads directory');
}

// Set headers for PDFs to display inline instead of downloading
app.use('/uploads', (req, res, next) => {
    if (req.url.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Disposition', 'inline');
    }
    next();
}, express.static(uploadsDir));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profile'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/applications', require('./routes/applications'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aicv';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('AI CV Categorization API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`💬 Socket.io ready`);
});
