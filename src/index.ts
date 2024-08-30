import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import sectionRoutes from './routes/sectionRoutes';
import sectionLabelRouters from './routes/sectionLabelRouters';
import bookRouters from './routes/bookRouters';
import sectionContentRouters from './routes/sectionContentRouters';
import imageRouters from './routes/imageRouters';
import cookieParser from 'cookie-parser';
import verifyToken from './middleware/authMiddleware';
import { Server } from 'http'; // 추가된 import


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
app.use('/image', verifyToken, imageRouters);

let server: Server;

async function startServer() {
  try {
    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  
  //Express 서버 종료
  server.close(() => {
    console.log('Express server closed');
  });

  process.exit(0);
});

startServer();