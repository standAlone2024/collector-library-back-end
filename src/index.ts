import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from './middleware/logger';
import authRoutes from './routes/authRoutes';

// load .env file
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3001');

app.use(cors({
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middleware to parse JSON
app.use(bodyParser.json());

// Custom middleware
// app.use(logger);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

// User routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

// Start the server and connect to the database
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});