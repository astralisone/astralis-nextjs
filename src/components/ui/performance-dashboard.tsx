import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Zap, 
  Timer, 
  Eye, 
  Gauge,
  HardDrive,
  Download,
  Image as ImageIcon,
  FileText,
  Palette,
  X
} from 'lucide-react'
import { 
  useWebVitals, 
  useMemoryMonitor, 
  useResourceTiming,
  logPerformanceData 
} from '@/hooks/usePerformanceMonitor'

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export function PerformanceDashboard({ isOpen, onClose }: PerformanceDashboardProps) {
  const { metrics, getMetricStatus } = useWebVitals()
  const memoryInfo = useMemoryMonitor()
  const resourceMetrics = useResourceTiming()
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isOpen && showDetails) {
      logPerformanceData({ webVitals: metrics, memory: memoryInfo, resources: resourceMetrics })
    }
  }, [isOpen, showDetails, metrics, memoryInfo, resourceMetrics])

  if (!isOpen) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/20 text-green-400 border-green-400/30'
      case 'needs-improvement': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
      case 'poor': return 'bg-red-500/20 text-red-400 border-red-400/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'script': return <FileText className="w-4 h-4" />
      case 'stylesheet': return <Palette className="w-4 h-4" />
      case 'image': return <ImageIcon className="w-4 h-4" />
      default: return <Download className="w-4 h-4" />
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getTotalResourceSize = () => {
    return resourceMetrics.reduce((total, resource) => total + resource.size, 0)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed top-4 right-4 max-w-4xl max-h-[90vh] overflow-auto bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Performance Monitor</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <Tabs defaultValue="vitals" className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-white/5">
              <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* LCP */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Timer className="w-4 h-4 text-blue-400" />
                      LCP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : '—'}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Largest Contentful Paint</p>
                    {metrics.lcp && (
                      <Badge className={getStatusColor(getMetricStatus('lcp', metrics.lcp))}>
                        {getMetricStatus('lcp', metrics.lcp)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* FID */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      FID
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {metrics.fid ? `${metrics.fid}ms` : '—'}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">First Input Delay</p>
                    {metrics.fid && (
                      <Badge className={getStatusColor(getMetricStatus('fid', metrics.fid))}>
                        {getMetricStatus('fid', metrics.fid)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* CLS */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-400" />
                      CLS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {metrics.cls !== undefined ? metrics.cls.toFixed(3) : '—'}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Cumulative Layout Shift</p>
                    {metrics.cls !== undefined && (
                      <Badge className={getStatusColor(getMetricStatus('cls', metrics.cls))}>
                        {getMetricStatus('cls', metrics.cls)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* FCP */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-purple-400" />
                      FCP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {metrics.fcp ? `${(metrics.fcp / 1000).toFixed(1)}s` : '—'}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">First Contentful Paint</p>
                    {metrics.fcp && (
                      <Badge className={getStatusColor(getMetricStatus('fcp', metrics.fcp))}>
                        {getMetricStatus('fcp', metrics.fcp)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* TTFB */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Download className="w-4 h-4 text-orange-400" />
                      TTFB
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {metrics.ttfb ? `${metrics.ttfb}ms` : '—'}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Time to First Byte</p>
                    {metrics.ttfb && (
                      <Badge className={getStatusColor(getMetricStatus('ttfb', metrics.ttfb))}>
                        {getMetricStatus('ttfb', metrics.ttfb)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Total resources: {resourceMetrics.length} ({formatSize(getTotalResourceSize())})
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resourceMetrics.slice(0, 10).map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getResourceIcon(resource.type)}
                      <span className="text-sm text-white truncate">{resource.name}</span>
                      {resource.cached && (
                        <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                          Cached
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatSize(resource.size)}</span>
                      <span>{resource.loadTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              {memoryInfo ? (
                <div className="space-y-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        JavaScript Heap Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-white">{memoryInfo.usedJSHeapSize} MB</div>
                          <div className="text-xs text-gray-400">Used</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white">{memoryInfo.totalJSHeapSize} MB</div>
                          <div className="text-xs text-gray-400">Total</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white">{memoryInfo.jsHeapSizeLimit} MB</div>
                          <div className="text-xs text-gray-400">Limit</div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={(memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100} 
                        className="h-2"
                      />
                      
                      <div className="text-xs text-gray-400 text-center">
                        {((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100).toFixed(1)}% of heap limit used
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Memory information not available in this browser
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}