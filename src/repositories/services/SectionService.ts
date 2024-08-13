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

  public async createSection(section: Omit<Section, 'id' | 'date'>): Promise<Section | null> {
    const newSection = {
      ...section,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    const createdSectionId = await this.queryBuilder.create<Section>(TABLE_NAME, newSection);
    return await this.getSection(createdSectionId);
  }

  public async getSection(id: number): Promise<Section | null> {
    const sections = await this.queryBuilder.read<Section>(TABLE_NAME, { id });
    return sections && sections.length > 0 ? sections[0] : null;
  }

  public async getSecitons(user_id: number): Promise<Section[] | null>{
    return this.queryBuilder.read<Section>(TABLE_NAME, {user_id});
  }

  public async updateSection(id: number, section: Partial<Section>): Promise<Section> {
    const newSection = {
      ...section,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    return this.queryBuilder.update<Section>(TABLE_NAME, section, { id });
  }

  public async deleteSection(id: number): Promise<void> {
    await this.queryBuilder.delete<Section>(TABLE_NAME, { id });
  }
}

export interface Section {
    id?: number;
    user_id: number;
    order: number;
    label: string;
    sec_thumb_path?: string;
    date: Date;
}