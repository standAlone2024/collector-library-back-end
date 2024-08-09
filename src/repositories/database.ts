import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST_MASTER,
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PWD,
      database: process.env.MYSQL_DATABASE_NAME,
      charset: 'utf8mb4',
      connectionLimit: 10
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async getConnection(): Promise<mysql.PoolConnection> {
    return this.pool.getConnection();
  }

  public async query(sql: string, values?: any): Promise<[any, mysql.FieldPacket[]]> {
    return this.pool.query(sql, values);
  }
}