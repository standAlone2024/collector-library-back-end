import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { addUser, findUser, validatePassword } from '../models/userModel';
import { printLog } from '../utils/utils';
import { SECRET_KEY } from '../utils/constants';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await findUser(email);

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  //TODO DB insert 해야 함
  // const user = await addUser(email, password);
  // const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  const token = jwt.sign({ userId: 1 }, SECRET_KEY, { expiresIn: '1h' });

  res.status(201).json({ token });
};

export const test = async (req: Request, res: Response) => {
  const message = 'hi flint';
  res.status(200).json({ message });
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  printLog(email + ' ' + password );
  const user = await findUser(email);
  printLog(user);

  if (!user || !(await validatePassword(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
  printLog('signed');
  // printLog(res.json);
  res.status(200).json({ token });
};