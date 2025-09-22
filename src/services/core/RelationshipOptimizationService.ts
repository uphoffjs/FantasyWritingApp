/**
 * @fileoverview Relationship Optimization Service
 * Analyzes and optimizes relationships between world elements for better storytelling
 *
 * Purpose:
 * - Analyze relationship patterns and strength
 * - Suggest new relationships based on element properties
 * - Optimize relationship networks for narrative coherence
 * - Identify relationship gaps and redundancies
 */

import { WorldElement, Relationship } from '../../types';

export interface RelationshipSuggestion {
  id: string;
  sourceElement: WorldElement;
  targetElement: WorldElement;
  suggestedType: string;
  reason: string;
  confidence: number; // 0-100
  category: 'narrative' | 'logical' | 'thematic' | 'structural';
}

export interface RelationshipAnalysis {
  networkDensity: number; // 0-100, how connected the world is
  averageConnections: number;
  isolatedElements: WorldElement[];
  overConnectedElements: WorldElement[];
  strongestConnections: Array<{
    relationship: Relationship;
    strength: number;
  }>;
  weakestConnections: Array<{
    relationship: Relationship;
    strength: number;
  }>;
  suggestions: RelationshipSuggestion[];
}

export interface OptimizationRecommendation {
  type: 'add' | 'remove' | 'strengthen' | 'weaken' | 'modify';
  relationshipId?: string;
  suggestion?: RelationshipSuggestion;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  priority: number; // 1-10
}

