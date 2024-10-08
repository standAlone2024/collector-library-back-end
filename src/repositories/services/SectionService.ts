import moment from 'moment';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { toDate } from '../../utils/utils';
import { ISectionOptLabel } from './SectionLabelService';

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

  public async createSection(section: Omit<ISection, 'id' | 'created_date'>): Promise<ISection | null> {
    const newSection = {
      ...section,
      created_date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
      updated_date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
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

  public async searchSections(label: string): Promise<ISectionResult[] | null> {
    const sections = await this.queryBuilder.conditionRead<ISectionResult>({
      mainTable: TABLE_NAME,
      columns: ['id', 'label', 'sec_thumb_path'],
      likeFields: ['label'],
      where: {}
    });
    return sections;
  }

  public async updateSection(id: number, section: Partial<ISection>): Promise<ISection | null> {
    const { created_date, ...updateData } = section;
    const newSection = {
      ...updateData,
      updated_date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    await this.queryBuilder.update<ISection>(TABLE_NAME, newSection, { id });
    return await this.getSection(id);
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
  created_date: Date;
  updated_date?: Date;
}

export interface ISectionNLabel extends ISection {
  label_extra: ISectionOptLabel[];
}
export interface ISectionResult {
  id: number;
  label: string;
  sec_thumb_path?: string;
}