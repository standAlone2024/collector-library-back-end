import express from 'express';
import {getSection, createSection, updateSection, deleteSection} from '../controllers/sectionController';

const router = express.Router();

router.get('/:id', getSection);
// router.get('/:id', getSecitonById);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;