class RelationshipOptimizationService {
  /**
   * Analyze the relationship network of a project
   */
  analyzeRelationships(elements: WorldElement[], relationships: Relationship[]): RelationshipAnalysis {
    const networkDensity = this.calculateNetworkDensity(elements, relationships);
    const averageConnections = this.calculateAverageConnections(elements, relationships);
    const isolatedElements = this.findIsolatedElements(elements, relationships);
    const overConnectedElements = this.findOverConnectedElements(elements, relationships);
    const connectionStrengths = this.analyzeConnectionStrengths(relationships, elements);
    const suggestions = this.generateRelationshipSuggestions(elements, relationships);

    return {
      networkDensity,
      averageConnections,
      isolatedElements,
      overConnectedElements,
      strongestConnections: connectionStrengths.strongest,
      weakestConnections: connectionStrengths.weakest,
      suggestions
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(
    elements: WorldElement[],
    relationships: Relationship[]
  ): OptimizationRecommendation[] {
    const analysis = this.analyzeRelationships(elements, relationships);
    const recommendations: OptimizationRecommendation[] = [];

    // Recommendations for isolated elements
    analysis.isolatedElements.forEach(element => {
      const suggestion = analysis.suggestions.find(s =>
        s.sourceElement.id === element.id || s.targetElement.id === element.id
      );

      if (suggestion) {
        recommendations.push({
          type: 'add',
          suggestion,
          reason: `${element.name} is isolated and should be connected to the world`,
          impact: 'high',
          priority: 8
        });
      }
    });

    // Recommendations for over-connected elements
    analysis.overConnectedElements.forEach(element => {
      const weakConnections = analysis.weakestConnections.filter(wc =>
        relationships.find(r => r.id === wc.relationship.id &&
          (r.from === element.id || r.to === element.id))
      );

      weakConnections.slice(0, 2).forEach(weak => {
        recommendations.push({
          type: 'remove',
          relationshipId: weak.relationship.id,
          reason: `${element.name} is over-connected; remove weak relationships`,
          impact: 'medium',
          priority: 5
        });
      });
    });

    // Recommendations for strengthening important relationships
    analysis.suggestions
      .filter(s => s.confidence > 75 && s.category === 'narrative')
      .slice(0, 3)
      .forEach(suggestion => {
        recommendations.push({
          type: 'add',
          suggestion,
          reason: `High-confidence narrative connection`,
          impact: 'high',
          priority: 9
        });
      });

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate how densely connected the network is
   */
  private calculateNetworkDensity(elements: WorldElement[], relationships: Relationship[]): number {
    if (elements.length < 2) return 0;

    const maxPossibleConnections = elements.length * (elements.length - 1) / 2;
    const actualConnections = relationships.length;

    return Math.min(100, (actualConnections / maxPossibleConnections) * 100);
  }

  /**
   * Calculate average number of connections per element
   */
  private calculateAverageConnections(elements: WorldElement[], relationships: Relationship[]): number {
    if (elements.length === 0) return 0;

    const connectionCounts = new Map<string, number>();
    elements.forEach(element => {
      connectionCounts.set(element.id, 0);
    });

    relationships.forEach(rel => {
      connectionCounts.set(rel.from, (connectionCounts.get(rel.from) || 0) + 1);
      connectionCounts.set(rel.to, (connectionCounts.get(rel.to) || 0) + 1);
    });

    const totalConnections = Array.from(connectionCounts.values()).reduce((sum, count) => sum + count, 0);
    return totalConnections / elements.length;
  }

  /**
   * Find elements with no connections
   */
  private findIsolatedElements(elements: WorldElement[], relationships: Relationship[]): WorldElement[] {
    const connectedElementIds = new Set<string>();

    relationships.forEach(rel => {
      connectedElementIds.add(rel.from);
      connectedElementIds.add(rel.to);
    });

    return elements.filter(element => !connectedElementIds.has(element.id));
  }

  /**
   * Find elements with too many connections (>75th percentile)
   */
  private findOverConnectedElements(elements: WorldElement[], relationships: Relationship[]): WorldElement[] {
    const connectionCounts = new Map<string, number>();

    elements.forEach(element => {
      connectionCounts.set(element.id, 0);
    });

    relationships.forEach(rel => {
      connectionCounts.set(rel.from, (connectionCounts.get(rel.from) || 0) + 1);
      connectionCounts.set(rel.to, (connectionCounts.get(rel.to) || 0) + 1);
    });

    const counts = Array.from(connectionCounts.values()).sort((a, b) => b - a);
    const threshold = counts[Math.floor(counts.length * 0.25)] || 5; // Top 25% or 5+ connections

    return elements.filter(element => (connectionCounts.get(element.id) || 0) >= threshold);
  }

  /**
   * Analyze relationship strengths
   */
  private analyzeConnectionStrengths(relationships: Relationship[], elements: WorldElement[]): {
    strongest: Array<{ relationship: Relationship; strength: number }>;
    weakest: Array<{ relationship: Relationship; strength: number }>;
  } {
    const strengthScores = relationships.map(rel => {
      const strength = this.calculateRelationshipStrength(rel, elements);
      return { relationship: rel, strength };
    });

    const sorted = strengthScores.sort((a, b) => b.strength - a.strength);

    return {
      strongest: sorted.slice(0, 5),
      weakest: sorted.slice(-5).reverse()
    };
  }

  /**
   * Calculate strength of a relationship based on element compatibility
   */
  private calculateRelationshipStrength(relationship: Relationship, elements: WorldElement[]): number {
    const sourceElement = elements.find(e => e.id === relationship.from);
    const targetElement = elements.find(e => e.id === relationship.to);

    if (!sourceElement || !targetElement) return 0;

    let strength = 50; // Base strength

    // Same category elements have natural affinity
    if (sourceElement.category === targetElement.category) {
      strength += 20;
    }

    // Complementary categories (e.g., character + location)
    const complementaryPairs = [
      ['character', 'location'],
      ['character', 'organization'],
      ['magic-system', 'character'],
      ['culture', 'location'],
      ['technology', 'culture']
    ];

    const isComplementary = complementaryPairs.some(pair =>
      (pair.includes(sourceElement.category) && pair.includes(targetElement.category))
    );

    if (isComplementary) {
      strength += 15;
    }

    // Relationship type quality
    const strongRelationshipTypes = ['family', 'mentor', 'rival', 'located_in', 'rules', 'created_by'];
    if (strongRelationshipTypes.includes(relationship.type)) {
      strength += 10;
    }

    // Description quality
    if (relationship.description && relationship.description.length > 20) {
      strength += 10;
    }

    // Tags similarity
    const sourceTags = sourceElement.tags || [];
    const targetTags = targetElement.tags || [];
    const commonTags = sourceTags.filter(tag => targetTags.includes(tag));
    strength += Math.min(15, commonTags.length * 3);

    return Math.min(100, Math.max(0, strength));
  }

  /**
   * Generate suggestions for new relationships
   */
  private generateRelationshipSuggestions(
    elements: WorldElement[],
    relationships: Relationship[]
  ): RelationshipSuggestion[] {
    const suggestions: RelationshipSuggestion[] = [];
    const existingPairs = new Set(
      relationships.map(rel => `${rel.from}-${rel.to}`)
    );

    // Generate suggestions for each element pair
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const source = elements[i];
        const target = elements[j];
        const pairKey = `${source.id}-${target.id}`;
        const reversePairKey = `${target.id}-${source.id}`;

        // Skip if relationship already exists
        if (existingPairs.has(pairKey) || existingPairs.has(reversePairKey)) {
          continue;
        }

        const suggestion = this.generateSuggestionForPair(source, target);
        if (suggestion && suggestion.confidence > 30) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Return top 10 suggestions
  }

  /**
   * Generate a relationship suggestion for a specific element pair
   */
  private generateSuggestionForPair(source: WorldElement, target: WorldElement): RelationshipSuggestion | null {
    let confidence = 0;
    let suggestedType = 'related_to';
    let reason = '';
    let category: RelationshipSuggestion['category'] = 'logical';

    // Category-based suggestions
    if (source.category === 'character' && target.category === 'location') {
      suggestedType = 'lives_in';
      reason = 'Characters often have residential connections to locations';
      confidence = 60;
      category = 'logical';
    } else if (source.category === 'character' && target.category === 'organization') {
      suggestedType = 'member_of';
      reason = 'Characters frequently belong to organizations';
      confidence = 55;
      category = 'logical';
    } else if (source.category === 'character' && target.category === 'character') {
      suggestedType = 'knows';
      reason = 'Characters in the same world often know each other';
      confidence = 40;
      category = 'narrative';
    } else if (source.category === 'magic-system' && target.category === 'character') {
      suggestedType = 'practices';
      reason = 'Characters may practice different magic systems';
      confidence = 50;
      category = 'thematic';
    } else if (source.category === 'culture' && target.category === 'location') {
      suggestedType = 'originates_from';
      reason = 'Cultures are typically associated with specific locations';
      confidence = 65;
      category = 'logical';
    }

    // Tag-based boost
    const sourceTags = source.tags || [];
    const targetTags = target.tags || [];
    const commonTags = sourceTags.filter(tag => targetTags.includes(tag));
    confidence += commonTags.length * 10;

    // Name similarity boost (simple heuristic)
    if (source.name.toLowerCase().includes(target.name.toLowerCase().split(' ')[0]) ||
        target.name.toLowerCase().includes(source.name.toLowerCase().split(' ')[0])) {
      confidence += 15;
      reason += ' (names suggest connection)';
    }

    if (confidence < 30) return null;

    return {
      id: `suggestion-${source.id}-${target.id}`,
      sourceElement: source,
      targetElement: target,
      suggestedType,
      reason,
      confidence: Math.min(100, confidence),
      category
    };
  }

  /**
   * Validate a relationship suggestion before applying
   */
  validateSuggestion(suggestion: RelationshipSuggestion, elements: WorldElement[]): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check if elements still exist
    const sourceExists = elements.some(e => e.id === suggestion.sourceElement.id);
    const targetExists = elements.some(e => e.id === suggestion.targetElement.id);

    if (!sourceExists) {
      issues.push('Source element no longer exists');
    }
    if (!targetExists) {
      issues.push('Target element no longer exists');
    }

    // Check for logical consistency
    if (suggestion.suggestedType === 'lives_in' &&
        suggestion.targetElement.category !== 'location') {
      issues.push('Cannot live in a non-location element');
    }

    if (suggestion.suggestedType === 'member_of' &&
        suggestion.targetElement.category !== 'organization') {
      issues.push('Cannot be member of a non-organization element');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Create and export singleton instance
export const relationshipOptimizationService = new RelationshipOptimizationService();
export default relationshipOptimizationService;