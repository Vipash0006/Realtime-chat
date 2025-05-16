import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoDBConnect from './mongoDB/connection.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import messageRoutes from './routes/message.js';
import mediaRoutes from './routes/media.js';
import { Server } from 'socket.io';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Middleware Configs
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

// Increase payload size limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// ✅ Content Security Policy header to allow Google OAuth scripts
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://accounts.google.com https://apis.google.com https://www.gstatic.com; frame-src https://accounts.google.com;"
  );
  next();
});

// ✅ Routes
app.use('/', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/media', mediaRoutes);

// ✅ MongoDB
mongoose.set('strictQuery', false);
mongoDBConnect();

// ✅ HTTP Server and Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Make io instance available to routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id);
      socket.emit('connected');
    }
  });

  socket.on('join room', (room) => {
    if (room) {
      socket.join(room);
    }
  });

  socket.on('typing', (room) => {
    if (room) {
      socket.in(room).emit('typing');
    }
  });

  socket.on('stop typing', (room) => {
    if (room) {
      socket.in(room).emit('stop typing');
    }
  });

  socket.on('new message', (newMessageReceived) => {
    if (!newMessageReceived || !newMessageReceived.chatId) {
      console.log('❌ Invalid message payload:', newMessageReceived);
      return;
    }
  
    const chat = newMessageReceived.chatId;
    if (!chat.users) {
      console.log('Chat users not defined:', chat);
      return;
    }
  
    // Emit to all users in the chat room
    socket.to(chat._id).emit('message received', newMessageReceived);
    
    // Also emit to individual users
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.to(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// ✅ Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Listening at PORT - ${PORT}`);
});
