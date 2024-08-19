import { QueryBuilder } from '../../utils/QueryBuilder';
const TABLE_NAME = 'SectionOptContent';

export class SectionContentService {
  private static instance: SectionContentService;
  private queryBuilder: QueryBuilder;

  private constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  public static getInstance(): SectionContentService {
    if(!SectionContentService.instance)
      SectionContentService.instance = new SectionContentService();
    return SectionContentService.instance;
  }

  public async createSectionContent(content: Omit<SectionOptContent, 'id'>): Promise<number> {
    return this.queryBuilder.create<SectionOptContent>(TABLE_NAME, content);
  }

  public async getSectionContent(id: number): Promise<SectionOptContent | null> {
    const contents = await this.queryBuilder.read<SectionOptContent>(TABLE_NAME, { id });
    return contents && contents.length > 0 ? contents[0] : null;
  }

  public async getSectionContents(section_label_id: number, book_id: number): Promise<SectionOptContent[] | null> {
    return this.queryBuilder.read<SectionOptContent>(TABLE_NAME, { section_label_id, book_id });
  }

  public async updateSectionContent(id: number, content: Partial<SectionOptContent>): Promise<SectionOptContent> {
    return this.queryBuilder.update<SectionOptContent>(TABLE_NAME, content, { id });
  }

  public async deleteSectionContent(id: number): Promise<void> {
    await this.queryBuilder.delete<SectionOptContent>(TABLE_NAME, { id });
  }
}

export interface SectionOptContent {
    id?: number;
    section_label_id: number;
    book_id: number;
    content: string;
}