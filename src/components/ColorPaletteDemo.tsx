/* eslint-disable react-native/no-color-literals */
// * This is a demo/showcase file that intentionally uses color literals for illustration
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

/**
 * Color Palette Demo Component
 * Showcases the new fantasy master color palette with renamed colors
 */
export function ColorPaletteDemo() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Fantasy Master Palette
      </Text>

      {/* Attribute Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Attribute Colors
        </Text>

        <View style={styles.colorGroup}>
          <Text style={styles.colorLabel}>Might (Strength)</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, styles.mightLightest]}><Text style={styles.darkText}>Lightest</Text></View>
            <View style={[styles.colorBox, styles.mightLight]}><Text style={styles.darkText}>Light</Text></View>
            <View style={[styles.colorBox, styles.might]}><Text style={styles.lightText}>Base</Text></View>
            <View style={[styles.colorBox, styles.mightDark]}><Text style={styles.lightText}>Dark</Text></View>
            <View style={[styles.colorBox, styles.mightDarkest]}><Text style={styles.lightText}>Darkest</Text></View>
          </View>
        </View>

        <View style={styles.colorGroup}>
          <Text style={styles.colorLabel}>Swiftness (Speed)</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, styles.swiftnessLightest]}><Text style={styles.darkText}>Lightest</Text></View>
            <View style={[styles.colorBox, styles.swiftnessLight]}><Text style={styles.darkText}>Light</Text></View>
            <View style={[styles.colorBox, styles.swiftness]}><Text style={styles.lightText}>Base</Text></View>
            <View style={[styles.colorBox, styles.swiftnessDark]}><Text style={styles.lightText}>Dark</Text></View>
            <View style={[styles.colorBox, styles.swiftnessDarkest]}><Text style={styles.lightText}>Darkest</Text></View>
          </View>
        </View>

        <View style={styles.colorGroup}>
          <Text style={styles.colorLabel}>Vitality (Endurance)</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, styles.vitalityLightest]}><Text style={styles.darkText}>Lightest</Text></View>
            <View style={[styles.colorBox, styles.vitalityLight]}><Text style={styles.darkText}>Light</Text></View>
            <View style={[styles.colorBox, styles.vitality]}><Text style={styles.lightText}>Base</Text></View>
            <View style={[styles.colorBox, styles.vitalityDark]}><Text style={styles.lightText}>Dark</Text></View>
            <View style={[styles.colorBox, styles.vitalityDarkest]}><Text style={styles.lightText}>Darkest</Text></View>
          </View>
        </View>

        <View style={styles.colorGroup}>
          <Text style={styles.colorLabel}>Finesse (Dexterity)</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, styles.finesseLightest]}><Text style={styles.darkText}>Lightest</Text></View>
            <View style={[styles.colorBox, styles.finesseLight]}><Text style={styles.darkText}>Light</Text></View>
            <View style={[styles.colorBox, styles.finesse]}><Text style={styles.lightText}>Base</Text></View>
            <View style={[styles.colorBox, styles.finesseDark]}><Text style={styles.lightText}>Dark</Text></View>
            <View style={[styles.colorBox, styles.finesseDarkest]}><Text style={styles.lightText}>Darkest</Text></View>
          </View>
        </View>
      </View>

      {/* Class Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Class Colors
        </Text>

        <View style={styles.classRow}>
          <View style={[styles.classBox, styles.warrior]}>
            <Text style={styles.classText}>Warrior</Text>
          </View>
          <View style={[styles.classBox, styles.shadow]}>
            <Text style={styles.classText}>Shadow</Text>
          </View>
          <View style={[styles.classBox, styles.hunter]}>
            <Text style={styles.classText}>Hunter</Text>
          </View>
          <View style={[styles.classBox, styles.explorer]}>
            <Text style={styles.classText}>Explorer</Text>
          </View>
          <View style={[styles.classBox, styles.guardian]}>
            <Text style={styles.classText}>Guardian</Text>
          </View>
        </View>
      </View>

      {/* Semantic Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Semantic Colors
        </Text>

        <View style={styles.semanticRow}>
          <View style={[styles.semanticBox, styles.dragonfire]}>
            <Text style={styles.semanticText}>Dragonfire (Error)</Text>
          </View>
          <View style={[styles.semanticBox, styles.elixir]}>
            <Text style={styles.semanticText}>Elixir (Success)</Text>
          </View>
          <View style={[styles.semanticBox, styles.sunburst]}>
            <Text style={styles.semanticText}>Sunburst (Warning)</Text>
          </View>
          <View style={[styles.semanticBox, styles.mystic]}>
            <Text style={styles.semanticText}>Mystic (Info)</Text>
          </View>
        </View>
      </View>

      {/* Metallic Accents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Metallic Accents
        </Text>

        <View style={styles.metalRow}>
          <View style={[styles.metalBox, styles.gold]}>
            <Text style={styles.metalTextDark}>Gold</Text>
          </View>
          <View style={[styles.metalBox, styles.silver]}>
            <Text style={styles.metalTextDark}>Silver</Text>
          </View>
          <View style={[styles.metalBox, styles.bronze]}>
            <Text style={styles.metalTextLight}>Bronze</Text>
          </View>
          <View style={[styles.metalBox, styles.copper]}>
            <Text style={styles.metalTextLight}>Copper</Text>
          </View>
        </View>
      </View>

      {/* Element Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Element Type Colors
        </Text>

        <View style={styles.elementRow}>
          <View style={[styles.elementBox, styles.character]}><Text style={styles.elementText}>Character</Text></View>
          <View style={[styles.elementBox, styles.location]}><Text style={styles.elementText}>Location</Text></View>
          <View style={[styles.elementBox, styles.item]}><Text style={styles.elementText}>Item</Text></View>
          <View style={[styles.elementBox, styles.magic]}><Text style={styles.elementText}>Magic</Text></View>
          <View style={[styles.elementBox, styles.creature]}><Text style={styles.elementText}>Creature</Text></View>
          <View style={[styles.elementBox, styles.culture]}><Text style={styles.elementText}>Culture</Text></View>
          <View style={[styles.elementBox, styles.organization]}><Text style={styles.elementText}>Organization</Text></View>
          <View style={[styles.elementBox, styles.religion]}><Text style={styles.elementText}>Religion</Text></View>
          <View style={[styles.elementBox, styles.technology]}><Text style={styles.elementText}>Technology</Text></View>
          <View style={[styles.elementBox, styles.history]}><Text style={styles.elementText}>History</Text></View>
          <View style={[styles.elementBox, styles.language]}><Text style={styles.elementText}>Language</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2', // parchment-100
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Cinzel', // Note: Custom fonts need to be loaded
    color: '#2E251F', // ink-primary
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel',
    color: '#2E251F',
    marginBottom: 16,
  },
  colorGroup: {
    marginBottom: 16,
  },
  colorLabel: {
    fontFamily: 'Garamond',
    color: '#5C4A3A', // ink-secondary
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorBox: {
    padding: 16,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  // Attribute Colors - Might
  mightLightest: {
    backgroundColor: '#FFE5E5',
  },
  mightLight: {
    backgroundColor: '#FFB3B3',
  },
  might: {
    backgroundColor: '#A31C1C',
  },
  mightDark: {
    backgroundColor: '#7A1515',
  },
  mightDarkest: {
    backgroundColor: '#520E0E',
  },
  // Attribute Colors - Swiftness
  swiftnessLightest: {
    backgroundColor: '#FFF9E5',
  },
  swiftnessLight: {
    backgroundColor: '#FFF0B3',
  },
  swiftness: {
    backgroundColor: '#FFC107',
  },
  swiftnessDark: {
    backgroundColor: '#B38600',
  },
  swiftnessDarkest: {
    backgroundColor: '#805F00',
  },
  // Attribute Colors - Vitality
  vitalityLightest: {
    backgroundColor: '#E5F5E5',
  },
  vitalityLight: {
    backgroundColor: '#B3E5B3',
  },
  vitality: {
    backgroundColor: '#059669',
  },
  vitalityDark: {
    backgroundColor: '#047857',
  },
  vitalityDarkest: {
    backgroundColor: '#065F46',
  },
  // Attribute Colors - Finesse
  finesseLightest: {
    backgroundColor: '#E5E5FF',
  },
  finesseLight: {
    backgroundColor: '#B3B3FF',
  },
  finesse: {
    backgroundColor: '#4338CA',
  },
  finesseDark: {
    backgroundColor: '#3730A3',
  },
  finesseDarkest: {
    backgroundColor: '#312E81',
  },
  // Class Colors
  classRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  classBox: {
    padding: 24,
    borderRadius: 4,
    marginRight: 16,
    marginBottom: 16,
  },
  classText: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel',
  },
  warrior: {
    backgroundColor: '#DC2626',
  },
  shadow: {
    backgroundColor: '#374151',
  },
  hunter: {
    backgroundColor: '#059669',
  },
  explorer: {
    backgroundColor: '#0891B2',
  },
  guardian: {
    backgroundColor: '#7C3AED',
  },
  // Semantic Colors
  semanticRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  semanticBox: {
    padding: 24,
    borderRadius: 4,
    marginRight: 16,
    marginBottom: 16,
  },
  semanticText: {
    color: '#FFFFFF',
    fontFamily: 'Garamond',
  },
  dragonfire: {
    backgroundColor: '#DC2626',
  },
  elixir: {
    backgroundColor: '#059669',
  },
  sunburst: {
    backgroundColor: '#F59E0B',
  },
  mystic: {
    backgroundColor: '#6366F1',
  },
  // Metallic Colors
  metalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metalBox: {
    padding: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 16,
    marginBottom: 16,
  },
  metalTextDark: {
    color: '#2E251F',
    fontFamily: 'Garamond',
  },
  metalTextLight: {
    color: '#FFFFFF',
    fontFamily: 'Garamond',
  },
  gold: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  silver: {
    backgroundColor: '#9CA3AF',
    borderColor: '#6B7280',
  },
  bronze: {
    backgroundColor: '#92400E',
    borderColor: '#78350F',
  },
  copper: {
    backgroundColor: '#A8401C',
    borderColor: '#92400E',
  },
  // Element Type Colors
  elementRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  elementBox: {
    padding: 12,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  elementText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  character: {
    backgroundColor: '#3B82F6',
  },
  location: {
    backgroundColor: '#10B981',
  },
  item: {
    backgroundColor: '#F59E0B',
  },
  magic: {
    backgroundColor: '#8B5CF6',
  },
  creature: {
    backgroundColor: '#EF4444',
  },
  culture: {
    backgroundColor: '#EC4899',
  },
  organization: {
    backgroundColor: '#6366F1',
  },
  religion: {
    backgroundColor: '#14B8A6',
  },
  technology: {
    backgroundColor: '#F97316',
  },
  history: {
    backgroundColor: '#8B5CF6',
  },
  language: {
    backgroundColor: '#06B6D4',
  },
  // Text Styles
  lightText: {
    color: '#FFFFFF',
  },
  darkText: {
    color: '#2E251F',
  },
});