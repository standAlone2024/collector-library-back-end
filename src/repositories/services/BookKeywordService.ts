import { QueryBuilder } from '../../utils/QueryBuilder';
const TABLE_NAME = 'BookKeyword';
import moment from 'moment';
import {printLog, toDate} from '../../utils/utils';

export class BookKeywordService {
    private static instance: BookKeywordService;
    private queryBuilder: QueryBuilder;
  
    private constructor() {
      this.queryBuilder = new QueryBuilder();
    }
  
    public static getInstance() {
      if(!BookKeywordService.instance)
        BookKeywordService.instance = new BookKeywordService();
      return BookKeywordService.instance;
    }
  
    public async createKeyword(keyword: Omit<IBookKeyword, 'id' | 'created_date'>): Promise<IBookKeyword | null> {
      const newKeyword = {
        ...keyword,
        created_date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
      }
      const createdBookId = await this.queryBuilder.create<IBookKeyword>(TABLE_NAME, newKeyword);
      return await this.getKeyword(createdBookId);
    }
  
    public async getKeyword(id: number): Promise<IBookKeyword | null> {
      const books = await this.queryBuilder.read<IBookKeyword>(TABLE_NAME, { id });
      return books && books.length > 0 ? books[0] : null;
    }
  
    public async getKeywords(book_id: number): Promise<IBookKeyword[] | null> {
      return this.queryBuilder.read<IBookKeyword>(TABLE_NAME, { book_id });
    }
  
    public async updateKeyword(id: number, book: Partial<IBookKeyword>): Promise<IBookKeyword | null> {
      await this.queryBuilder.update<IBookKeyword>(TABLE_NAME, book, { id });
      return await this.getKeyword(id);
    }
  
    public async deleteKeyword(id: number): Promise<void> {
      await this.queryBuilder.delete<IBookKeyword>(TABLE_NAME, { id });
    }
}
  
export interface IBookKeyword {
    id?: number;
    book_id: number;
    extracted_keyword: string;
    created_date?: Date;
}