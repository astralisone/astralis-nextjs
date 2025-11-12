import React, { useState } from 'react'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PerformanceDashboard } from './performance-dashboard'

interface PerformanceTriggerProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
  showInProduction?: boolean
}

export function PerformanceTrigger({ 
  position = 'bottom-right', 
  showInProduction = false 
}: PerformanceTriggerProps) {
  const [showDashboard, setShowDashboard] = useState(false)

  // Only show in development by default
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4'
  }

  return (
    <>
      <div className={`fixed ${positionClasses[position]} z-40`}>
        <Button
          onClick={() => setShowDashboard(true)}
          size="sm"
          className="bg-purple-600/90 hover:bg-purple-700 text-white shadow-lg backdrop-blur-sm border border-white/10"
          title="Performance Monitor"
        >
          <Activity className="w-4 h-4" />
        </Button>
      </div>

      <PerformanceDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </>
  )
}

// Higher-order component to wrap components with performance monitoring
export function withPerformanceMonitoring<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: T) {
    // Only monitor in development
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now()
      
      // Monitor component mount
      React.useEffect(() => {
        const mountTime = performance.now() - startTime
        if (mountTime > 50) {
          console.warn(`Slow component mount: ${componentName} took ${mountTime.toFixed(2)}ms`)
        }
      }, [])
    }

    return <Component {...props} />
  }
}