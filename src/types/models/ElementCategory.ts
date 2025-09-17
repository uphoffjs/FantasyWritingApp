export type ElementCategory = 
  | 'character'
  | 'location'
  | 'item-object'
  | 'magic-system'
  | 'culture-society'
  | 'race-species'
  | 'organization'
  | 'religion-belief'
  | 'technology'
  | 'historical-event'
  | 'language'
  | 'custom';

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  'character',
  'location',
  'item-object',
  'magic-system',
  'culture-society',
  'race-species',
  'organization',
  'religion-belief',
  'technology',
  'historical-event',
  'language',
  'custom'
];

export const ELEMENT_CATEGORY_LABELS: Record<ElementCategory, string> = {
  'character': 'Character',
  'location': 'Location',
  'item-object': 'Item/Object',
  'magic-system': 'Magic/Power System',
  'culture-society': 'Culture/Society',
  'race-species': 'Race/Species',
  'organization': 'Organization',
  'religion-belief': 'Religion/Belief System',
  'technology': 'Technology',
  'historical-event': 'Historical Event',
  'language': 'Language',
  'custom': 'Custom'
};

export const ELEMENT_CATEGORY_ICONS: Record<ElementCategory, string> = {
  'character': 'User',
  'location': 'MapPin',
  'item-object': 'Package',
  'magic-system': 'Sparkles',
  'culture-society': 'Users',
  'race-species': 'Heart',
  'organization': 'Building',
  'religion-belief': 'Book',
  'technology': 'Cpu',
  'historical-event': 'Calendar',
  'language': 'MessageSquare',
  'custom': 'Puzzle'
};