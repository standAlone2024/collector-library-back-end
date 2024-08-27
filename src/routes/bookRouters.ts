import express from 'express';
import {getBooks, getBookDetails, createBook, updateBook, deleteBook, searchBooks} from '../controllers/bookController';

const router = express.Router();

router.get('/', searchBooks);
router.get('/:id', getBooks);
router.get('/detail', getBookDetails);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;