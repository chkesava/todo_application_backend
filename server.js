const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// ✅ CORS configuration (IMPORTANT)
const allowedOrigins = [
  "https://kesavatodo.netlify.app", // ✅ Your deployed frontend
  "http://localhost:5173"           // ✅ Optional: for local development
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Handle preflight CORS for all routes
app.options('*', cors());

// ✅ Middleware to parse JSON request bodies
app.use(express.json());

// ✅ Routes
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

// ✅ Basic health check route
app.get('/', (req, res) => res.send('API is running 🚀'));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
