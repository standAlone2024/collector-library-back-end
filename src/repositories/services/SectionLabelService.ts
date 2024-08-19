import { QueryBuilder } from '../../utils/QueryBuilder';

const TABLE_NAME = 'SectionOptLabel';

export class SectionLabelService {
  private static instance: SectionLabelService;
  private queryBuilder: QueryBuilder;

  private constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  public static getInstance(): SectionLabelService {
    if(!SectionLabelService.instance)
      SectionLabelService.instance = new SectionLabelService();
    return SectionLabelService.instance;
  }

  public async createSectionLabel(sectionLabel: Omit<ISectionOptLabel, 'id'>): Promise<number> {  
    return this.queryBuilder.create<ISectionOptLabel>(TABLE_NAME, sectionLabel);
  }

  public async getSectionLabel(id: number): Promise<ISectionOptLabel | null> {
    const labels = await this.queryBuilder.read<ISectionOptLabel>(TABLE_NAME, { id });
    return labels && labels.length > 0 ? labels[0] : null;
  }

  public async getSectionLabels(section_id: number): Promise<ISectionOptLabel[] | null> {
    return this.queryBuilder.read<ISectionOptLabel>(TABLE_NAME , {section_id});
  }

  public async updateSectionLabel(id: number, sectionLabel: Partial<ISectionOptLabel>): Promise<ISectionOptLabel> {
    return this.queryBuilder.update<ISectionOptLabel>(TABLE_NAME, sectionLabel, { id });
  }

  public async deleteSectionLabel(id: number): Promise<void> {
    await this.queryBuilder.delete<ISectionOptLabel>(TABLE_NAME, { id });
  }
}

export interface ISectionOptLabel {
  id?: number;
  section_id: number;
  label_name: string;
  order: number;
}