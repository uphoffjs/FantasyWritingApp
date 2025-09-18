/**
 * Maps element categories between app format (hyphenated) and database format (underscored)
 */

import { ElementCategory } from '../types/worldbuilding';

// * Map from app categories to Supabase categories
const APP_TO_DB_CATEGORY_MAP: Record<string, string> = {
  'character': 'character',
  'location': 'location',
  'item-object': 'item',
  'magic-system': 'magic_system',
  'culture-society': 'culture',
  'race-species': 'creature',
  'organization': 'organization',
  'religion-belief': 'religion',
  'technology': 'technology',
  'historical-event': 'historical_event',
  'language': 'language',
  'custom': 'custom'
};

// * Reverse map from Supabase categories to app categories
const DB_TO_APP_CATEGORY_MAP: Record<string, ElementCategory> = {
  'character': 'character',
  'location': 'location',
  'item': 'item-object',
  'magic_system': 'magic-system',
  'culture': 'culture-society',
  'creature': 'race-species',
  'organization': 'organization',
  'religion': 'religion-belief',
  'technology': 'technology',
  'historical_event': 'historical-event',
  'language': 'language',
  'custom': 'custom'
};

/**
 * Convert app category format (hyphenated) to database format (underscored)
 */
export function mapCategoryToDb(appCategory: ElementCategory): string {
  return APP_TO_DB_CATEGORY_MAP[appCategory] || 'custom';
}

/**
 * Convert database category format (underscored) to app format (hyphenated)
 */
export function mapCategoryFromDb(dbCategory: string): ElementCategory {
  return DB_TO_APP_CATEGORY_MAP[dbCategory] || 'custom';
}

/**
 * Check if a category is valid for the database
 */
export function isValidDbCategory(category: string): boolean {
  const validCategories = [
    'character', 'location', 'magic_system', 'culture', 
    'creature', 'organization', 'religion', 'technology',
    'historical_event', 'language', 'item', 'custom'
  ];
  return validCategories.includes(category);
}

/**
 * Get emoji icon for a category
 */
export function getCategoryIcon(category: ElementCategory | string): string {
  const icons: Record<string, string> = {
    'character': '👤',
    'location': '📍',
    'item-object': '🏺',
    'item': '🏺',
    'magic-system': '✨',
    'magic_system': '✨',
    'culture-society': '🏛',
    'culture': '🏛',
    'race-species': '🧬',
    'creature': '🧬',
    'organization': '🏢',
    'religion-belief': '⛪',
    'religion': '⛪',
    'technology': '⚙️',
    'historical-event': '📜',
    'historical_event': '📜',
    'language': '💬',
    'custom': '📝'
  };
  return icons[category] || '📝';
}