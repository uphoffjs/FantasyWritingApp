/**
 * Spacing and Layout Documentation
 * Visual showcase of the Fantasy Writing App spacing system and layout grid
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// * 8px grid-based spacing system
const spacing = {
  0: 0,
  px: 1,
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  3.5: 28,
  4: 32,
  5: 40,
  6: 48,
  7: 56,
  8: 64,
  9: 72,
  10: 80,
  11: 88,
  12: 96,
  14: 112,
  16: 128,
  20: 160,
  24: 192,
  28: 224,
  32: 256,
  36: 288,
  40: 320,
  44: 352,
  48: 384,
  52: 416,
  56: 448,
  60: 480,
  64: 512,
  72: 576,
  80: 640,
  96: 768,
};

// * Container widths for responsive design
const containers = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// * Breakpoints for responsive design
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1023px',
  desktop: '≥ 1024px',
  wide: '≥ 1280px',
};

// * Component to display spacing examples
const SpacingExample = ({
  label,
  value: _value,
  pixels
}: { 
  label: string; 
  value: number; 
  pixels: number; 
}) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '0.5rem' 
  }}>
    <div style={{ 
      width: '80px',
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#666'
    }}>
      {label}
    </div>
    <div style={{ 
      width: '60px',
      fontSize: '12px',
      color: '#999'
    }}>
      {pixels}px
    </div>
    <div style={{ 
      width: `${pixels}px`,
      height: '24px',
      backgroundColor: '#FFD700',
      borderRadius: '2px',
      transition: 'width 0.3s ease'
    }} />
  </div>
);

// * Component to display grid examples
const GridExample = ({ 
  columns, 
  gap,
  label 
}: { 
  columns: number; 
  gap: number;
  label: string;
}) => (
  <div style={{ marginBottom: '2rem' }}>
    <h4 style={{ 
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: '#666'
    }}>
      {label}
    </h4>
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap}px`,
      marginBottom: '0.5rem'
    }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '60px',
            backgroundColor: '#F5F0E6',
            border: '1px solid #D4B896',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666'
          }}
        >
          Col {i + 1}
        </div>
      ))}
    </div>
    <div style={{ 
      fontSize: '12px',
      color: '#999',
      fontFamily: 'monospace'
    }}>
      {columns} columns, {gap}px gap
    </div>
  </div>
);

// * Main story component
const SpacingLayoutStory = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '36px', 
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1a1a1a',
        fontFamily: "'Cinzel', serif"
      }}>
        Spacing & Layout System
      </h1>
      <p style={{ 
        fontSize: '18px', 
        color: '#666',
        marginBottom: '3rem',
        lineHeight: 1.6,
        fontFamily: "'EB Garamond', serif"
      }}>
        The Fantasy Writing App uses an 8px grid system for consistent spacing and layout. 
        This ensures visual harmony across all components and platforms while maintaining 
        flexibility for responsive design.
      </p>

      {/* Spacing Scale */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          📏 Spacing Scale (8px Grid)
        </h2>
        
        <div style={{ 
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            Common Spacing Values
          </h3>
          {Object.entries(spacing)
            .filter(([_key, value]) => [0, 4, 8, 16, 24, 32, 48, 64, 96, 128].includes(value))
            .map(([key, value]) => (
              <SpacingExample 
                key={key}
                label={`spacing-${key}`}
                value={Number(key)}
                pixels={value}
              />
            ))}
        </div>
        
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ 
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            View All Spacing Values
          </summary>
          <div style={{ 
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '8px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {Object.entries(spacing).map(([key, value]) => (
              <SpacingExample 
                key={key}
                label={`spacing-${key}`}
                value={Number(key)}
                pixels={value}
              />
            ))}
          </div>
        </details>
      </section>

      {/* Layout Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          🎯 Layout Grid System
        </h2>
        
        <GridExample columns={12} gap={16} label="12 Column Grid (Desktop)" />
        <GridExample columns={8} gap={16} label="8 Column Grid (Tablet)" />
        <GridExample columns={4} gap={16} label="4 Column Grid (Mobile)" />
        <GridExample columns={3} gap={24} label="3 Column Layout (Cards)" />
        <GridExample columns={2} gap={32} label="2 Column Layout (Split View)" />
      </section>

      {/* Container Widths */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          📦 Container Widths
        </h2>
        
        <div style={{ position: 'relative' }}>
          {Object.entries(containers).reverse().map(([key, value], index) => (
            <div
              key={key}
              style={{
                width: '100%',
                maxWidth: `${value}px`,
                height: '60px',
                margin: '0 auto 1rem',
                backgroundColor: `rgba(255, 215, 0, ${0.2 + (index * 0.1)})`,
                border: '1px solid #FFD700',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#666',
                backgroundColor: '#fff',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {key}: {value}px
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Responsive Breakpoints */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          📱 Responsive Breakpoints
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {Object.entries(breakpoints).map(([key, value]) => (
            <div
              key={key}
              style={{
                backgroundColor: '#F5F0E6',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #D4B896'
              }}
            >
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '0.5rem',
                textTransform: 'capitalize'
              }}>
                {key}
              </h3>
              <div style={{
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#666'
              }}>
                {value}
              </div>
              <div style={{
                marginTop: '1rem',
                fontSize: '12px',
                color: '#999'
              }}>
                {key === 'mobile' && '1-4 columns, stack layouts'}
                {key === 'tablet' && '4-8 columns, hybrid layouts'}
                {key === 'desktop' && '8-12 columns, side-by-side'}
                {key === 'wide' && '12+ columns, multi-panel'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Layouts */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          🏗️ Common Layout Patterns
        </h2>
        
        {/* Sidebar Layout */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '1rem' }}>
            Sidebar Layout
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: '24px',
            height: '200px'
          }}>
            <div style={{
              backgroundColor: '#D4B896',
              borderRadius: '4px',
              padding: '1rem',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600
            }}>
              Sidebar
              <div style={{ fontSize: '12px', marginTop: '0.5rem', opacity: 0.8 }}>
                240px fixed
              </div>
            </div>
            <div style={{
              backgroundColor: '#F5F0E6',
              borderRadius: '4px',
              padding: '1rem',
              border: '1px solid #D4B896',
              fontSize: '14px'
            }}>
              Main Content
              <div style={{ fontSize: '12px', marginTop: '0.5rem', color: '#999' }}>
                Flexible width
              </div>
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '1rem' }}>
            Card Grid Layout
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                style={{
                  backgroundColor: '#F5F0E6',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid #D4B896',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#666'
                }}
              >
                Card {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing Usage Guidelines */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          📋 Usage Guidelines
        </h2>
        
        <div style={{ 
          backgroundColor: '#F5F0E6',
          padding: '1.5rem',
          borderRadius: '8px',
          fontFamily: "'EB Garamond', serif",
          lineHeight: 1.6
        }}>
          <h3 style={{ 
            fontFamily: "'Cinzel', serif",
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            Spacing Best Practices
          </h3>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li><strong>Use the 8px grid</strong> - All spacing should be multiples of 8px for consistency</li>
            <li><strong>Component padding</strong> - Use 16px (spacing-2) for standard padding, 24px (spacing-3) for spacious</li>
            <li><strong>Element margins</strong> - Use 8px (spacing-1) between related items, 16px+ between sections</li>
            <li><strong>Card gaps</strong> - Use 16px (spacing-2) on mobile, 24px (spacing-3) on desktop</li>
            <li><strong>Section spacing</strong> - Use 48px (spacing-6) or 64px (spacing-8) between major sections</li>
            <li><strong>Touch targets</strong> - Minimum 44x44px for mobile touch targets</li>
            <li><strong>Container padding</strong> - 16px on mobile, 24px on tablet, 32px on desktop</li>
            <li><strong>Maximum line length</strong> - Keep text blocks under 75 characters for readability</li>
          </ul>
          
          <h3 style={{ 
            fontFamily: "'Cinzel', serif",
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            Layout Best Practices
          </h3>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li><strong>Mobile-first</strong> - Design for mobile, then enhance for larger screens</li>
            <li><strong>Flexible grids</strong> - Use CSS Grid or Flexbox for responsive layouts</li>
            <li><strong>Consistent gutters</strong> - Maintain the same gap spacing across similar layouts</li>
            <li><strong>Breakpoint alignment</strong> - Change layouts at logical content breakpoints</li>
            <li><strong>Container constraints</strong> - Use max-width to prevent overly wide text blocks</li>
            <li><strong>Aspect ratios</strong> - Maintain consistent aspect ratios for images and cards</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

// * Storybook configuration
const meta = {
  title: 'Design System/Spacing & Layout',
  component: SpacingLayoutStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete spacing and layout documentation for the Fantasy Writing App design system.'
      }
    }
  },
} satisfies Meta<typeof SpacingLayoutStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: 'Spacing & Layout System',
};