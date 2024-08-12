import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { SECRET_KEY } from '../utils/constants';


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // const token = req.headers['authorization']?.split(' ')[1];

  // if (!token) {
  //   return res.sendStatus(401);
  // }

  // jwt.verify(token, SECRET_KEY, (err, user) => {
  //   if (err) {
  //     return res.sendStatus(403);
  //   }

  //   req.user = user;
  //   next();
  // });
};