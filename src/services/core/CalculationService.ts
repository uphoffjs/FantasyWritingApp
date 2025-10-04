import { WorldElement, Relationship, Project } from '../../types';

export interface CalculationMetrics {
  totalElements: number;
  elementsByCategory: Record<string, number>;
  totalRelationships: number;
  completionPercentage: number;
  avgAnswersPerElement: number;
  mostConnectedElements: Array<{ element: WorldElement; connectionCount: number }>;
  orphanedElements: WorldElement[];
}

class CalculationService {
  calculateProjectMetrics(project: Project, elements: WorldElement[], relationships: Relationship[]): CalculationMetrics {
    const elementsByCategory: Record<string, number> = {};
    const connectionCounts = new Map<string, number>();
    const orphanedElements: WorldElement[] = [];

    // * Count elements by category
    elements.forEach(element => {
      elementsByCategory[element.category] = (elementsByCategory[element.category] || 0) + 1;
      connectionCounts.set(element.id, 0);
    });

    // * Count relationships for each element
    relationships.forEach(rel => {
      connectionCounts.set(rel.from, (connectionCounts.get(rel.from) || 0) + 1);
      connectionCounts.set(rel.to, (connectionCounts.get(rel.to) || 0) + 1);
    });

    // * Find orphaned elements
    elements.forEach(element => {
      if ((connectionCounts.get(element.id) || 0) === 0) {
        orphanedElements.push(element);
      }
    });

    // * Find most connected elements
    const mostConnectedElements = elements
      .map(element => ({
        element,
        connectionCount: connectionCounts.get(element.id) || 0
      }))
      .sort((a, b) => b.connectionCount - a.connectionCount)
      .slice(0, 5);

    // * Calculate average answers per element
    const totalAnswers = elements.reduce((acc, element) => {
      return acc + Object.keys(element.answers || {}).length;
    }, 0);

    const avgAnswersPerElement = elements.length > 0 
      ? totalAnswers / elements.length 
      : 0;

    // * Calculate completion percentage (simplified)
    const expectedAnswersPerElement = 10; // Assuming 10 questions per element on average
    const completionPercentage = elements.length > 0
      ? Math.min(100, (avgAnswersPerElement / expectedAnswersPerElement) * 100)
      : 0;

    return {
      totalElements: elements.length,
      elementsByCategory,
      totalRelationships: relationships.length,
      completionPercentage,
      avgAnswersPerElement,
      mostConnectedElements,
      orphanedElements
    };
  }

  calculateElementCompletion(element: WorldElement): number {
    const expectedFields = 10; // Base expected fields
    const filledFields = Object.keys(element.answers || {}).length;
    return Math.min(100, (filledFields / expectedFields) * 100);
  }

  calculateRelationshipStrength(fromElement: WorldElement, toElement: WorldElement, relationships: Relationship[]): number {
    const directRelationships = relationships.filter(rel => 
      (rel.from === fromElement.id && rel.to === toElement.id) ||
      (rel.from === toElement.id && rel.to === fromElement.id)
    );

    // * Simple strength calculation based on number of relationships
    return Math.min(100, directRelationships.length * 25);
  }

  suggestNextSteps(metrics: CalculationMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.totalElements < 5) {
      suggestions.push('Add more world elements to build your foundation');
    }

    if (metrics.orphanedElements.length > metrics.totalElements * 0.5) {
      suggestions.push('Connect your orphaned elements to create a more cohesive world');
    }

    if (metrics.avgAnswersPerElement < 5) {
      suggestions.push('Add more details to your existing elements');
    }

    if (metrics.totalRelationships < metrics.totalElements * 0.5) {
      suggestions.push('Create more relationships between your elements');
    }

    if (Object.keys(metrics.elementsByCategory).length < 3) {
      suggestions.push('Diversify your world by adding elements from different categories');
    }

    return suggestions;
  }

  estimateWorldComplexity(metrics: CalculationMetrics): 'Simple' | 'Moderate' | 'Complex' | 'Vast' {
    const score = 
      metrics.totalElements * 2 +
      metrics.totalRelationships * 3 +
      metrics.avgAnswersPerElement * 1.5;

    if (score < 50) return 'Simple';
    if (score < 150) return 'Moderate';
    if (score < 300) return 'Complex';
    return 'Vast';
  }
}

export const calculationService = new CalculationService();
export default calculationService;