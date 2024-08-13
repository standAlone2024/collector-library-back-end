import { QueryBuilder } from '../../utils/_QueryBuilder';
const TABLE_NAME = 'SectionOptContent';

export class SectionContentService {
  private queryBuilder: QueryBuilder;

  constructor() {
    this.queryBuilder = new QueryBuilder();
  }

  async createSectionContent(content: Omit<SectionOptContent, 'id'>): Promise<number> {
    return this.queryBuilder.create<SectionOptContent>(TABLE_NAME, content);
  }

  async getSectionContent(id: number): Promise<SectionOptContent | null> {
    const contents = await this.queryBuilder.read<SectionOptContent>(TABLE_NAME, { id });
    return contents && contents.length > 0 ? contents[0] : null;
  }

  async getSectionContents(section_label_id: number, book_id: number): Promise<SectionOptContent[] | null> {
    return this.queryBuilder.read<SectionOptContent>(TABLE_NAME, { section_label_id, book_id });
  }

  async updateSectionContent(id: number, content: Partial<SectionOptContent>): Promise<SectionOptContent> {
    return this.queryBuilder.update<SectionOptContent>(TABLE_NAME, content, { id });
  }

  async deleteSectionContent(id: number): Promise<void> {
    await this.queryBuilder.delete<SectionOptContent>(TABLE_NAME, { id });
  }
}

export interface SectionOptContent {
    id?: number;
    section_label_id: number;
    book_id: number;
    content: string;
}