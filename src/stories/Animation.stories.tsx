/**
 * Animation and Transition Documentation
 * Visual showcase of the Fantasy Writing App animation system and transitions
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// * Animation timing functions
const easings = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  fantasy: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Custom fantasy-themed easing
  magical: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce effect for magical elements
};

// * Animation durations
const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
  // Specific use cases
  hover: 150,
  ripple: 600,
  pageTransition: 300,
  modalOpen: 400,
  drawerSlide: 350,
  fadeIn: 200,
  fadeOut: 150,
  scaleIn: 250,
  scaleOut: 200,
  collapse: 300,
  expand: 350,
};

// * Common animation presets
const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: durations.fadeIn,
    easing: easings.easeOut,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: durations.fadeOut,
    easing: easings.easeIn,
  },
  slideInFromRight: {
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: durations.drawerSlide,
    easing: easings.easeOut,
  },
  slideInFromLeft: {
    from: { transform: 'translateX(-100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: durations.drawerSlide,
    easing: easings.easeOut,
  },
  slideInFromBottom: {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: durations.modalOpen,
    easing: easings.fantasy,
  },
  scaleIn: {
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: durations.scaleIn,
    easing: easings.easeOut,
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.9)', opacity: 0 },
    duration: durations.scaleOut,
    easing: easings.easeIn,
  },
  magicalAppear: {
    from: { transform: 'scale(0) rotate(180deg)', opacity: 0 },
    to: { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    duration: durations.slow,
    easing: easings.magical,
  },
  shimmer: {
    from: { backgroundPosition: '-200% center' },
    to: { backgroundPosition: '200% center' },
    duration: 2000,
    easing: easings.linear,
    infinite: true,
  },
};

// * Component to demonstrate timing functions
const TimingFunctionDemo = ({ name, value }: { name: string; value: string }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnimate = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 10);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <h4 style={{ 
          fontSize: '14px',
          fontWeight: 600,
          color: '#666',
          margin: 0,
          width: '150px'
        }}>
          {name}
        </h4>
        <button
          onClick={handleAnimate}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            backgroundColor: '#FFD700',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Play
        </button>
      </div>
      <div style={{
        height: '40px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#D4B896',
            borderRadius: '4px',
            position: 'absolute',
            left: isAnimating ? 'calc(100% - 40px)' : '0',
            transition: isAnimating ? `left 1s ${value}` : 'none',
          }}
        />
      </div>
      <div style={{ 
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#999',
        marginTop: '4px'
      }}>
        {value}
      </div>
    </div>
  );
};

// * Component to demonstrate animation presets
const AnimationPresetDemo = ({ 
  name, 
  animation 
}: { 
  name: string; 
  animation: any;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnimate = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 10);
    setTimeout(() => setIsAnimating(false), animation.duration + 100);
  };

  const getAnimationStyle = () => {
    if (!isAnimating) return animation.from;
    return {
      ...animation.to,
      transition: `all ${animation.duration}ms ${animation.easing}`,
    };
  };

  return (
    <div style={{ 
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h4 style={{ 
          fontSize: '14px',
          fontWeight: 600,
          margin: 0
        }}>
          {name}
        </h4>
        <button
          onClick={handleAnimate}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            backgroundColor: '#FFD700',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Play
        </button>
      </div>
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#D4B896',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '12px',
            ...getAnimationStyle()
          }}
        >
          Element
        </div>
      </div>
      <div style={{ 
        fontSize: '11px',
        color: '#666',
        marginTop: '0.5rem'
      }}>
        Duration: {animation.duration}ms | Easing: {animation.easing.split('(')[0]}
      </div>
    </div>
  );
};

// * Interactive transition demo
const InteractiveTransitionDemo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ 
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '1rem'
      }}>
        Interactive States
      </h3>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {/* Hover Effect */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: '1.5rem',
            backgroundColor: isHovered ? '#FFD700' : '#F5F0E6',
            color: isHovered ? '#fff' : '#666',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 150ms ease-out',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: isHovered 
              ? '0 4px 12px rgba(212, 184, 150, 0.3)'
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <strong>Hover Effect</strong>
          <div style={{ fontSize: '12px', marginTop: '0.5rem' }}>
            150ms ease-out
          </div>
        </div>

        {/* Click Effect */}
        <div 
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          onMouseLeave={() => setIsActive(false)}
          style={{
            padding: '1.5rem',
            backgroundColor: '#F5F0E6',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 100ms ease-out',
            transform: isActive ? 'scale(0.95)' : 'scale(1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <strong>Click Effect</strong>
          <div style={{ fontSize: '12px', marginTop: '0.5rem' }}>
            100ms scale
          </div>
        </div>

        {/* Focus Effect */}
        <button
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            padding: '1.5rem',
            backgroundColor: '#F5F0E6',
            border: '2px solid',
            borderColor: isFocused ? '#FFD700' : 'transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 200ms ease-out',
            outline: 'none',
            boxShadow: isFocused 
              ? '0 0 0 4px rgba(255, 215, 0, 0.2)'
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <strong>Focus Effect</strong>
          <div style={{ fontSize: '12px', marginTop: '0.5rem' }}>
            200ms ring
          </div>
        </button>
      </div>
    </div>
  );
};

