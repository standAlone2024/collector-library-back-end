import express from 'express';
import {getSection, getSecitonById, createSection, updateSection, deleteSection, searchSections} from '../controllers/sectionController';

const router = express.Router();

router.get('/search', searchSections);
router.get('/', getSecitonById);
router.get('/:id', getSection);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;