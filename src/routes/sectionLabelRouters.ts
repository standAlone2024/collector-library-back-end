import express from 'express';
import {getSectionLabels, createSectionLabel, updateSectionLabel, deleteSectionLabel} from '../controllers/sectionLabelController';

const router = express.Router();

router.get('/:id', getSectionLabels);
router.post('/', createSectionLabel);
router.put('/:id', updateSectionLabel);
router.delete('/:id', deleteSectionLabel);

export default router;