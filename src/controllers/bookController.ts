import { Request, Response } from 'express';
import { BookService, IBook, IBookDeatil, ILabelExtra } from '../repositories/services/BookService';
import { printLog } from '../utils/utils';
import { BookKeywordService } from '../repositories/services/BookKeywordService';
import { SectionContentService } from '../repositories/services/SectionContentService';

export const getBooks = async (req: Request, res: Response) => {
    try {
        const sectionId = Number.parseInt(req.params.id as string) || 0;
        printLog("sectionId ?" + sectionId);
        if(sectionId === 0)
            return res.status(400).json({message: "Section id is not sent"});
        const books = await BookService.getInstance().getBooks(sectionId);
        return res.status(200).json({books});
    } catch(error){
        return res.status(500).json({ message: "Error fetching books", error });
    }
}

//GET /book-details/1?id&page=2&pageSize=20
export const getBookDetails = async (req: Request, res: Response) => {
    try {
        const sectionId = Number.parseInt(req.query.id as string) || 0;
        if(sectionId === 0)
            return res.status(400).json({message: "Section id id not sent"});
        const page = Number.parseInt(req.query.page as string) || 1;
        const pageSize = Number.parseInt(req.query.pageSize as string) || 10;
        const bookDetails = await BookService.getInstance().getBookListBySectionId(sectionId, page, pageSize);
        return res.status(200).json({bookDetails});
    } catch(error){
        return res.status(500).json({ message: "Error fetching bookDeatils", error });
    }
}

export const getBookById = async (req: Request, res: Response) => {
    try{
        const bookId = Number.parseInt(req.query.id as string) || 0;
        printLog('bookId: ' + bookId);
        // const book = await BookService.getInstance().getBook(bookId);
        const book = await BookService.getInstance().getBookDeatilByBookId(bookId);
        // printLog(book);
        return res.status(200).json({book});
    } catch(error){
        return res.status(500).json({message: "Error fetching a book"});
    }
}

export const searchBooks = async (req: Request, res: Response) => {
    try {
        const { keyword, section_id } = req.query as { keyword: string, section_id: string };
        const sectionId = Number.parseInt(section_id);
        // printLog(keyword);
        // printLog(sectionId);
        if(!keyword || typeof keyword !== 'string') 
            return res.status(400).json({message: "Keyword is not found"});
        const books = await BookService.getInstance().searchBooks(sectionId, keyword);
        // printLog('books: ' + books?.length);
        return res.status(200).json({books});
    }catch(err) {
        return res.status(500).json({message: "Error searching books", err});
    }
}

export const createBook = async (req: Request, res: Response) => {
    try {
        const {section_id, order, title, book_thumb_path, description, extracted_text, label_extra} = req.body;
        const newBook = await BookService.getInstance().createBook({section_id, order, title, book_thumb_path, description});
        if(newBook && newBook.id){
            if(extracted_text && extracted_text.length > 0) {
                extracted_text.map(async(keyword:string)=> {
                    await BookKeywordService.getInstance().createKeyword(
                        {book_id: newBook.id as number, extracted_keyword: keyword}
                    );
                });
            }

            if(label_extra && label_extra.length > 0) {
                label_extra.map(async(label: ILabelExtra) => {
                    const id = label.id;
                    if(id){
                        await SectionContentService.getInstance().createSectionContent(
                            {section_label_id: id, book_id: newBook.id as number, content: label.content}
                        );
                    }
                });
            }
        }
        else
            throw new Error("Fail to create Book");
        const newBookWithKeywords = await BookService.getInstance().getBookWithKeyword(newBook.id);
        return res.status(201).json({book: newBookWithKeywords});
    } catch(error){
        return res.status(400).json({ message: "Error create book", error });
    }
}

export const updateBook = async (req: Request, res: Response) => {
    try {
        const bookId = Number.parseInt(req.params.id);
        const existBook = await BookService.getInstance().getBook(bookId);
        if(!existBook)
            return res.status(404).json({message: "Book is not found"});
        const bookDetail = req.body as IBookDeatil;
        if(bookDetail){
            const book = makeBook(bookDetail);
            const updatedBook = await BookService.getInstance().updateBook(bookId, book);
            bookDetail.label_extra?.map(async(label: ILabelExtra) => {
                if(label.id && label.content)
                {
                    printLog(label);
                    
                    const oldContent = await SectionContentService.getInstance().getSectionContent(label.id, bookId);
                    if(!oldContent)
                    {
                        await SectionContentService.getInstance().createSectionContent(
                            {section_label_id: label.id, book_id: book.id as number, content: label.content}
                        );
                    }else {
                        await SectionContentService.getInstance().updateSectionContent(oldContent.id as number, {content: label.content})
                    }
                }
            });
            const newBookWithKeywords = await BookService.getInstance().getBookWithKeyword(bookId);
            return res.status(200).json({book: newBookWithKeywords});
        }else
            throw new Error("Sent wrong request data");
    } catch(error){
        return res.status(400).json({ message: "Error update book", error });
    }
}

const makeBook = (bookDetail: IBookDeatil) => {
    const book:IBook = {
        id: bookDetail.id,
        section_id: bookDetail.section_id,
        order: bookDetail.order,
        title: bookDetail.label_basic.title,
        book_thumb_path: bookDetail.book_thumb_path,
        description: bookDetail.label_basic.description,
        created_date: bookDetail.created_date,
    }
    return book;
} 

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const bookId = Number.parseInt(req.params.id);
        const existBook = await BookService.getInstance().getBook(bookId);
        if(!existBook)
            return res.status(404).json({message: "Book is not found"});
        await BookService.getInstance().deleteBook(bookId);
        return res.status(200).json({message: "Book successfully deleted"});
    } catch(error){
        return res.status(500).json({ message: "Error delete book", error });
    }
}