// queryBuilder.ts
import { Database } from '../repositories/database';
import { printLog } from './utils';

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

  private addBackticks(identifier: string): string {
    // 이미 백틱이 있는 경우 그대로 반환
    if (identifier.startsWith('`') && identifier.endsWith('`')) {
      return identifier;
    }
    // 점이 있는 경우 (예: table.column) 각 부분에 개별적으로 백틱 추가
    if (identifier.includes('.')) {
      return identifier.split('.').map(part => `\`${part}\``).join('.');
    }
    // 그 외의 경우 전체에 백틱 추가
    return `\`${identifier}\``;
  }

  async create<T>(table: string, data: Partial<T>): Promise<number> {
    const keys = Object.keys(data).map(key => this.addBackticks(key));
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO ${this.addBackticks(table)} (${keys.join(', ')}) VALUES (${placeholders})`;
    printLog('query ' + query);
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
    ? `WHERE ${Object.keys(where).map(key => `${this.addBackticks(key)} = ?`).join(' AND ')}`
    : '';

    const query = `SELECT * FROM ${this.addBackticks(table)} ${whereClause}`;
    printLog('query ' + query);

    try {
      const [rows] = await this.db.query(query, Object.values(where));
      return rows as T[];
    } catch (error) {
      console.error('Read error:', error);
      throw error;
    }
  }

  async update<T>(table: string, data: Partial<T>, where: Partial<T>): Promise<T> {
    const setClause = Object.keys(data).map(key => `${this.addBackticks(key)} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${this.addBackticks(key)} = ?`).join(' AND ');

    const query = `UPDATE ${this.addBackticks(table)} SET ${setClause} WHERE ${whereClause}`;
    const values = [...Object.values(data), ...Object.values(where)];
    printLog('query ' + query);
    printLog('values ' + values);
    try {
      const [result] = await this.db.query(query, values);
      return result as T;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  async delete<T>(table: string, where: Partial<T>): Promise<void> {
    const whereClause = Object.keys(where).map(key => `${this.addBackticks(key)} = ?`).join(' AND ');
    const query = `DELETE FROM ${this.addBackticks(table)} WHERE ${whereClause}`;
    printLog('query ' + query);

    try {
      await this.db.query(query, Object.values(where));
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
  
  // async conditionRead<T>(options: {
  //   mainTable: string;
  //   columns: string[];
  //   joins: JoinClause[];
  //   where?: Record<string, any>;
  //   orderBy?: string;
  //   groupBy?: string[];
  //   limit?: number;
  //   offset?: number;
  // }): Promise<T[]> {
  //   const {
  //     mainTable,
  //     columns,
  //     joins,
  //     where = {},
  //     orderBy,
  //     groupBy,
  //     limit,
  //     offset
  //   } = options;
  
  //   const backtickColumns = columns.map(col => this.addBackticks(col));

  //   const joinClauses = joins.map(join =>
  //     `${join.type} JOIN ${this.addBackticks(join.table)} ON ${join.on}`
  //   ).join(' ');

  // const whereClause = Object.keys(where).length
  //   ? `WHERE ${Object.keys(where).map(key => `${this.addBackticks(key)} = ?`).join(' AND ')}`
  //   : '';
  
  //   const orderByClause = orderBy ? `ORDER BY ${this.addBackticks(orderBy)}` : '';
  //   const groupByClause = groupBy?.length ? `GROUP BY ${groupBy.map(col => this.addBackticks(col)).join(', ')}` : '';
  //   const limitClause = limit ? `LIMIT ${limit}` : '';
  //   const offsetClause = offset ? `OFFSET ${offset}` : '';
  
  //   const query = `
  //     SELECT ${backtickColumns.join(', ')}
  //     FROM ${this.addBackticks(mainTable)}
  //     ${joinClauses}
  //     ${whereClause}
  //     ${groupByClause}
  //     ${orderByClause}
  //     ${limitClause}
  //     ${offsetClause}
  //   `.trim();
  //   printLog('query ' + query);
  //   try {
  //     const [rows] = await this.db.query(query, Object.values(where));
  //     return rows as T[];
  //   } catch (error) {
  //     console.error('Join error:', error);
  //     throw error;
  //   }
  // }

  async conditionRead<T>(options: {
    mainTable: string;
    columns: string[];
    joins?: JoinClause[];
    where?: Record<string, any>;
    likeFields?: string[];
    orderBy?: string;
    groupBy?: string[];
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    const {
      mainTable,
      columns,
      joins = [],
      where = {},
      likeFields = [],
      orderBy,
      groupBy,
      limit,
      offset
    } = options;

    const backtickColumns = columns.map(col => this.addBackticks(col));

    const joinClauses = joins.map(join =>
      `${join.type} JOIN ${this.addBackticks(join.table)} ON ${join.on}`
    ).join(' ');

    const whereClause = [
      Object.keys(where).length
        ? `WHERE ${Object.keys(where).map(key => `${this.addBackticks(key)} = ?`).join(' AND ')}`
        : '',
      likeFields.length
        ? `AND ${likeFields.map(field => `${this.addBackticks(field)} LIKE ?`).join(' AND ')}`
        : ''
    ].filter(Boolean).join(' ');

    const orderByClause = orderBy ? `ORDER BY ${this.addBackticks(orderBy)}` : '';
    const groupByClause = groupBy?.length ? `GROUP BY ${groupBy.map(col => this.addBackticks(col)).join(', ')}` : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';

    const query = `
      SELECT ${backtickColumns.join(', ')}
      FROM ${this.addBackticks(mainTable)}
      ${joinClauses}
      ${whereClause}
      ${groupByClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `.trim();
    printLog('query ' + query);
    try {
      const whereParams = [...Object.values(where), ...likeFields.map(field => `%${field}%`)];
      const [rows] = await this.db.query(query, whereParams);
      return rows as T[];
    } catch (error) {
      console.error('Join error:', error);
      throw error;
    }
  }
}