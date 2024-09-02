import express from 'express';
import {getBooks, getBookById,  getBookDetails, createBook, updateBook, deleteBook, searchBooks} from '../controllers/bookController';

const router = express.Router();

router.get('/search', searchBooks);
router.get('/detail', getBookDetails);
router.get('/', getBookById);
router.get('/:id', getBooks);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;