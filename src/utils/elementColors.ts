// Helper function for element-specific colors with WCAG compliance
export function getElementColor(category: string): { bg: string; border: string; text: string } {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    'character': { bg: 'bg-character-light', border: 'border-character-primary', text: 'text-character-primary' },
    'location': { bg: 'bg-location-light', border: 'border-location-primary', text: 'text-location-primary' },
    'item-object': { bg: 'bg-item-light', border: 'border-item-primary', text: 'text-item-primary' },
    'magic-system': { bg: 'bg-magic-light', border: 'border-magic-primary', text: 'text-magic-primary' },
    'culture-society': { bg: 'bg-culture-light', border: 'border-culture-primary', text: 'text-culture-primary' },
    'race-species': { bg: 'bg-creature-light', border: 'border-creature-primary', text: 'text-creature-primary' },
    'organization': { bg: 'bg-organization-light', border: 'border-organization-primary', text: 'text-organization-primary' },
    'religion-belief': { bg: 'bg-religion-light', border: 'border-religion-primary', text: 'text-religion-primary' },
    'technology': { bg: 'bg-technology-light', border: 'border-technology-primary', text: 'text-technology-primary' },
    'historical-event': { bg: 'bg-history-light', border: 'border-history-primary', text: 'text-history-primary' },
    'language': { bg: 'bg-language-light', border: 'border-language-primary', text: 'text-language-primary' },
    'custom': { bg: 'bg-parchment-aged', border: 'border-parchment-border', text: 'text-ink-black' }
  };
  
  return colors[category] || { bg: 'bg-parchment-aged', border: 'border-parchment-border', text: 'text-ink-black' };
}
