// server.js
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment variables');
  process.exit(1);
}

// connect to MongoDB
connectDB(MONGO_URI);

const app = express();

// Security headers
app.use(helmet());

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON bodies
app.use(express.json());

// CORS - allow frontend (use CLIENT_ORIGIN in production)
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};
app.use(cors(corsOptions));

// Basic root route
app.get('/', (req, res) => {
  res.send('Task Manager API is running');
});

// API routes
app.use('/api/tasks', taskRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
