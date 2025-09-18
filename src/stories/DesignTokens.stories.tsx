/**
 * Design Tokens Documentation
 * Visual showcase of the Fantasy Master color palette and design system
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { tokens } from '../design-tokens/tokens';

// * Component to display color swatches
const ColorSwatch = ({ name, value, path }: { name: string; value: string; path: string }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div 
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: value,
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      />
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#666' }}>
          {path}
        </div>
        <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{name}</div>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}>
          {value}
        </div>
      </div>
    </div>
  </div>
);

// * Component to display a color palette section
const ColorPalette = ({ title, colors, prefix }: { title: string; colors: any; prefix: string }) => {
  const renderColors = (obj: any, path = '') => {
    const items: JSX.Element[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}-${key}` : key;
      const cssVar = `--${prefix}-${currentPath}`;
      
      if (typeof value === 'string') {
        items.push(
          <ColorSwatch 
            key={cssVar}
            name={key} 
            value={value} 
            path={cssVar}
          />
        );
      } else if (typeof value === 'object' && value !== null) {
        // * Handle DEFAULT specially
        if (value.DEFAULT) {
          items.push(
            <ColorSwatch 
              key={`${cssVar}`}
              name={key} 
              value={value.DEFAULT} 
              path={cssVar}
            />
          );
        }
        // * Add nested colors
        items.push(...renderColors(value, currentPath));
      }
    });
    
    return items;
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem'
      }}>
        {title}
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {renderColors(colors)}
      </div>
    </div>
  );
};

// * Main story component
const DesignTokensStory = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '36px', 
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1a1a1a'
      }}>
        Fantasy Master Design Tokens
      </h1>
      <p style={{ 
        fontSize: '18px', 
        color: '#666',
        marginBottom: '3rem',
        lineHeight: '1.6'
      }}>
        A comprehensive color system for the Fantasy Writing App, inspired by RPG attributes, 
        fantasy classes, and medieval UI elements. This is the single source of truth for all 
        colors across the application, mockups, and documentation.
      </p>

      {/* Attribute Colors */}
      <ColorPalette 
        title="⚔️ Attribute Colors" 
        colors={tokens.color.attribute}
        prefix="attribute"
      />

      {/* Class Colors */}
      <ColorPalette 
        title="🛡️ Class Colors" 
        colors={tokens.color.class}
        prefix="class"
      />

      {/* UI Colors - Parchment */}
      <ColorPalette 
        title="📜 Parchment (Light Theme)" 
        colors={tokens.color.ui.parchment}
        prefix="parchment"
      />

      {/* UI Colors - Obsidian */}
      <ColorPalette 
        title="⚫ Obsidian (Dark Theme)" 
        colors={tokens.color.ui.obsidian}
        prefix="obsidian"
      />

      {/* UI Colors - Metals */}
      <ColorPalette 
        title="✨ Metallic Accents" 
        colors={tokens.color.ui.metals}
        prefix="metals"
      />

      {/* UI Colors - Ink */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem'
        }}>
          🖋️ Ink (Text Colors)
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          <ColorPalette 
            title="Primary Ink" 
            colors={tokens.color.ui.ink.primary}
            prefix="ink-primary"
          />
          <ColorPalette 
            title="Secondary Ink" 
            colors={tokens.color.ui.ink.secondary}
            prefix="ink-secondary"
          />
        </div>
      </div>

      {/* Semantic Colors */}
      <ColorPalette 
        title="🎯 Semantic Colors" 
        colors={tokens.color.semantic}
        prefix="semantic"
      />

      {/* Element Type Colors */}
      <ColorPalette 
        title="🎭 Element Type Colors" 
        colors={tokens.color.element}
        prefix="element"
      />

      {/* Effects */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem'
        }}>
          ✨ Special Effects
        </h2>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>
            Glow Effects
          </h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {Object.entries(tokens.color.effect.glow).map(([key, value]) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: `0 0 20px ${value}`,
                  marginBottom: '0.5rem'
                }} />
                <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{key}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>
            Shadow Effects
          </h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {Object.entries(tokens.color.effect.shadow).map(([key, value]) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#F5F0E6',
                  borderRadius: '8px',
                  boxShadow: `0 4px 8px ${value}`,
                  marginBottom: '0.5rem'
                }} />
                <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{key}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// * Storybook configuration
const meta = {
  title: 'Design System/Color Tokens',
  component: DesignTokensStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete color token documentation for the Fantasy Writing App design system.'
      }
    }
  },
} satisfies Meta<typeof DesignTokensStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTokens: Story = {
  name: 'All Color Tokens',
};