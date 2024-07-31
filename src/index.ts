import express, { Request, Response } from 'express';
import userRoutes from './routes/user';
import logger from './middleware/logger';

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());

// Custom middleware
app.use(logger);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

// User routes
app.use('/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
