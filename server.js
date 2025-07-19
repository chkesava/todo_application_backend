const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
