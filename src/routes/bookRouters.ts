import express from 'express';
import {getBooks, getBookDetails, createBook, updateBook, deleteBook} from '../controllers/bookController';

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookDetails);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;