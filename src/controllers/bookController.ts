import { Request, Response } from 'express';
import { BookService } from '../repositories/services/BookService';
import { printLog } from '../utils/utils';

export const getBooks = async (req: Request, res: Response) => {
    try {
        const sectionId = Number.parseInt(req.params.id as string) || 0;
        printLog("sectionId " + sectionId);
        if(sectionId === 0)
            return res.status(400).json({message: "Section id id not sent"});
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
        const bookDetails = await BookService.getInstance().getBookDetail(sectionId, page, pageSize);
        return res.status(200).json({bookDetails});
    } catch(error){
        return res.status(500).json({ message: "Error fetching bookDeatils", error });
    }
}

export const getBookById = async (req: Request, res: Response) => {
    try{
        const bookId = Number.parseInt(req.params.id);
        const book = await BookService.getInstance().getBook(bookId);
        return res.status(200).json({book});
    } catch(error){
        return res.status(500).json({message: "Error fetching a book"});
    }
}

export const searchBooks = async (req: Request, res: Response) => {
    try {
        const { keyword, section_id } = req.query as { keyword: string, section_id: string };
        const sectionId = Number.parseInt(section_id);
        // printLog(keyword, sectionId);
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
        const {section_id, order, title, book_thumb_path, description} = req.body;
        const newBook = await BookService.getInstance().createBook({section_id, order, title, book_thumb_path, description});
        return res.status(201).json({book: newBook});
    } catch(error){
        return res.status(400).json({ message: "Error create book", error });
    }
}

export const updateBook = async (req: Request, res: Response) => {
    try {
        const bookId = Number.parseInt(req.params.id);
        const existBook = await BookService.getInstance().getBook(bookId);
        if(!existBook)
            return res.status(404).json({message: "Book not found"});
        const {id, section_id, order, title, book_thumb_path, description, date} = req.body;
        const updatedBook = await BookService.getInstance().updateBook(bookId, {id, section_id, order, title, book_thumb_path, description, date});
        return res.status(200).json({book: updatedBook});
    } catch(error){
        return res.status(400).json({ message: "Error update book", error });
    }
}

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const bookId = Number.parseInt(req.params.id);
        const existBook = await BookService.getInstance().getBook(bookId);
        if(!existBook)
            return res.status(404).json({message: "Book not found"});
        await BookService.getInstance().deleteBook(bookId);
        return res.status(200).json({message: "Book successfully deleted"});
    } catch(error){
        return res.status(500).json({ message: "Error delete book", error });
    }
}