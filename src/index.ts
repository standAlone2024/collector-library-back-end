import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import sectionRoutes from './routes/sectionRoutes';
import sectionLabelRouters from './routes/sectionLabelRouters';
import bookRouters from './routes/bookRouters';
import sectionContentRouters from './routes/sectionContentRouters';
import cookieParser from 'cookie-parser';
import verifyToken from './middleware/authMiddleware';


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
app.use(cookieParser());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.use('/auth', authRoutes);
app.use('/section', verifyToken, sectionRoutes);
app.use('/label', verifyToken, sectionLabelRouters);
app.use('/book', verifyToken, bookRouters);
app.use('/content', verifyToken, sectionContentRouters);

// Start the server and connect to the database
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});