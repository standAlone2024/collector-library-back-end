import { QueryBuilder } from '../../utils/queryBuilder';
const TABLE_NAME = 'Book';
import moment from 'moment';
import {toDate} from '../../utils/utils';

export class BookService {
  private queryBuilder: QueryBuilder;

  constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  async createBook(book: Omit<Book, 'id' | 'date'>): Promise<Book> {
    const newBook = {
      ...book,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    return this.queryBuilder.create<Book>(TABLE_NAME, book);
  }

  async getBook(id: number): Promise<Book | null> {
    const books = await this.queryBuilder.read<Book>(TABLE_NAME, { id });
    return books && books.length > 0 ? books[0] : null;
  }

  async getBooks(section_id: number): Promise<Book[] | null> {
    return this.queryBuilder.read<Book>(TABLE_NAME, { section_id });
  }

  async updateBook(id: number, book: Partial<Book>): Promise<Book> {
    return this.queryBuilder.update<Book>(TABLE_NAME, book, { id });
  }

  async deleteBook(id: number): Promise<void> {
    await this.queryBuilder.delete<Book>(TABLE_NAME, { id });
  }
}

export interface Book {
    id?: number;
    section_id: number;
    order: number;
    title: string;
    book_thumb_path?: string;
    description?: string;
    date: Date;
}