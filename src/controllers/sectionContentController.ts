import { Request, Response } from 'express';
import { SectionContentService } from '../repositories/services/SectionContentService';
import { printLog } from '../utils/utils';

export const createContent = async (req: Request, res: Response) => {
    try {
        const { section_label_id, book_id, content } = req.body;
        await SectionContentService.getInstance().createSectionContent({section_label_id, book_id, content});
        res.status(201);
    } catch (error) {
        res.status(400).json({ message: "Error creating section content", error });
    }
};

export const updateContent = async (req: Request, res: Response) => {
    try {
        const contentId = Number.parseInt(req.params.id);
        const existSection = await SectionContentService.getInstance().getSectionContent(contentId);
        if (!existSection) {
            return res.status(404).json({ message: "Section content not found" });
        }
        const {id, section_label_id, book_id, content} = req.body;
        await SectionContentService.getInstance().updateSectionContent(id, {id, section_label_id, book_id, content});
        res.status(200);
    } catch (error) {
        res.status(400).json({ message: "Error updating section content", error });
    }
};

//delete의 경우 CASECADE 설정이 되어 있어서 content에 대해서는 필요 없음
//read도 bookService에 join 되어 읽히고 있으므로 필요 없음