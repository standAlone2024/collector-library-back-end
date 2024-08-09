import { QueryBuilder } from '../../utils/queryBuilder';
import {ROLE} from '../../utils/constants';
import moment from 'moment';
import {toDate} from '../../utils/utils';

export class UserService {
  private queryBuilder: QueryBuilder;

  constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  async createUser(user: Omit<User, 'id' | 'date'>): Promise<User> {
    const newUser = {
      ...user,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    };
    return this.queryBuilder.create<User>('User', newUser);
  }

  async getUser(id: number): Promise<User | null> {
    const users = await this.queryBuilder.read<User>('User', { id });
    return users[0] || null;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    return this.queryBuilder.update<User>('User', user, { id });
  }

  async deleteUser(id: number): Promise<void> {
    await this.queryBuilder.delete<User>('User', { id });
  }
}

export interface User {
    id?: number;
    role: ROLE; 
    email: string;
    password: string;
    name?: string;
    phone?: string;
    date: Date;
}