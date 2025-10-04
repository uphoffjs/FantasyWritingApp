/**
 * Typography Documentation
 * Visual showcase of the Fantasy Writing App typography system
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// * Typography scale and font families
const fontFamilies = {
  heading: "'Cinzel', Georgia, serif",
  body: "'EB Garamond', Georgia, serif",
  monospace: "'Courier New', monospace"
};

const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72
};

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2
};

// * Component to display typography samples
const TypographySample = ({ 
  label, 
  fontFamily, 
  fontSize, 
  fontWeight, 
  lineHeight,
  sample,
  description 
}: {
  label: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  sample?: string;
  description?: string;
}) => (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '0.5rem',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '0.5rem'
    }}>
      <h3 style={{ 
        fontSize: '14px',
        fontWeight: 600,
        color: '#666',
        margin: 0
      }}>
        {label}
      </h3>
      <span style={{ 
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#999'
      }}>
        {fontSize}px / {fontWeight} / {lineHeight}lh
      </span>
    </div>
    <p style={{ 
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      lineHeight,
      color: '#1A1613',
      margin: 0,
      marginBottom: description ? '0.5rem' : 0
    }}>
      {sample || 'The realm of shadows beckons those brave enough to answer its call.'}
    </p>
    {description && (
      <p style={{ 
        fontSize: '12px',
        color: '#999',
        margin: 0
      }}>
        {description}
      </p>
    )}
  </div>
);

// * Main story component
const TypographyStory = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '36px', 
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1a1a1a',
        fontFamily: fontFamilies.heading
      }}>
        Typography System
      </h1>
      <p style={{ 
        fontSize: '18px', 
        color: '#666',
        marginBottom: '3rem',
        lineHeight: 1.6,
        fontFamily: fontFamilies.body
      }}>
        The Fantasy Writing App uses a carefully crafted typography system combining Cinzel for 
        headings (evoking ancient manuscripts and epic tales) with EB Garamond for body text 
        (ensuring readability for long-form writing).
      </p>

      {/* Font Families */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: fontFamilies.heading
        }}>
          📚 Font Families
        </h2>
        
        <TypographySample
          label="Heading Font (Cinzel)"
          fontFamily={fontFamilies.heading}
          fontSize={24}
          fontWeight={600}
          lineHeight={1.25}
          sample="In the Age of Heroes, when dragons ruled the skies..."
          description="Used for all headings, titles, and prominent UI elements. Evokes fantasy and medieval themes."
        />
        
        <TypographySample
          label="Body Font (EB Garamond)"
          fontFamily={fontFamilies.body}
          fontSize={16}
          fontWeight={400}
          lineHeight={1.5}
          sample="The ancient tome revealed secrets long forgotten by mortal minds. Its pages, yellowed with age, whispered of power beyond imagination."
          description="Primary font for body text, descriptions, and long-form content. Optimized for readability."
        />
        
        <TypographySample
          label="Monospace (Code)"
          fontFamily={fontFamilies.monospace}
          fontSize={14}
          fontWeight={400}
          lineHeight={1.5}
          sample="const spell = cast('fireball', { power: 9000 });"
          description="Used for code snippets, technical information, and data display."
        />
      </section>

      {/* Heading Scale */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: fontFamilies.heading
        }}>
          👑 Heading Scale
        </h2>
        
        <TypographySample
          label="H1 - Page Title"
          fontFamily={fontFamilies.heading}
          fontSize={fontSizes['5xl']}
          fontWeight={fontWeights.bold}
          lineHeight={lineHeights.tight}
          sample="The Chronicles Begin"
          description="Main page titles and hero headings"
        />
        
        <TypographySample
          label="H2 - Section Title"
          fontFamily={fontFamilies.heading}
          fontSize={fontSizes['4xl']}
          fontWeight={fontWeights.semibold}
          lineHeight={lineHeights.tight}
          sample="Chapter One: The Awakening"
          description="Major section headings"
        />
        
        <TypographySample
          label="H3 - Subsection"
          fontFamily={fontFamilies.heading}
          fontSize={fontSizes['3xl']}
          fontWeight={fontWeights.semibold}
          lineHeight={lineHeights.snug}
          sample="The Prophecy Revealed"
          description="Subsection headings and card titles"
        />
        
        <TypographySample
          label="H4 - Component Title"
          fontFamily={fontFamilies.heading}
          fontSize={fontSizes['2xl']}
          fontWeight={fontWeights.medium}
          lineHeight={lineHeights.snug}
          sample="Character Attributes"
          description="Component and widget titles"
        />
        
        <TypographySample
          label="H5 - Small Heading"
          fontFamily={fontFamilies.heading}
          fontSize={fontSizes.xl}
          fontWeight={fontWeights.medium}
          lineHeight={lineHeights.normal}
          sample="Quick Actions"
          description="Small headings and labels"
        />
        
        <TypographySample
          label="H6 - Micro Heading"
          fontFamily={fontFamilies.heading}
          fontSize={fontSizes.lg}
          fontWeight={fontWeights.medium}
          lineHeight={lineHeights.normal}
          sample="View Options"
          description="Smallest heading level"
        />
      </section>

      {/* Body Text Scale */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: fontFamilies.heading
        }}>
          📖 Body Text Scale
        </h2>
        
        <TypographySample
          label="Large Body"
          fontFamily={fontFamilies.body}
          fontSize={fontSizes.lg}
          fontWeight={fontWeights.normal}
          lineHeight={lineHeights.relaxed}
          sample="In the grand halls of the Ivory Citadel, where ancient knowledge is preserved in crystalline matrices, scholars debate the nature of reality itself."
          description="Lead paragraphs and emphasized content"
        />
        
        <TypographySample
          label="Regular Body"
          fontFamily={fontFamilies.body}
          fontSize={fontSizes.base}
          fontWeight={fontWeights.normal}
          lineHeight={lineHeights.normal}
          sample="The journey through the Whispering Woods tested not only their physical endurance but also their mental fortitude. Every shadow could hide danger, every sound could signal doom."
          description="Standard body text for content and descriptions"
        />
        
        <TypographySample
          label="Small Body"
          fontFamily={fontFamilies.body}
          fontSize={fontSizes.sm}
          fontWeight={fontWeights.normal}
          lineHeight={lineHeights.normal}
          sample="Note: Characters must complete the Trial of Elements before accessing advanced spellcasting abilities. This requirement ensures proper magical foundation."
          description="Supporting text, captions, and metadata"
        />
        
        <TypographySample
          label="Extra Small"
          fontFamily={fontFamilies.body}
          fontSize={fontSizes.xs}
          fontWeight={fontWeights.normal}
          lineHeight={lineHeights.normal}
          sample="Last modified 3 hours ago • 1,247 words • Fantasy/Adventure"
          description="Timestamps, word counts, and micro-copy"
        />
      </section>

      {/* Font Weights */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: fontFamilies.heading
        }}>
          ⚖️ Font Weights
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {Object.entries(fontWeights).map(([name, weight]) => (
            <div key={name} style={{ 
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ 
                fontFamily: fontFamilies.body,
                fontSize: '18px',
                fontWeight: weight,
                marginBottom: '0.5rem'
              }}>
                The quick brown fox
              </div>
              <div style={{ 
                fontSize: '12px',
                color: '#666',
                fontFamily: 'monospace'
              }}>
                {name} ({weight})
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Line Heights */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: fontFamilies.heading
        }}>
          📏 Line Heights
        </h2>
        
        {Object.entries(lineHeights).map(([name, height]) => (
          <TypographySample
            key={name}
            label={`Line Height: ${name} (${height})`}
            fontFamily={fontFamilies.body}
            fontSize={fontSizes.base}
            fontWeight={fontWeights.normal}
            lineHeight={height}
            sample="The ancient prophecy spoke of a chosen one who would rise in the darkest hour. This hero would wield the power of all elements and unite the fractured kingdoms against the shadow that threatens to consume all."
          />
        ))}
      </section>

      {/* Usage Guidelines */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: fontFamilies.heading
        }}>
          📋 Usage Guidelines
        </h2>
        
        <div style={{ 
          backgroundColor: '#F5F0E6',
          padding: '1.5rem',
          borderRadius: '8px',
          fontFamily: fontFamilies.body,
          lineHeight: 1.6
        }}>
          <h3 style={{ 
            fontFamily: fontFamilies.heading,
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            Best Practices
          </h3>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>Use <strong>Cinzel</strong> for all headings and UI elements that need emphasis</li>
            <li>Use <strong>EB Garamond</strong> for body text, descriptions, and long-form content</li>
            <li>Maintain a clear hierarchy with consistent size jumps (1.25x ratio)</li>
            <li>Use <strong>tight line-height (1.25)</strong> for headings</li>
            <li>Use <strong>normal to relaxed line-height (1.5-1.625)</strong> for body text</li>
            <li>Limit font weights to 4 options for consistency</li>
            <li>Ensure minimum font size of 12px for accessibility</li>
            <li>Use color contrast ratio of at least 4.5:1 for body text</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

// * Storybook configuration
const meta = {
  title: 'Design System/Typography',
  component: TypographyStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete typography documentation for the Fantasy Writing App design system.'
      }
    }
  },
} satisfies Meta<typeof TypographyStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: 'Typography System',
};