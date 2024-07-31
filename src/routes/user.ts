import { Router, Request, Response } from 'express';

const userRoutes = Router();

userRoutes.get('/', (req: Request, res: Response) => {
  res.send('User route');
});

userRoutes.get('/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

export default userRoutes;
