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
    const createdBookId = await this.queryBuilder.create<IBook>(TABLE_NAME, newBook);
    return await this.getBook(createdBookId);
  }

  public async getBook(id: number): Promise<IBook | null> {
    const books = await this.queryBuilder.read<IBook>(TABLE_NAME, { id });
    return books && books.length > 0 ? books[0] : null;
  }

  public async getBookWithKeyword(id: number): Promise<IBookWithOCR | null> {
    const bookWithOCR = await this.queryBuilder.conditionRead<IBookWithOCR>({
      mainTable: TABLE_NAME,
      mainTableAlias: 'B',
      columns: [
        'B.id',
        'B.section_id',
        'B.order',
        'B.title',
        'B.book_thumb_path',
        'B.description',
        'B.created_date',
        'B.updated_date',
        { raw: "JSON_ARRAYAGG(JSON_OBJECT('extracted_keyword', BK.extracted_keyword)) AS extracted_text" }
        // 'JSON_ARRAYAGG(JSON_OBJECT(\'extracted_keyword\', BK.extracted_keyword)) AS extracted_text'
      ],
      joins: [
        { type: 'INNER', table: 'BookKeyword', alias: 'BK', on: 'B.id = BK.book_id' },
      ],
      where: { 'B.id': id },
      groupBy: ['B.id']
    });
    return (bookWithOCR && bookWithOCR.length > 0) ? bookWithOCR[0] : null;
  }

  private async getLabelExtra(bookId: number): Promise<ILabelExtra[]> {
    const extraLabel = await this.queryBuilder.conditionRead<ILabelExtra>({
      mainTable: 'SectionOptLabel',
      mainTableAlias: 'SL', 
      columns: ['SL.order', 'SL.label_name', 'SC.content'],
      joins: [{type: 'INNER', table: 'SectionOptContent', alias: 'SC', on: 'SL.id = SC.section_label_id'},],
      where: {'SC.book_id': bookId},
      orderBy: 'SL.order',
      isOrderASC: true,
    });

    return (extraLabel && extraLabel.length > 0) ? extraLabel : [];
  }

  public async getBookDeatilByBookId(id: number): Promise<IBookDeatil | null> {
    //extracted_text를 포함해서 return
    const bookDetail = await this.queryBuilder.conditionRead<IBookDeatil>({
      mainTable: TABLE_NAME,
      mainTableAlias: 'B',
      columns: [
        'B.id', 'B.section_id', 'B.order', 'B.book_thumb_path',
        { raw: "JSON_OBJECT('title', B.title, 'description', B.description) AS label_basic" },
        { raw: "JSON_ARRAYAGG(JSON_OBJECT('extracted_keyword', BK.extracted_keyword)) AS extracted_text"},
        'B.created_date', 'B.updated_date'
      ],
      joins: [ 
        {type: 'LEFT', table: 'BookKeyword', alias: 'BK', on: 'B.id = BK.book_id'},
      ],
      where: {'B.id': id},
      groupBy: ['B.id']
    });
    //
    if( bookDetail && bookDetail.length > 0 ) {
      const labelExtra = await this.getLabelExtra(id);
      // printLog(labelExtra);
      if (labelExtra) {
        bookDetail[0].label_extra = [];
        bookDetail[0].label_extra = labelExtra;
      }
      printLog(bookDetail[0].label_extra);
    }
    return ( bookDetail && bookDetail.length > 0 ) ? bookDetail[0] : null;
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

  public async getBookListBySectionId(sectionId: number, page: number, pageSize: number): Promise<IBookDetailPaging | null> {
    //extracted_text를 제외한 값이 return
    const offset = (page - 1) * pageSize;
    const bookDetails = await this.queryBuilder.conditionRead<IBookDeatil>({
      mainTable: 'Section',
      mainTableAlias: 'S',
      columns: [
        'S.label', 'B.id', 'B.section_id', 'B.order', 'B.book_thumb_path',
        {raw: "JSON_OBJECT('title', B.title, 'description', B.description) AS basic_label"},
        {raw: "JSON_ARRAY(" 
          + "JSON_EXTRACT(CONCAT('[', " 
          + "GROUP_CONCAT(JSON_OBJECT('order', SL.order,'label_name', SL.label_name,'content', SC.content) " 
          + "ORDER BY SL.order ASC SEPARATOR ','), ']'),'$[*]')) " 
          + "AS extra_label"},
        'B.created_date',
        'B.updated_date'
      ],
      joins: [
        {type: 'INNER', table: 'Book', alias: 'B', on: 'S.id = B.section_id'}
      ],
      where: {'S.id': sectionId},
      orderBy: 'B.order',
      limit: pageSize,
      offset: offset
    });

    const totalCountResult = await this.queryBuilder.conditionRead<{total: number}>({
      mainTable: 'Section',
      mainTableAlias: 'S',
      columns: [{ raw: 'COUNT(*) AS total' }],
      joins: [
        {type: 'INNER', table: 'Book', alias: 'B', on: 'S.id = B.section_id'}
      ],
      where: {'S.id': sectionId}
    });

    const total = totalCountResult[0]?.total || 0;

    return {
      bookDetails: bookDetails.length > 0 ? bookDetails : null,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
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

export interface IBookWithOCR extends IBook {
  extracted_text?: string[];
}

export interface IBookDeatil {
  id: number;
  section_id: number;
  order: number;
  book_thumb_path?: string;
  label_basic: ILabelBasic;
  label_extra?: ILabelExtra[];
  extracted_text?: string[]; //OCR data
  created_date: Date;
  updated_date?: Date;
}

export interface ILabelExtra {
  id?: number;
  order: number;
  label_name: string;
  content: string;
}

export interface ILabelBasic {
  title: string;
  description?: string;
}

export interface IBookDetailPaging {
  bookDetails: IBookDeatil[] | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IBookResult {
  id: number;
  title: string;
  book_thumb_path?: string;
}