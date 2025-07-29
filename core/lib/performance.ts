'use client';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track component render time
  trackRender(componentName: string, renderTime: number) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    this.metrics.get(componentName)!.push(renderTime);

    // Log slow renders
    if (renderTime > 16) { // 60fps threshold
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }
  }

  // Track API call performance
  trackAPICall(endpoint: string, duration: number) {
    const key = `api_${endpoint}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(duration);

    // Log slow API calls
    if (duration > 1000) { // 1 second threshold
      console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`);
    }
  }

  // Get performance report
  getReport() {
    const report: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, key) => {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      report[key] = {
        avg: Math.round(avg * 100) / 100,
        min,
        max,
        count: values.length,
      };
    });

    return report;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    PerformanceMonitor.getInstance().trackRender(componentName, renderTime);
  };
}

// Utility for tracking API calls
export async function trackAPICall<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    PerformanceMonitor.getInstance().trackAPICall(endpoint, duration);
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    PerformanceMonitor.getInstance().trackAPICall(`${endpoint}_error`, duration);
    throw error;
  }
}

// Debug function to log performance report
export function logPerformanceReport() {
  const report = PerformanceMonitor.getInstance().getReport();
  console.table(report);
  
  // Log recommendations
  const slowComponents = Object.entries(report)
    .filter(([key, data]) => key.startsWith('component_') && data.avg > 16);
  
  const slowAPIs = Object.entries(report)
    .filter(([key, data]) => key.startsWith('api_') && data.avg > 1000);
  
  if (slowComponents.length > 0) {
    console.warn('Slow components detected:', slowComponents);
  }
  
  if (slowAPIs.length > 0) {
    console.warn('Slow API calls detected:', slowAPIs);
  }
}

// Make performance monitor available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = PerformanceMonitor.getInstance();
  (window as any).logPerformanceReport = logPerformanceReport;
} 