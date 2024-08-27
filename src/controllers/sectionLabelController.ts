//여기서 label을 CRUD
import { Request, Response } from 'express';
import { SectionLabelService } from '../repositories/services/SectionLabelService';
import { printLog } from '../utils/utils';

export const getSectionLabels = async (req: Request, res: Response) => {
    try {
        printLog('sectionId:' + req.params.id);
        const sectionId = Number.parseInt(req.params.id);
        const sectionLabels = await SectionLabelService.getInstance().getSectionLabels(sectionId);
        return res.status(200).json({sectionLabels});
    } catch (error) {
        return res.status(500).json({ message: "Error fetching sections", error });
    }
}

export const getSectionLabelById = async (req: Request, res: Response) => {
    try {
        const labelId = Number.parseInt(req.params.id);
        const sectionLabel = await SectionLabelService.getInstance().getSectionLabel(labelId);
        if(!sectionLabel)
            return res.status(400).json({message: "Section label not found"});
        return res.status(200).json({sectionLabel});
    } catch (error) {
        return res.status(500).json({ message: "Error fetching sections", error });
    }
}

export const createSectionLabel = async (req: Request, res: Response) => {
    try {
        const {section_id, label_name, order} = req.body;
        await SectionLabelService.getInstance().createSectionLabel({section_id, label_name, order});
        return res.status(201).json({message: "Create section label success"});
    } catch (error) {
        return res.status(400).json({ message: "Error create section label", error });
    }
}

export const updateSectionLabel = async (req: Request, res: Response) => {
    try {
        const labelId = Number.parseInt(req.params.id);
        const existLabel = await SectionLabelService.getInstance().getSectionLabel(labelId);
        if(!existLabel){
            return res.status(404).json({message: "Label not found"});
        }
        const {id, section_id, label_name, order} = req.body;
        await SectionLabelService.getInstance().updateSectionLabel(labelId, {id, section_id, label_name, order});
        return res.status(200).json({message: "Label update success"});
    } catch (error) {
        return res.status(400).json({ message: "Error update section label", error });
    }
}

export const deleteSectionLabel = async (req: Request, res: Response) => {
    //CASECADE 설정으로 sectionContent도 삭제됨
    try {
        const labelId = Number.parseInt(req.params.id);
        const existLabel = await SectionLabelService.getInstance().getSectionLabel(labelId);
        if(!existLabel)
            return res.status(404).json({message: "Section label not found"});
        return res.status(200).json({message: "Section label successfully deleted"});
    } catch (error) {
        return res.status(500).json({ message: "Error delete section label", error });
    }
}