import express from 'express';
import {createContent, updateContent} from '../controllers/sectionContentController';

const router = express.Router();

router.post('/', createContent);
router.put('/:id', updateContent);

export default router;