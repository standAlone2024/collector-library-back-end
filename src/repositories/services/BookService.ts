import { QueryBuilder } from '../../utils/QueryBuilder';
const TABLE_NAME = 'Book';
import moment from 'moment';
import {printLog, toDate} from '../../utils/utils';

export class BookService {
  private static instance: BookService;
  private queryBuilder: QueryBuilder;

  private constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  public static getInstance() {
    if(!BookService.instance)
      BookService.instance = new BookService();
    return BookService.instance;
  }

  public async createBook(book: Omit<IBook, 'id' | 'created_date'>): Promise<IBook | null> {
    const newBook = {
      ...book,
      created_date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
      updated_date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    const createdBookId = await this.queryBuilder.create<IBook>(TABLE_NAME, book);
    return await this.getBook(createdBookId);
  }

  public async getBook(id: number): Promise<IBook | null> {
    const books = await this.queryBuilder.read<IBook>(TABLE_NAME, { id });
    return books && books.length > 0 ? books[0] : null;
  }

  public async searchBooks(sectionId: number, keyword: string): Promise<IBookResult[] | null> {
    const books = await this.queryBuilder.conditionRead<IBookResult>({
      mainTable: TABLE_NAME,
      columns: ['id', 'title', 'book_thumb_path'],
      likeFields: ['title'],
      where: {'section_id': sectionId},
      keyword: keyword,
    });
    printLog(books ? books.length : 'no search result');
    return books;
  }

  public async getBookDetail(sectionId: number, page: number, pageSize: number): Promise<IBookDetailPaging | null> {
    const offset = (page - 1) * pageSize;
    const bookDetails = await this.queryBuilder.conditionRead<IBookDeatil>({
      mainTable: 'Section',
      columns: [
        'S.id AS id',
        'S.label AS label',
        'B.title AS title',
        'B.description AS description',
        'B.book_thumb_path AS book_thumb_path',
        'B.`order` AS `order`',
        'JSON_ARRAYAGG(JSON_OBJECT(\'label_name\', SL.label_name, \'content\', SC.content)) AS etc'
      ],
      joins: [
        { type: 'INNER', table: 'SectionOptLabel AS SL', on: 'SL.section_id = S.id' },
        { type: 'INNER', table: 'Book AS B', on: 'B.section_id = S.id' },
        { type: 'LEFT', table: 'SectionOptContent AS SC', on: 'SC.section_label_id = SL.id AND SC.book_id = B.id' }
      ],
      where: { 'S.id': sectionId },
      groupBy: ['S.id', 'B.id'],
      limit: 100
    });
    return (bookDetails && bookDetails.length > 0) ? {bookDetails, total: bookDetails.length} : {bookDetails: null, total: 0};
  }

  public async getBooks(section_id: number): Promise<IBook[] | null> {
    return this.queryBuilder.read<IBook>(TABLE_NAME, { section_id });
  }

  public async updateBook(id: number, book: Partial<IBook>): Promise<IBook | null> {
    const newBook = {
      ...book,
      updated_date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    await this.queryBuilder.update<IBook>(TABLE_NAME, book, { id });
    return await this.getBook(id);
  }

  public async deleteBook(id: number): Promise<void> {
    await this.queryBuilder.delete<IBook>(TABLE_NAME, { id });
  }
}

export interface IBook {
  id?: number;
  section_id: number;
  order: number;
  title: string;
  book_thumb_path?: string;
  description?: string;
  created_date: Date;
  updated_date?: Date;
}

export interface IBookDeatil {
  id: number;
  order: number;
  title: string;
  book_thumb_path?: string;
  description?: string;
  created_date: Date;
  updated_date?: Date;
  etc: ILabel[];
}

export interface IBookDetailPaging {
  bookDetails: IBookDeatil[] | null;
  total: number;
}

export interface ILabel {
  label_name: string;
  content: string;
  order: number
}

export interface IBookResult {
  id: number;
  title: string;
  book_thumb_path?: string;
}