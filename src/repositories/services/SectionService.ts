import moment from 'moment';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { toDate } from '../../utils/utils';
import { create } from 'domain';

const TABLE_NAME = 'Section';

export class SectionService {
  private static instance: SectionService;
  private queryBuilder: QueryBuilder;

  private constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  public static getInstance(): SectionService {
    if(!SectionService.instance)
      SectionService.instance = new SectionService();
    return SectionService.instance;
  }

  public async createSection(section: Omit<ISection, 'id' | 'date'>): Promise<ISection | null> {
    const newSection = {
      ...section,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    const createdSectionId = await this.queryBuilder.create<ISection>(TABLE_NAME, newSection);
    return await this.getSection(createdSectionId);
  }

  public async getSection(id: number): Promise<ISection | null> {
    const sections = await this.queryBuilder.read<ISection>(TABLE_NAME, { id });
    return sections && sections.length > 0 ? sections[0] : null;
  }

  public async getSecitons(user_id: number): Promise<ISection[] | null>{
    return this.queryBuilder.read<ISection>(TABLE_NAME, {user_id});
  }

  public async updateSection(id: number, section: Partial<ISection>): Promise<ISection> {
    const newSection = {
      ...section,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    return this.queryBuilder.update<ISection>(TABLE_NAME, section, { id });
  }

  public async deleteSection(id: number): Promise<void> {
    await this.queryBuilder.delete<ISection>(TABLE_NAME, { id });
  }
}

export interface ISection {
    id?: number;
    user_id: number;
    order: number;
    label: string;
    sec_thumb_path?: string;
    date: Date;
}