// * Main story component
const AnimationStory = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '36px', 
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1a1a1a',
        fontFamily: "'Cinzel', serif"
      }}>
        Animation & Transitions
      </h1>
      <p style={{ 
        fontSize: '18px', 
        color: '#666',
        marginBottom: '3rem',
        lineHeight: 1.6,
        fontFamily: "'EB Garamond', serif"
      }}>
        The Fantasy Writing App uses carefully crafted animations to enhance user experience 
        while maintaining the fantasy theme. Animations are subtle, purposeful, and optimized 
        for performance across all platforms.
      </p>

      {/* Duration Scale */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          ⏱️ Duration Scale
        </h2>
        
        <div style={{ 
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {Object.entries(durations).map(([name, value]) => (
              <div 
                key={name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px'
                }}
              >
                <span style={{ 
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: '#666'
                }}>
                  {name}
                </span>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {value}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timing Functions */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          📈 Timing Functions (Easing)
        </h2>
        
        <div style={{ 
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          {Object.entries(easings).map(([name, value]) => (
            <TimingFunctionDemo key={name} name={name} value={value} />
          ))}
        </div>
      </section>

      {/* Animation Presets */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          ✨ Animation Presets
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {Object.entries(animations)
            .filter(([name]) => name !== 'shimmer')
            .map(([name, animation]) => (
              <AnimationPresetDemo key={name} name={name} animation={animation} />
            ))}
        </div>
      </section>

      {/* Interactive Transitions */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          🎮 Interactive Transitions
        </h2>
        
        <InteractiveTransitionDemo />
      </section>

      {/* Platform-Specific Considerations */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          📱 Platform Considerations
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: '#F5F0E6',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#1a1a1a'
            }}>
              Web Platform
            </h3>
            <ul style={{ 
              marginLeft: '1.5rem',
              fontSize: '14px',
              lineHeight: 1.6
            }}>
              <li>CSS transitions for performance</li>
              <li>GPU acceleration with transform</li>
              <li>Hover states for mouse interaction</li>
              <li>Smooth scrolling with CSS</li>
              <li>60fps target for all animations</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#F5F0E6',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#1a1a1a'
            }}>
              iOS Platform
            </h3>
            <ul style={{ 
              marginLeft: '1.5rem',
              fontSize: '14px',
              lineHeight: 1.6
            }}>
              <li>Native spring physics</li>
              <li>Gesture-based interactions</li>
              <li>Momentum scrolling</li>
              <li>Haptic feedback support</li>
              <li>Respect reduced motion settings</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#F5F0E6',
            padding: '1.5rem',
            borderRadius: '8px'
          }}>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#1a1a1a'
            }}>
              Android Platform
            </h3>
            <ul style={{ 
              marginLeft: '1.5rem',
              fontSize: '14px',
              lineHeight: 1.6
            }}>
              <li>Material Design timing</li>
              <li>Ripple effects on touch</li>
              <li>Shared element transitions</li>
              <li>Elevation changes</li>
              <li>60fps on mid-range devices</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          📋 Animation Best Practices
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
            Performance Guidelines
          </h3>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li><strong>Transform & Opacity Only</strong> - Animate only GPU-accelerated properties for 60fps</li>
            <li><strong>will-change Property</strong> - Use sparingly for elements that will animate</li>
            <li><strong>RequestAnimationFrame</strong> - Use for JavaScript animations</li>
            <li><strong>Reduce Motion</strong> - Respect accessibility preferences with prefers-reduced-motion</li>
            <li><strong>Batch Animations</strong> - Group related animations to reduce repaints</li>
            <li><strong>Hardware Acceleration</strong> - Use transform3d() or translateZ(0) to enable GPU</li>
          </ul>
          
          <h3 style={{ 
            fontFamily: "'Cinzel', serif",
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            User Experience Guidelines
          </h3>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li><strong>Purpose-Driven</strong> - Every animation should have a clear purpose</li>
            <li><strong>Consistent Timing</strong> - Use the defined duration scale consistently</li>
            <li><strong>Natural Motion</strong> - Follow real-world physics for believable movement</li>
            <li><strong>Subtle Effects</strong> - Keep animations subtle and non-distracting</li>
            <li><strong>Fast & Responsive</strong> - Interactions should feel instant (under 100ms)</li>
            <li><strong>Loading States</strong> - Provide feedback during async operations</li>
            <li><strong>Cancel on Interaction</strong> - Allow users to interrupt or skip animations</li>
          </ul>

          <h3 style={{ 
            fontFamily: "'Cinzel', serif",
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '1rem',
            marginTop: '2rem'
          }}>
            Fantasy Theme Guidelines
          </h3>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li><strong>Magical Reveals</strong> - Use scale + rotate for magical appearance effects</li>
            <li><strong>Parchment Unfurl</strong> - Slide + fade for content reveals</li>
            <li><strong>Golden Glow</strong> - Subtle shimmer effects for important elements</li>
            <li><strong>Ancient Feel</strong> - Slightly slower transitions for gravitas</li>
            <li><strong>Mystical Feedback</strong> - Gentle pulses for interactive elements</li>
          </ul>
        </div>
      </section>

      {/* Code Examples */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0.5rem',
          fontFamily: "'Cinzel', serif"
        }}>
          💻 Implementation Examples
        </h2>
        
        <div style={{ 
          backgroundColor: '#1e1e1e',
          padding: '1.5rem',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          <pre style={{ 
            margin: 0,
            color: '#d4d4d4',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
{`// CSS Transitions
.fantasy-button {
  transition: all 150ms ease-out;
  transform: translateY(0);
}

.fantasy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 184, 150, 0.3);
}

// React Native Animated
import { Animated } from 'react-native';

const fadeAnim = useRef(new Animated.Value(0)).current;

Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,
  easing: Easing.out(Easing.quad),
}).start();

// Framer Motion (Web)
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
/>

// CSS Keyframes
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer-effect {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 215, 0, 0.3),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}`}
          </pre>
        </div>
      </section>
    </div>
  );
};

// * Storybook configuration
const meta = {
  title: 'Design System/Animation & Transitions',
  component: AnimationStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete animation and transition documentation for the Fantasy Writing App design system.'
      }
    }
  },
} satisfies Meta<typeof AnimationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: 'Animation System',
};