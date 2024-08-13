import express from 'express';
import {getSection, getSecitonById, createSection, updateSection, deleteLibrary} from '../controllers/sectionController';

const router = express.Router();

router.get('/', getSection);
router.get('/:id', getSecitonById);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteLibrary);

export default router;