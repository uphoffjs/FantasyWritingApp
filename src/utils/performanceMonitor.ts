/* eslint-disable @typescript-eslint/no-explicit-any */
// ! Dynamic metric collection requires flexible typing for various performance data

import React from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  props?: Record<string, any>;
}

interface RuntimeMetrics {
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  fps: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private runtimeMetrics: RuntimeMetrics[] = [];
  private fpsFrames: number[] = [];
  private lastFrameTime = performance.now();
  private enabled = process.env.NODE_ENV === 'development';
  
  // * Component render tracking
  trackRender(componentName: string, duration: number, props?: Record<string, any>) {
    if (!this.enabled) return;
    
    const metric: PerformanceMetrics = {
      componentName,
      renderTime: duration,
      timestamp: Date.now(),
      props: this.sanitizeProps(props)
    };
    
    this.metrics.push(metric);
    
    // * Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
    
    // * Log slow renders
    if (duration > 16) { // More than one frame (60fps)
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }
  
  // FPS tracking
  trackFrame() {
    if (!this.enabled) return;
    
    const currentTime = performance.now();
    const delta = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    this.fpsFrames.push(delta);
    
    // * Keep last 60 frames for average
    if (this.fpsFrames.length > 60) {
      this.fpsFrames.shift();
    }
  }
  
  // * Memory usage tracking
  trackMemory() {
    if (!this.enabled) return;
    
    const memory = (performance as any).memory;
    const memoryUsage = memory ? {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    } : null;
    
    const avgFrameTime = this.fpsFrames.length > 0
      ? this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length
      : 16.67;
    
    const fps = 1000 / avgFrameTime;
    
    this.runtimeMetrics.push({
      memoryUsage,
      fps,
      timestamp: Date.now()
    });
    
    // * Keep only last 100 runtime metrics
    if (this.runtimeMetrics.length > 100) {
      this.runtimeMetrics.shift();
    }
  }
  
  // ! PERFORMANCE: * Get performance report
  getReport() {
    if (!this.enabled) return null;
    
    const avgRenderTime = this.metrics.length > 0
      ? this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length
      : 0;
    
    const slowRenders = this.metrics.filter(m => m.renderTime > 16);
    
    const latestRuntime = this.runtimeMetrics[this.runtimeMetrics.length - 1];
    
    const componentRenderCounts = this.metrics.reduce((acc, m) => {
      acc[m.componentName] = (acc[m.componentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const slowestComponents = [...new Set(this.metrics.map(m => m.componentName))]
      .map(name => ({
        name,
        avgTime: this.metrics
          .filter(m => m.componentName === name)
          .reduce((sum, m) => sum + m.renderTime, 0) / 
          this.metrics.filter(m => m.componentName === name).length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);
    
    return {
      avgRenderTime,
      slowRenders: slowRenders.length,
      totalRenders: this.metrics.length,
      fps: latestRuntime?.fps || 0,
      memoryUsage: latestRuntime?.memoryUsage,
      componentRenderCounts,
      slowestComponents
    };
  }
  
  // * Clear all metrics
  clear() {
    this.metrics = [];
    this.runtimeMetrics = [];
    this.fpsFrames = [];
  }
  
  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  // ! SECURITY: * Sanitize props to avoid storing sensitive data
  private sanitizeProps(props?: Record<string, any>) {
    if (!props) return undefined;
    
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = `Array(${value.length})`;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = value.constructor.name;
      }
    }
    
    return sanitized;
  }
}

// * Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// ! PERFORMANCE: * React hook for component performance tracking
export function usePerformanceTracking(componentName: string, props?: Record<string, any>) {
  if (process.env.NODE_ENV !== 'development') return;
  
  const renderStartTime = performance.now();
  
  // * Track after render
  setTimeout(() => {
    const renderEndTime = performance.now();
    performanceMonitor.trackRender(componentName, renderEndTime - renderStartTime, props);
  }, 0);
}

// ! PERFORMANCE: HOC for performance tracking
export function withPerformanceTracking<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name || 'Unknown';
  
  return React.forwardRef<any, T>((props, ref) => {
    usePerformanceTracking(displayName, props as any);
    return React.createElement(Component, { ...props, ref } as any);
  });
}

// * Start runtime monitoring
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Track FPS
  // let _animationFrameId: number;
  const trackFPS = () => {
    performanceMonitor.trackFrame();
    // _animationFrameId = requestAnimationFrame(trackFPS);
    requestAnimationFrame(trackFPS);
  };
  trackFPS();
  
  // * Track memory every 5 seconds
  setInterval(() => {
    performanceMonitor.trackMemory();
  }, 5000);
  
  // * Expose to window for debugging
  (window as any).performanceMonitor = performanceMonitor;
  
  // * Log report every 30 seconds in development
  setInterval(() => {
    const report = performanceMonitor.getReport();
    if (report) {
    }
  }, 30000);
}