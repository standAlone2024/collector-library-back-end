import { QueryBuilder } from '../../utils/queryBuilder';

const TABLE_NAME = 'SectionOptLabel';

export class SectionLabelService {
  private queryBuilder: QueryBuilder;

  constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  async createSectionLabel(sectionLabel: Omit<SectionOptLabel, 'id'>): Promise<SectionOptLabel> {  
    return this.queryBuilder.create<SectionOptLabel>(TABLE_NAME, sectionLabel);
  }

  async getSectionLabel(id: number): Promise<SectionOptLabel | null> {
    const labels = await this.queryBuilder.read<SectionOptLabel>(TABLE_NAME, { id });
    return labels && labels.length > 0 ? labels[0] : null;
  }

  async getSectionLabels(section_id: number): Promise<SectionOptLabel[] | null> {
    return this.queryBuilder.read<SectionOptLabel>(TABLE_NAME , {section_id});
  }

  async updateSectionLabel(id: number, sectionLabel: Partial<SectionOptLabel>): Promise<SectionOptLabel> {
    return this.queryBuilder.update<SectionOptLabel>(TABLE_NAME, sectionLabel, { id });
  }

  async deleteSectionLabel(id: number): Promise<void> {
    await this.queryBuilder.delete<SectionOptLabel>(TABLE_NAME, { id });
  }
}

export interface SectionOptLabel {
    id?: number;
    section_id: number;
    level_name: string;
    order: number;
  }