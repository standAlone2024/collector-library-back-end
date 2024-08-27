import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { printLog } from '../utils/utils';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, IS_LOCALHOST, ROLE, AUTH_ERROR_CODE } from '../utils/constants';
import { UserService, IUser } from '../repositories/services/UserService';

interface IAuth {
  token: string,
  user: IUser
}

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await UserService.getInstance().getUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const createdUserId = await UserService.getInstance().createUser({email, password, role:ROLE.USER});
  printLog('createdUserId:', createdUserId);
  const accessToken = jwt.sign({ userId: createdUserId }, ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId: createdUserId }, REFRESH_TOKEN_SECRET, { expiresIn: '36h' });
  printLog('signed');
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_LOCALHOST ? false : process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
    sameSite: IS_LOCALHOST ? 'lax' : 'strict',
    maxAge: 36 * 60 * 60 * 1000, // 36시간
  });

  return res.status(201).json({ message: 'Join Seccess' });
};

export const test = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'hi flint' });
}

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: IS_LOCALHOST ? false : process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
    sameSite: IS_LOCALHOST ? 'lax' : 'strict',
    maxAge: 36 * 60 * 60 * 1000, // 36시간
  });
  return res.status(200).json({ message: 'Logged out successfully' });
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  printLog(email + ' ' + password );
  // const user = await findUser(email);
  const user = await UserService.getInstance().getUserByEmail(email);

  if (!user || !(await validatePassword(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '36h' });
  printLog('signed');
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_LOCALHOST ? false : process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
    sameSite: IS_LOCALHOST ? 'lax' : 'strict',
    maxAge: 36 * 60 * 60 * 1000, // 36시간
  });
  
  // const user = await UserService.getInstance().getUserById(createdUserId);
  const auth: IAuth = {
    token: accessToken,
    user: user
  };
  return res.status(200).json({ message: 'login success', auth });
  // return res.status(200).json({ token: accessToken, user });
};

export const silent_refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  // printLog('refreshToken: ' + refreshToken);
  if (!refreshToken) {
    return res.status(401).json({ 
      error: AUTH_ERROR_CODE.REFRESH_TOKEN_MISSING,
      message: 'Refresh token is missing' 
    });
  }

  try {
    // refreshToken 검증
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };

    // 새 토큰 생성
    const newAccessToken = jwt.sign({ userId: decoded.userId }, ACCESS_TOKEN_SECRET, { expiresIn: '24h' });

    const newRefreshToken = jwt.sign({ userId: decoded.userId }, REFRESH_TOKEN_SECRET, { expiresIn: '36h' });

    // refreshToken을 쿠키에 설정
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: IS_LOCALHOST ? false : process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
      sameSite: IS_LOCALHOST ? 'lax' : 'strict',
      maxAge: 36 * 60 * 60 * 1000, // 36시간
    });

    const user = await UserService.getInstance().getUserById(parseInt(decoded.userId));

    const auth: IAuth = {
      token: newAccessToken,
      user: user!
    };

    return res.status(200).json({ message: 'Silent refresh seccess!', auth });

    // accessToken을 JSON payload로 전송
    // res.json({ accessToken: newAccessToken, user });

  } catch (error) {
    // refreshToken이 유효하지 않은 경우
    return res.status(403).json({ 
      error: AUTH_ERROR_CODE.REFRESH_TOKEN_INVALID,
      message: 'Refresh token is invalid' 
    });
  }
};

const validatePassword = async (password: string, hashedPassword: string) => {
  const ret = await bcrypt.compare(password, hashedPassword);
  // printLog('valid: ' + ret);
  return ret;
};