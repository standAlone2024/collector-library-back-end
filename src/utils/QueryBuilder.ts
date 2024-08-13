// queryBuilder.ts
import { Database } from '../repositories/database';

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

interface JoinClause {
  type: JoinType;
  table: string;
  on: string;
}

export class QueryBuilder {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async create<T>(table: string, data: Partial<T>): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

    try {
      const [result] = await this.db.query(query, values);
      return (result as any).insertId;
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  }

  async read<T>(table: string, where: Partial<T> = {}): Promise<T[]> {
    const whereClause = Object.keys(where).length
      ? `WHERE ${Object.keys(where).map(key => `${key} = ?`).join(' AND ')}`
      : '';

    const query = `SELECT * FROM ${table} ${whereClause}`;

    try {
      const [rows] = await this.db.query(query, Object.values(where));
      return rows as T[];
    } catch (error) {
      console.error('Read error:', error);
      throw error;
    }
  }

  async update<T>(table: string, data: Partial<T>, where: Partial<T>): Promise<T> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const values = [...Object.values(data), ...Object.values(where)];

    try {
      const [result] = await this.db.query(query, values);
      return result as T;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  async delete<T>(table: string, where: Partial<T>): Promise<void> {
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;

    try {
      await this.db.query(query, Object.values(where));
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
  
  async join<T>(options: {
    mainTable: string;
    columns: string[];
    joins: JoinClause[];
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    const {
      mainTable,
      columns,
      joins,
      where = {},
      orderBy,
      limit,
      offset
    } = options;

    const joinClauses = joins.map(join => 
      `${join.type} JOIN ${join.table} ON ${join.on}`
    ).join(' ');

    const whereClause = Object.keys(where).length
      ? `WHERE ${Object.keys(where).map(key => `${key} = ?`).join(' AND ')}`
      : '';

    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';

    const query = `
      SELECT ${columns.join(', ')}
      FROM ${mainTable}
      ${joinClauses}
      ${whereClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `.trim();

    try {
      const [rows] = await this.db.query(query, Object.values(where));
      return rows as T[];
    } catch (error) {
      console.error('Join error:', error);
      throw error;
    }
  }
}