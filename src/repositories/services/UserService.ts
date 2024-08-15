import { QueryBuilder } from '../../utils/QueryBuilder';
import { printLog, toDate, toHashEncoding } from '../../utils/utils';
import moment from 'moment';
import { ROLE } from '../../utils/constants';

const TABLE_NAME = 'User';

export class UserService {
  private static instance: UserService;
  private queryBuilder: QueryBuilder;

  private constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async createUser(user: Omit<IUser, 'id' | 'date'>): Promise<number> {
    const hashedPassword = await toHashEncoding(user.password);
    const newUser = {
      ...user,
      password: hashedPassword,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    };
    printLog(newUser);
    const createdUserId = await this.queryBuilder.create<IUser>(TABLE_NAME, newUser);
    printLog('createdUserId ' + createdUserId);
    // console.log(createdUser);
    return createdUserId;
  }

  public async getUserById(id: number): Promise<IUser | null> {
    const users = await this.queryBuilder.read<IUser>(TABLE_NAME, { id });
    return users[0] || null;
  }

  public async getUserByEmail(email: string): Promise<IUser | null> {
    const users = await this.queryBuilder.read<IUser>(TABLE_NAME, { email });
    return users[0] || null;
  }

  public async updateUser(id: number, user: Partial<IUser>): Promise<IUser> {
    return this.queryBuilder.update<IUser>(TABLE_NAME, user, { id });
  }

  public async deleteUser(id: number): Promise<void> {
    await this.queryBuilder.delete<IUser>(TABLE_NAME, { id });
  }
}

export interface IUser {
  id?: number;
  role: ROLE;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  date: Date;
}