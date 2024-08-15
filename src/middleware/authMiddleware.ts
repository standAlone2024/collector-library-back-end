import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ACCESS_TOKEN_SECRET, AUTH_ERROR_CODE } from '../utils/constants';
import { printLog } from '../utils/utils';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers['authorization']?.split(' ')[1];
  printLog('accessToken: ' + accessToken);

  if (!accessToken) {
    return res.status(401).json({ 
      error: AUTH_ERROR_CODE.ACCESS_TOKEN_MISSING,
      message: 'Access token is missing' 
    });
  }

  try {
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ 
      error: AUTH_ERROR_CODE.ACCESS_TOKEN_INVALID,
      message: 'Access token is invalid' 
    });
  }
};

export default verifyToken;
