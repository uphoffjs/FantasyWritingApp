import Fuse from 'fuse.js';
import { WorldElement, Project } from '../types';

export interface SearchOptions {
  keys?: string[];
  threshold?: number;
  includeScore?: boolean;
  minMatchCharLength?: number;
  limit?: number;
}

class SearchService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Fuse instances can hold different item types
  private fuseInstances: Map<string, Fuse<any>> = new Map();

  createIndex<T>(items: T[], options?: Fuse.IFuseOptions<T>): string {
    const id = Date.now().toString();
    const defaultOptions: Fuse.IFuseOptions<T> = {
      keys: ['name', 'description', 'content'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
      ...options
    };
    
    const fuse = new Fuse(items, defaultOptions);
    this.fuseInstances.set(id, fuse);
    return id;
  }

  search<T>(indexId: string, query: string, limit?: number): T[] {
    const fuse = this.fuseInstances.get(indexId);
    if (!fuse) {
      console.warn(`Search index ${indexId} not found`);
      return [];
    }

    const results = fuse.search(query, { limit: limit || 10 });
    return results.map(result => result.item);
  }

  searchElements(elements: WorldElement[], query: string, options?: SearchOptions): WorldElement[] {
    if (!elements || elements.length === 0) return [];
    
    const fuseOptions: Fuse.IFuseOptions<WorldElement> = {
      keys: options?.keys || ['name', 'category'],
      threshold: options?.threshold || 0.3,
      includeScore: options?.includeScore || false,
      minMatchCharLength: options?.minMatchCharLength || 2,
    };

    const fuse = new Fuse(elements, fuseOptions);
    const results = fuse.search(query, { limit: options?.limit || 20 });
    
    return results.map(result => result.item);
  }

  searchProjects(projects: Project[], query: string, options?: SearchOptions): Project[] {
    if (!projects || projects.length === 0) return [];
    
    const fuseOptions: Fuse.IFuseOptions<Project> = {
      keys: options?.keys || ['name', 'description'],
      threshold: options?.threshold || 0.3,
      includeScore: options?.includeScore || false,
      minMatchCharLength: options?.minMatchCharLength || 2,
    };

    const fuse = new Fuse(projects, fuseOptions);
    const results = fuse.search(query, { limit: options?.limit || 10 });
    
    return results.map(result => result.item);
  }

  searchAnswers(elements: WorldElement[], query: string, searchInAnswers: boolean = true): WorldElement[] {
    if (!elements || elements.length === 0) return [];
    
    const keys = searchInAnswers 
      ? ['name', 'category', 'answers.value']
      : ['name', 'category'];
    
    const fuseOptions: Fuse.IFuseOptions<WorldElement> = {
      keys,
      threshold: 0.3,
      includeScore: false,
      minMatchCharLength: 2,
      ignoreLocation: true,
      getFn: (obj, path) => {
        if (typeof path === 'string' && path.includes('answers.value')) {
          const answers = (obj as WorldElement).answers;
          if (answers && typeof answers === 'object') {
            return Object.values(answers).join(' ');
          }
        }
        return Fuse.config.getFn(obj, path);
      }
    };

    const fuse = new Fuse(elements, fuseOptions);
    const results = fuse.search(query, { limit: 50 });
    
    return results.map(result => result.item);
  }

  clearIndex(indexId: string): void {
    this.fuseInstances.delete(indexId);
  }

  clearAllIndexes(): void {
    this.fuseInstances.clear();
  }
}

export const searchService = new SearchService();
export default searchService;