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

  private addBackticks(identifier: string | { raw: string }): string {
    // raw 타입인 경우 백틱을 추가하지 않고 그대로 반환
    if (typeof identifier === 'object' && 'raw' in identifier) {
      return identifier.raw;
    }
    // 문자열인 경우 기존 로직 적용
    if (typeof identifier === 'string') {
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
  
    // 예상치 못한 타입의 경우 에러 throw 또는 빈 문자열 반환
    throw new Error(`Unexpected identifier type: ${typeof identifier}`);
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
    mainTableAlias?: string; // 메인 테이블 별칭 추가
    columns: (string | { raw: string })[];
    joins?: Array<{
      type: string;
      table: string;
      alias?: string; // 조인 테이블 별칭 추가
      on: string;
    }>;
    where?: Record<string, any>;
    and?: Array<{[key: string]: any}>;
    likeFields?: string[];
    orderBy?: string;
    isOrderASC?: boolean;
    groupBy?: string[];
    limit?: number;
    offset?: number;
    keyword?: string;
  }): Promise<T[]> {
    const {
      mainTable,
      mainTableAlias,
      columns,
      joins = [],
      where = {},
      and = [],
      likeFields = [],
      orderBy,
      isOrderASC,
      groupBy,
      limit,
      offset,
      keyword
    } = options;

    const backtickColumns = columns.map(col => this.addBackticks(col));

    const mainTableWithAlias = mainTableAlias 
      ? `${this.addBackticks(mainTable)} AS ${mainTableAlias}`
      : this.addBackticks(mainTable);

    const joinClauses = joins.map(join =>
      `${join.type} JOIN ${this.addBackticks(join.table)}${join.alias ? ` AS ${join.alias}` : ''} ON ${join.on}`
    ).join(' ');

    const whereClauses = [];
    const whereParams = [];
    if (Object.keys(where).length) {
      whereClauses.push(Object.keys(where).map(key => `${this.addBackticks(key)} = ?`).join(' AND '));
      whereParams.push(...Object.values(where));
    }
    if (and.length) {
      and.forEach(condition => {
        const andClause = Object.keys(condition).map(key => `${this.addBackticks(key)} = ?`).join(' AND ');
        whereClauses.push(`(${andClause})`);
        whereParams.push(...Object.values(condition));
      });
    }
    if (likeFields.length) {
      whereClauses.push(likeFields.map(field => `${this.addBackticks(field)} LIKE ?`).join(' AND '));
      whereParams.push(...likeFields.map(() => `%${keyword}%`));
    }
    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const orderByClause = orderBy ? `ORDER BY ${this.addBackticks(orderBy)}` : '';
    if(orderByClause.length > 0 ) {
      isOrderASC ? orderByClause + ' ASC' : orderByClause + ' DESC';
    }

    const groupByClause = groupBy?.length ? `GROUP BY ${groupBy.map(col => this.addBackticks(col)).join(', ')}` : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';

    const query = `
      SELECT ${backtickColumns.join(', ')}
      FROM ${mainTableWithAlias}
      ${joinClauses}
      ${whereClause}
      ${groupByClause}
      ${orderByClause}
      ${limitClause}
      ${offsetClause}
    `.trim();
    printLog('query ' + query);
    try {
      const [rows] = await this.db.query(query, whereParams);
      return rows as T[];
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }
}