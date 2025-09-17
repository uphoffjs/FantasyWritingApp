import { ElementCategory } from './models';

export type QuestionnaireMode = 'basic' | 'detailed';

export interface QuestionnaireConfig {
  mode: QuestionnaireMode;
  basicQuestionIds: string[];
}

// Define which questions are essential for the basic mode for each element type
export const BASIC_QUESTIONS_CONFIG: Record<ElementCategory | 'custom', string[]> = {
  'character': [
    'name',
    'age', 
    'species',
    'gender',
    'occupation',
    'personality_type',
    'motivations',
    'story_role',
    'first_appearance',
    'arc'
  ],
  'location': [
    'name',
    'type',
    'size',
    'importance',
    'terrain',
    'climate',
    'atmosphere',
    'current_ruler',
    'main_export'
  ],
  'item-object': [
    'name',
    'type',
    'description',
    'origin',
    'purpose',
    'powers',
    'currentOwner'
  ],
  'magic-system': [
    'name',
    'source',
    'energy-cost',
    'who-can-use',
    'limitations',
    'common-uses',
    'rarity'
  ],
  'culture-society': [
    'name',
    'origin-story',
    'core-values',
    'social-structure',
    'government',
    'main-customs',
    'population-size'
  ],
  'race-species': [
    'name',
    'classification',
    'size',
    'appearance',
    'habitat',
    'diet',
    'behavior',
    'intelligence'
  ],
  'organization': [
    'name',
    'type',
    'founding-purpose',
    'size',
    'leadership-type',
    'headquarters',
    'influence-level'
  ],
  'religion-belief': [
    'name',
    'deity-type',
    'core-belief',
    'afterlife-belief',
    'follower-count',
    'main-practices',
    'sacred-text'
  ],
  'technology': [
    'name',
    'classification',
    'basic-principle',
    'primary-function',
    'power-source',
    'rarity',
    'social-impact'
  ],
  'historical-event': [
    'name',
    'date',
    'type',
    'location',
    'summary',
    'key-figures',
    'immediate-cause',
    'historical-importance'
  ],
  'language': [
    'name',
    'classification',
    'status',
    'speakers-count',
    'geographic-distribution',
    'writing-system',
    'associated-cultures'
  ],
  'custom': []
};