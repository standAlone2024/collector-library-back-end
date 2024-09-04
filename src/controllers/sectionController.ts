import { Request, Response } from 'express';
import { ISection, ISectionNLabel, SectionService } from '../repositories/services/SectionService';
import { printLog } from '../utils/utils';
import { ISectionOptLabel, SectionLabelService } from '../repositories/services/SectionLabelService';

export const getSection = async (req: Request, res: Response) => {
    try {
        printLog('userId: ' + req.params.id);
        const userId = Number.parseInt(req.params.id);
        const sections = await SectionService.getInstance().getSecitons(userId);
        return res.status(200).json({ sections });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching sections", error });
    }
};

export const searchSections = async (req: Request, res: Response) => {
    try {
        const { keyword } = req.query as { keyword: string };
        if(!keyword || typeof keyword !== 'string')
            return res.status(400).json({message: "Keyword is not found"});
        printLog('keyword: ' + keyword);
        const sections = await SectionService.getInstance().searchSections(keyword);
        return res.status(200).json({ sections });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching sections", error });
    }
};

export const getSecitonById = async (req: Request, res: Response) => {
    try {
        const id = Number.parseInt(req.query.id as string) || 0;
        const section = await SectionService.getInstance().getSection(id);
        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }
        const labelExtra = await SectionLabelService.getInstance().getSectionLabels(id);
        const sectionNLabel: ISectionNLabel = {
            ...section,
            label_extra: (labelExtra) ? labelExtra : []
        };
        return res.status(200).json({ section: sectionNLabel });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching Section", error });
    }
};

export const createSection = async (req: Request, res: Response) => {
    try {
        const { user_id, order, label, sec_thumb_path } = req.body;
        // printLog(user_id, order, label, sec_thumb_path);
        const newSection = await SectionService.getInstance().createSection({user_id, order, label, sec_thumb_path});
        return res.status(201).json({section: newSection});
    } catch (error) {
        return res.status(400).json({ message: "Error creating section", error });
    }
};

export const updateSection = async (req: Request, res: Response) => {
    try {
        const id = Number.parseInt(req.params.id);
        const existSection = await SectionService.getInstance().getSection(id);
        if (!existSection) {
            return res.status(404).json({ message: "Section not found" });
        }
        // const {user_id, order, label, sec_thumb_path} = req.body;
        const sectionNLabel = req.body as ISectionNLabel;
        if(sectionNLabel) {
            const section = extractSection(sectionNLabel);
            if(section)
            {
                const updatedSection = await SectionService.getInstance().updateSection(id, section);
                const labels: ISectionOptLabel[] = sectionNLabel.label_extra;
                if(labels && labels.length > 0){
                    labels.map(async(label) => {
                        await SectionLabelService.getInstance().updateSectionLabel(label.id as number, label);
                    })
                }

                const labelExtra = await SectionLabelService.getInstance().getSectionLabels(id);
                const newSectionNLabel: ISectionNLabel = {
                    ...updatedSection as ISection,
                    label_extra: (labelExtra) ? labelExtra : []
                };
                return res.status(200).json({section: newSectionNLabel});
            }
            else {

            }
            
        }else
            throw new Error("Data type is not matched");
    } catch (error) {
        return res.status(400).json({ message: "Error updating section", error });
    }
};

const extractSection = (sectionNLabel: ISectionNLabel) => {
    if(sectionNLabel) {
        const section: ISection = {
            id: sectionNLabel.id,
            user_id: sectionNLabel.user_id,
            order: sectionNLabel.order,
            label: sectionNLabel.label,
            sec_thumb_path: sectionNLabel.sec_thumb_path,
            created_date: sectionNLabel.created_date,
            updated_date: sectionNLabel.updated_date,
        }
        return section;
    }
    else
        return null;
}
export const deleteSection = async (req: Request, res: Response) => {
    //DB CASECADE 설정으로 section이 삭제되면, book, sectionLabel, sectionContent가 다 같이 삭제
    try {
        const id = Number.parseInt(req.params.id);
        const existSection = await SectionService.getInstance().getSection(id);
        if (!existSection) {
            return res.status(404).json({ message: "Seciton not found" });
        }
        await SectionService.getInstance().deleteSection(id);
        return res.status(200).json({ message: "Seciton successfully deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting seciton", error });
    }
};