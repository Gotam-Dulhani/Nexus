const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
console.log('--- NEXUS BACKEND STARTUP (DEBUG VERSION 1.2) ---');
const server = http.createServer(app);

const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
  console.log(`[CORS] Added ${process.env.FRONTEND_URL} to allowed origins`);
}

// Allow any Vercel preview deployment
const corsHandler = (origin, callback) => {
  if (!origin || corsOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

// ✅ Security & parsing middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      workerSrc: ["'self'", "blob:", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: corsHandler, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
 
// ✅ Request logger for debugging
app.use((req, res, next) => {
  console.log(`[Incoming Request] ${req.method} ${req.url}`);
  next();
});

// ✅ Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
console.log('Loading routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('Registering /api/profile routes...');
app.use('/api/profile', require('./routes/profile'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/deals', require('./routes/deals'));
 
// ✅ Simple test route for connectivity
app.post('/api/ping-test', (req, res) => res.json({ message: 'API is alive', time: new Date() }));

// ✅ Swagger API Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Nexus API Documentation'
}));

app.get('/', (req, res) => res.send('Nexus API Running'));

// ✅ Socket.IO for WebRTC signaling
const io = new Server(server, {
  cors: { origin: corsHandler, methods: ['GET', 'POST'] }
});
require('./socketServer')(io);

// ✅ Global 404 Handler for API
app.use('/api', (req, res) => {
  console.log(`[404 ERROR] No route found for: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
    debug_hint: 'Check routes/profile.js registration'
  });
});
 
// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));