import { useEffect, useCallback, useState } from 'react'

interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
}

interface ComponentPerfMetrics {
  componentName: string
  renderTime: number
  timestamp: number
}

// Web Vitals thresholds (good/needs improvement/poor)
const WEB_VITALS_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
}

// Performance observer for Core Web Vitals
export function useWebVitals() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  useEffect(() => {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          
          setMetrics(prev => ({
            ...prev,
            lcp: Math.round(lastEntry.startTime)
          }))
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            setMetrics(prev => ({
              ...prev,
              fid: Math.round(entry.processingStart - entry.startTime)
            }))
          })
        })
        fidObserver.observe({ type: 'first-input', buffered: true })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          
          setMetrics(prev => ({
            ...prev,
            cls: Math.round(clsValue * 1000) / 1000
          }))
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })

        // FCP (First Contentful Paint)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            setMetrics(prev => ({
              ...prev,
              fcp: Math.round(fcpEntry.startTime)
            }))
          }
        })
        fcpObserver.observe({ type: 'paint', buffered: true })

        // Navigation timing for TTFB
        if ('navigation' in performance.getEntriesByType('navigation')[0]) {
          const navEntry = performance.getEntriesByType('navigation')[0] as any
          const ttfb = navEntry.responseStart - navEntry.requestStart
          
          setMetrics(prev => ({
            ...prev,
            ttfb: Math.round(ttfb)
          }))
        }

        return () => {
          lcpObserver.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
          fcpObserver.disconnect()
        }
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error)
      }
    }
  }, [])

  const getMetricStatus = useCallback((metric: keyof PerformanceMetrics, value: number) => {
    const threshold = WEB_VITALS_THRESHOLDS[metric]
    if (!threshold) return 'unknown'
    
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }, [])

  return { metrics, getMetricStatus }
}

// Hook for monitoring component render performance
export function useComponentPerformance(componentName: string) {
  const [renderMetrics, setRenderMetrics] = useState<ComponentPerfMetrics[]>([])

  const startMeasure = useCallback(() => {
    return performance.now()
  }, [])

  const endMeasure = useCallback((startTime: number) => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Only track if render time is significant (>1ms)
    if (renderTime > 1) {
      setRenderMetrics(prev => [
        ...prev.slice(-9), // Keep last 10 measurements
        {
          componentName,
          renderTime: Math.round(renderTime * 100) / 100,
          timestamp: Date.now()
        }
      ])

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  const getAverageRenderTime = useCallback(() => {
    if (renderMetrics.length === 0) return 0
    const sum = renderMetrics.reduce((acc, metric) => acc + metric.renderTime, 0)
    return Math.round((sum / renderMetrics.length) * 100) / 100
  }, [renderMetrics])

  return {
    renderMetrics,
    startMeasure,
    endMeasure,
    getAverageRenderTime
  }
}

// Hook for monitoring memory usage
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        })
      }
    }

    updateMemoryInfo()
    
    // Update memory info every 5 seconds
    const interval = setInterval(updateMemoryInfo, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Utility function to log performance data
export function logPerformanceData(data: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 Performance Data')
    console.table(data)
    console.groupEnd()
  }
}

// Resource timing monitoring
export function useResourceTiming() {
  const [resourceMetrics, setResourceMetrics] = useState<any[]>([])

  useEffect(() => {
    const getResourceMetrics = () => {
      const resources = performance.getEntriesByType('resource') as any[]
      
      const metrics = resources
        .filter(resource => 
          resource.name.includes('.js') || 
          resource.name.includes('.css') || 
          resource.name.includes('.png') || 
          resource.name.includes('.jpg') ||
          resource.name.includes('.webp')
        )
        .map(resource => ({
          name: resource.name.split('/').pop(),
          type: resource.name.includes('.js') ? 'script' : 
                resource.name.includes('.css') ? 'stylesheet' : 'image',
          size: resource.transferSize || 0,
          loadTime: Math.round(resource.loadEnd - resource.startTime),
          cached: resource.transferSize === 0 && resource.decodedBodySize > 0
        }))
        .sort((a, b) => b.loadTime - a.loadTime)

      setResourceMetrics(metrics)
    }

    // Get initial metrics
    setTimeout(getResourceMetrics, 2000)
    
    // Set up observer for new resources
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(() => {
          getResourceMetrics()
        })
        observer.observe({ entryTypes: ['resource'] })
        
        return () => observer.disconnect()
      } catch (error) {
        console.warn('Resource timing observer not supported:', error)
      }
    }
  }, [])

  return resourceMetrics
}