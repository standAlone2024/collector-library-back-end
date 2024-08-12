import bcrypt from 'bcryptjs';
import { printLog } from '../utils/utils';
import { ROLE } from '../utils/constants';

export interface User {
  id?: number;
  role: ROLE;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  date: Date;
}

// const users: User[] = [];

export const addUser = async (email: string, password: string) => {  // 변경: username에서 email로 변경
  // const hashedPassword = await bcrypt.hash(password, 10);
  // const user = { id: users.length + 1, email, password: hashedPassword };  // 변경: username에서 email로 변경
  // users.push(user);
  // return user;
};

export const findUser = async (email: string) => {
  //DB 연결 해야 함
  //Mock Data setting
  // const hashedPassword = await bcrypt.hash('1234', 10);
  const hashedPassword = '$2a$10$bwCqXmCiynjjclWuxzl.DOmU5.iaCgIPYCX9dTmkHvI6eUHcBMSea';
  const user = { id: 1, email : 'aeca@naver.com', password: hashedPassword };
  return user
};

export const validatePassword = async (password: string, hashedPassword: string) => {
  let ret = await bcrypt.compare(password, hashedPassword);
  printLog('valid: ' + ret);
  return ret;
};
