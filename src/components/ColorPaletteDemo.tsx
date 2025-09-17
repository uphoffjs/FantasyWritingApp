import React from 'react';
import { View, Text, ScrollView } from 'react-native';

/**
 * Color Palette Demo Component
 * Showcases the new fantasy master color palette with renamed colors
 */
export function ColorPaletteDemo() {
  return (
    <ScrollView className="flex-1 bg-parchment-100 p-4">
      <Text className="text-3xl font-cinzel text-ink-primary mb-6">
        Fantasy Master Palette
      </Text>

      {/* Attribute Colors */}
      <View className="mb-8">
        <Text className="text-xl font-cinzel text-ink-primary mb-4">
          Attribute Colors
        </Text>
        
        <View className="mb-4">
          <Text className="font-garamond text-ink-secondary mb-2">Might (Strength)</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-might-lightest p-4 rounded"><Text className="text-ink-primary">Lightest</Text></View>
            <View className="bg-might-light p-4 rounded"><Text className="text-ink-primary">Light</Text></View>
            <View className="bg-might p-4 rounded"><Text className="text-white">Base</Text></View>
            <View className="bg-might-dark p-4 rounded"><Text className="text-white">Dark</Text></View>
            <View className="bg-might-darkest p-4 rounded"><Text className="text-white">Darkest</Text></View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="font-garamond text-ink-secondary mb-2">Swiftness (Speed)</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-swiftness-lightest p-4 rounded"><Text className="text-ink-primary">Lightest</Text></View>
            <View className="bg-swiftness-light p-4 rounded"><Text className="text-ink-primary">Light</Text></View>
            <View className="bg-swiftness p-4 rounded"><Text className="text-white">Base</Text></View>
            <View className="bg-swiftness-dark p-4 rounded"><Text className="text-white">Dark</Text></View>
            <View className="bg-swiftness-darkest p-4 rounded"><Text className="text-white">Darkest</Text></View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="font-garamond text-ink-secondary mb-2">Vitality (Endurance)</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-vitality-lightest p-4 rounded"><Text className="text-ink-primary">Lightest</Text></View>
            <View className="bg-vitality-light p-4 rounded"><Text className="text-ink-primary">Light</Text></View>
            <View className="bg-vitality p-4 rounded"><Text className="text-white">Base</Text></View>
            <View className="bg-vitality-dark p-4 rounded"><Text className="text-white">Dark</Text></View>
            <View className="bg-vitality-darkest p-4 rounded"><Text className="text-white">Darkest</Text></View>
          </View>
        </View>

        <View className="mb-4">
          <Text className="font-garamond text-ink-secondary mb-2">Finesse (Dexterity)</Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-finesse-lightest p-4 rounded"><Text className="text-ink-primary">Lightest</Text></View>
            <View className="bg-finesse-light p-4 rounded"><Text className="text-ink-primary">Light</Text></View>
            <View className="bg-finesse p-4 rounded"><Text className="text-white">Base</Text></View>
            <View className="bg-finesse-dark p-4 rounded"><Text className="text-white">Dark</Text></View>
            <View className="bg-finesse-darkest p-4 rounded"><Text className="text-white">Darkest</Text></View>
          </View>
        </View>
      </View>

      {/* Class Colors */}
      <View className="mb-8">
        <Text className="text-xl font-cinzel text-ink-primary mb-4">
          Class Colors
        </Text>
        
        <View className="flex-row flex-wrap gap-4 mb-4">
          <View className="bg-warrior-600 p-6 rounded">
            <Text className="text-white font-cinzel">Warrior</Text>
          </View>
          <View className="bg-shadow-700 p-6 rounded">
            <Text className="text-white font-cinzel">Shadow</Text>
          </View>
          <View className="bg-hunter-600 p-6 rounded">
            <Text className="text-white font-cinzel">Hunter</Text>
          </View>
          <View className="bg-explorer-600 p-6 rounded">
            <Text className="text-white font-cinzel">Explorer</Text>
          </View>
          <View className="bg-guardian-600 p-6 rounded">
            <Text className="text-white font-cinzel">Guardian</Text>
          </View>
        </View>
      </View>

      {/* Semantic Colors */}
      <View className="mb-8">
        <Text className="text-xl font-cinzel text-ink-primary mb-4">
          Semantic Colors
        </Text>
        
        <View className="flex-row flex-wrap gap-4">
          <View className="bg-dragonfire p-6 rounded">
            <Text className="text-white font-garamond">Dragonfire (Error)</Text>
          </View>
          <View className="bg-elixir p-6 rounded">
            <Text className="text-white font-garamond">Elixir (Success)</Text>
          </View>
          <View className="bg-sunburst p-6 rounded">
            <Text className="text-white font-garamond">Sunburst (Warning)</Text>
          </View>
          <View className="bg-mystic p-6 rounded">
            <Text className="text-white font-garamond">Mystic (Info)</Text>
          </View>
        </View>
      </View>

      {/* Metallic Accents */}
      <View className="mb-8">
        <Text className="text-xl font-cinzel text-ink-primary mb-4">
          Metallic Accents
        </Text>
        
        <View className="flex-row flex-wrap gap-4">
          <View className="bg-metals-gold p-6 rounded border-2 border-metals-gold-dark">
            <Text className="text-ink-primary font-garamond">Gold</Text>
          </View>
          <View className="bg-metals-silver p-6 rounded border-2 border-metals-silver-dark">
            <Text className="text-ink-primary font-garamond">Silver</Text>
          </View>
          <View className="bg-metals-bronze p-6 rounded border-2 border-metals-bronze-dark">
            <Text className="text-white font-garamond">Bronze</Text>
          </View>
          <View className="bg-metals-copper p-6 rounded border-2 border-metals-copper-dark">
            <Text className="text-white font-garamond">Copper</Text>
          </View>
        </View>
      </View>

      {/* Element Types */}
      <View className="mb-8">
        <Text className="text-xl font-cinzel text-ink-primary mb-4">
          Element Type Colors
        </Text>
        
        <View className="flex-row flex-wrap gap-2">
          <View className="bg-character p-3 rounded"><Text className="text-white text-xs">Character</Text></View>
          <View className="bg-location p-3 rounded"><Text className="text-white text-xs">Location</Text></View>
          <View className="bg-item p-3 rounded"><Text className="text-white text-xs">Item</Text></View>
          <View className="bg-magic p-3 rounded"><Text className="text-white text-xs">Magic</Text></View>
          <View className="bg-creature p-3 rounded"><Text className="text-white text-xs">Creature</Text></View>
          <View className="bg-culture p-3 rounded"><Text className="text-white text-xs">Culture</Text></View>
          <View className="bg-organization p-3 rounded"><Text className="text-white text-xs">Organization</Text></View>
          <View className="bg-religion p-3 rounded"><Text className="text-white text-xs">Religion</Text></View>
          <View className="bg-technology p-3 rounded"><Text className="text-white text-xs">Technology</Text></View>
          <View className="bg-history p-3 rounded"><Text className="text-white text-xs">History</Text></View>
          <View className="bg-language p-3 rounded"><Text className="text-white text-xs">Language</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}