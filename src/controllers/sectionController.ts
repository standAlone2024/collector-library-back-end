import { Request, Response } from 'express';
import { SectionService, Section } from '../repositories/services/SectionService';
import { toDate } from '../utils/utils';
import moment from 'moment';

export const getSection = async (req: Request, res: Response) => {
    try {
        const userId = Number.parseInt(req.params.userId);
        const sections = await SectionService.getInstance().getSecitons(userId);
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sections", error });
    }
};

export const getSecitonById = async (req: Request, res: Response) => {
    try {
        const id = Number.parseInt(req.params.id);
        const section = await SectionService.getInstance().getSection(id);
        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }
        res.status(200).json(section);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Section", error });
    }
};

export const createSection = async (req: Request, res: Response) => {
    try {
        const { userId, order, label, sec_thumb_path } = req.body;
        await SectionService.getInstance().createSection({user_id: userId, order, label, sec_thumb_path});
        res.status(201);
    } catch (error) {
        res.status(400).json({ message: "Error creating library", error });
    }
};

export const updateSection = async (req: Request, res: Response) => {
    try {
        const id = Number.parseInt(req.params.id);
        const existSection = await SectionService.getInstance().getSection(id);
        if (!existSection) {
            return res.status(404).json({ message: "Library not found" });
        }
        const {userId, order, label, sec_thumb_path} = req.body;
        await SectionService.getInstance().updateSection(id, {user_id: userId, order, label, sec_thumb_path});
        res.status(200);
    } catch (error) {
        res.status(400).json({ message: "Error updating library", error });
    }
};

export const deleteLibrary = async (req: Request, res: Response) => {
    try {
        const id = Number.parseInt(req.params.id);
        const existSection = await SectionService.getInstance().getSection(id);
        if (!existSection) {
            return res.status(404).json({ message: "Seciton not found" });
        }
        await SectionService.getInstance().deleteSection(id);
        res.status(200).json({ message: "Seciton successfully deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting seciton", error });
    }
};