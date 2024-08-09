import moment from 'moment';
import { QueryBuilder } from '../../utils/queryBuilder';
import { toDate } from '../../utils/utils';

const TABLE_NAME = 'Section';

export class SectionService {
  private queryBuilder: QueryBuilder;

  constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  async createSection(section: Omit<Section, 'id' | 'date'>): Promise<Section> {
    const newSection = {
      ...section,
      date: toDate(moment().format('YYYY-MM-DD HH:mm:ss')),
    }
    return this.queryBuilder.create<Section>(TABLE_NAME, section);
  }

  async getSection(id: number): Promise<Section | null> {
    const sections = await this.queryBuilder.read<Section>(TABLE_NAME, { id });
    return sections && sections.length > 0 ? sections[0] : null;
  }

  async getSecitons(user_id: number): Promise<Section[] | null>{
    return this.queryBuilder.read<Section>(TABLE_NAME, {user_id});
  }

  async updateSection(id: number, section: Partial<Section>): Promise<Section> {
    return this.queryBuilder.update<Section>(TABLE_NAME, section, { id });
  }

  async deleteSection(id: number): Promise<void> {
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