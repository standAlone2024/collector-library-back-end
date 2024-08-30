import { Request, Response } from 'express';
import { BookKeywordService } from '../repositories/services/BookKeywordService';
import { printLog } from '../utils/utils';

export const getKeywords = async (req: Request, res: Response) => {
    try {
        const bookId = Number.parseInt(req.params.id as string) || 0;
        printLog("bookId " + bookId);
        if(bookId === 0)
            return res.status(400).json({message: "book id is not sent"});
        const keywords = await BookKeywordService.getInstance().getKeywords(bookId);
        return res.status(200).json({keywords});
    } catch(error){
        return res.status(500).json({ message: "Error fetching keywords", error });
    }
}

export const getKeywordById = async (req: Request, res: Response) => {
    try{
        const keywordId = Number.parseInt(req.params.id);
        const keyword = await BookKeywordService.getInstance().getKeyword(keywordId);
        return res.status(200).json({keyword});
    } catch(error){
        return res.status(500).json({message: "Error fetching a keyword"});
    }
}

export const createKeyword = async (req: Request, res: Response) => {
    try {
        const {book_id, extracted_keyword} = req.body;
        const newKeyword = await BookKeywordService.getInstance().createKeyword({book_id, extracted_keyword});
        return res.status(201).json({keyword: newKeyword});
    } catch(error){
        return res.status(400).json({ message: "Error create keyword", error });
    }
}

export const updateKeyword = async (req: Request, res: Response) => {
    try {
        const keywordId = Number.parseInt(req.params.id);
        const existKeyword = await BookKeywordService.getInstance().getKeyword(keywordId);
        if(!existKeyword)
            return res.status(404).json({message: "Keyword is not found"});
        const {id, book_id, extracted_keyword, created_date} = req.body;
        const updatedKeyword = await BookKeywordService.getInstance().updateKeyword(keywordId, {id, book_id, extracted_keyword, created_date})
        return res.status(200).json({keyword: updatedKeyword});
    } catch(error){
        return res.status(400).json({ message: "Error update keyword", error });
    }
}

export const deleteKeyword = async (req: Request, res: Response) => {
    try {
        const keywordId = Number.parseInt(req.params.id);
        const existKeyword = await BookKeywordService.getInstance().getKeyword(keywordId);
        if(!existKeyword)
            return res.status(404).json({message: "Keyword is not found"});
        await BookKeywordService.getInstance().deleteKeyword(keywordId);
        return res.status(200).json({message: "Keyword successfully deleted"});
    } catch(error){
        return res.status(500).json({ message: "Error delete keyword", error });
    }
}