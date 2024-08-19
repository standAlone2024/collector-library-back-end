import { Request, Response } from 'express';
import { BookService } from '../repositories/services/BookService';
// import { printLog } from '../utils/utils';

export const getBooks = async (req: Request, res: Response) => {
    try {
        const sectionId = Number.parseInt(req.query.id as string) || 0;
        const books = await BookService.getInstance().getBooks(sectionId);
        res.status(200).json({books});
    } catch(error){
        res.status(500).json({ message: "Error fetching books", error });
    }
}

//GET /book-details/1?page=2&pageSize=20
export const getBookDetails = async (req: Request, res: Response) => {
    try {
        const sectionId = Number.parseInt(req.params.id);
        const page = Number.parseInt(req.query.page as string) || 1;
        const pageSize = Number.parseInt(req.query.pageSize as string) || 10;
        const bookDetails = await BookService.getInstance().getBookDetail(sectionId, page, pageSize);
        res.status(200).json({bookDetails});
    } catch(error){
        res.status(500).json({ message: "Error fetching bookDeatils", error });
    }
}

export const getBookById = async (req: Request, res: Response) => {
    try{
        const bookId = Number.parseInt(req.params.id);
        const book = await BookService.getInstance().getBook(bookId);
        res.status(200).json({book});
    } catch(error){
        res.status(500).json({message: "Error fetching a book"});
    }
}

export const createBook = async (req: Request, res: Response) => {
    try {
        const {section_id, order, title, book_thumb_path, description} = req.body;
        await BookService.getInstance().createBook({section_id, order, title, book_thumb_path, description});
        res.status(201);
    } catch(error){
        res.status(400).json({ message: "Error create book", error });
    }
}

export const updateBook = async (req: Request, res: Response) => {
    try {
        const bookId = Number.parseInt(req.params.id);
        const existBook = await BookService.getInstance().getBook(bookId);
        if(!existBook)
            res.status(404).json({message: "Book not found"});
        const {id, section_id, order, title, book_thumb_path, description, date} = req.body;
        await BookService.getInstance().updateBook(bookId, {id, section_id, order, title, book_thumb_path, description, date});
        res.status(200).json({message: "Update book success"});
    } catch(error){
        res.status(400).json({ message: "Error update book", error });
    }
}

export const deleteBook = async (req: Request, res: Response) => {
    try {
        const bookId = Number.parseInt(req.params.id);
        const existBook = await BookService.getInstance().getBook(bookId);
        if(!existBook)
            return res.status(404).json({message: "Book not found"});
        await BookService.getInstance().deleteBook(bookId);
        res.status(200).json({message: "Book successfully deleted"});
    } catch(error){
        res.status(500).json({ message: "Error delete book", error });
    }
}