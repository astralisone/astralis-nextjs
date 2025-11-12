"use client"

import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  User,
  Building,
  Target,
  DollarSign,
  Mail,
  Phone,
  Video,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Plus,
  BarChart3
} from 'lucide-react'
import { useToast } from '@/hooks'

// Types
interface AuditBooking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  companyName?: string
  companySize?: string
  industry?: string
  auditType: string
  currentRevenue?: string
  painPoints: string[]
  goals: string[]
  additionalNotes?: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  timezone: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED'
  meetingLink?: string
  adminNotes?: string
  preparationNotes?: string
  followUpActions: string[]
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface BookingStats {
  total: number
  scheduled: number
  completed: number
  thisMonth: number
  thisWeek: number
  typeDistribution: { auditType: string; _count: { auditType: number } }[]
  revenueDistribution: { currentRevenue: string; _count: { currentRevenue: number } }[]
}

export function AuditBookingsAdmin() {
  const [bookings, setBookings] = useState<AuditBooking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<AuditBooking | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>('all')
  const { toast } = useToast()

  // Fetch bookings and stats
  useEffect(() => {
    fetchBookings()
    fetchStats()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/audit-bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      } else {
        throw new Error('Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "Error",
        description: "Failed to load audit bookings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/audit-bookings/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/audit-bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          ...(notes && { adminNotes: notes })
        })
      })

      if (response.ok) {
        const updatedBooking = await response.json()
        setBookings(bookings.map(b => b.id === bookingId ? updatedBooking : b))
        toast({
          title: "Success",
          description: `Booking status updated to ${status}`,
        })
        fetchStats() // Refresh stats
      } else {
        throw new Error('Failed to update booking')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      })
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/audit-bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchBookings() // Refresh list
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        })
        fetchStats() // Refresh stats
      } else {
        throw new Error('Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30'
      case 'CONFIRMED':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30'
      case 'IN_PROGRESS':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-300 border-green-400/30'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300 border-red-400/30'
      case 'NO_SHOW':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30'
      case 'RESCHEDULED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    }
  }

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.companyName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesAuditType = auditTypeFilter === 'all' || booking.auditType === auditTypeFilter

    return matchesSearch && matchesStatus && matchesAuditType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Audit Bookings
          </h1>
          <p className="text-gray-400 mt-1">Manage revenue audit appointments</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Block Time Slot
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-purple-300">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-300">{stats.scheduled}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-300">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-violet-300">{stats.thisMonth}</p>
                </div>
                <Target className="h-8 w-8 text-violet-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">This Week</p>
                  <p className="text-2xl font-bold text-indigo-300">{stats.thisWeek}</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-card border-white/20"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] glass-card border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select value={auditTypeFilter} onValueChange={setAuditTypeFilter}>
              <SelectTrigger className="w-[150px] glass-card border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="SALES_PROCESS">Sales Process</SelectItem>
                <SelectItem value="MARKETING_FUNNEL">Marketing Funnel</SelectItem>
                <SelectItem value="PRICING_STRATEGY">Pricing Strategy</SelectItem>
                <SelectItem value="CUSTOMER_RETENTION">Customer Retention</SelectItem>
                <SelectItem value="DIGITAL_TRANSFORMATION">Digital Transformation</SelectItem>
                <SelectItem value="OPERATIONAL_EFFICIENCY">Operational Efficiency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Recent Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-white/5">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-200">{booking.clientName}</div>
                        <div className="text-sm text-gray-400">{booking.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-gray-200">{booking.companyName || 'N/A'}</div>
                        <div className="text-sm text-gray-400">{booking.industry}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-gray-200">{formatDate(booking.scheduledDate)}</div>
                        <div className="text-sm text-gray-400">{formatTime(booking.scheduledTime)} EST</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="glass-card border-purple-400/30 text-purple-300">
                        {booking.auditType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-200">{booking.currentRevenue || 'Not specified'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-elevated border-purple-400/30 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Booking Details - {booking.clientName}</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && <BookingDetailsForm booking={selectedBooking} onUpdate={updateBookingStatus} />}
                          </DialogContent>
                        </Dialog>

                        {booking.meetingLink && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4" />
                            </a>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelBooking(booking.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Booking Details Form Component
function BookingDetailsForm({ booking, onUpdate }: { booking: AuditBooking; onUpdate: (id: string, status: string, notes?: string) => void }) {
  const [status, setStatus] = useState(booking.status)
  const [notes, setNotes] = useState(booking.adminNotes || '')
  const [preparationNotes, setPreparationNotes] = useState(booking.preparationNotes || '')

  const handleSave = () => {
    onUpdate(booking.id, status, notes)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="audit">Audit Info</TabsTrigger>
          <TabsTrigger value="admin">Admin Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client Name</Label>
              <div className="text-gray-200 p-2 bg-white/5 rounded">{booking.clientName}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="text-gray-200 p-2 bg-white/5 rounded">{booking.clientEmail}</div>
            </div>
            <div>
              <Label>Company</Label>
              <div className="text-gray-200 p-2 bg-white/5 rounded">{booking.companyName || 'N/A'}</div>
            </div>
            <div>
              <Label>Industry</Label>
              <div className="text-gray-200 p-2 bg-white/5 rounded">{booking.industry || 'N/A'}</div>
            </div>
            <div>
              <Label>Company Size</Label>
              <div className="text-gray-200 p-2 bg-white/5 rounded">{booking.companySize || 'N/A'}</div>
            </div>
            <div>
              <Label>Revenue Range</Label>
              <div className="text-gray-200 p-2 bg-white/5 rounded">{booking.currentRevenue || 'N/A'}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div>
            <Label>Audit Type</Label>
            <div className="text-gray-200 p-2 bg-white/5 rounded">{booking.auditType.replace('_', ' ')}</div>
          </div>

          <div>
            <Label>Pain Points</Label>
            <div className="text-gray-200 p-2 bg-white/5 rounded min-h-[60px]">
              {booking.painPoints.length > 0 ? booking.painPoints.join(', ') : 'None specified'}
            </div>
          </div>

          <div>
            <Label>Goals</Label>
            <div className="text-gray-200 p-2 bg-white/5 rounded min-h-[60px]">
              {booking.goals.length > 0 ? booking.goals.join(', ') : 'None specified'}
            </div>
          </div>

          <div>
            <Label>Additional Notes</Label>
            <div className="text-gray-200 p-2 bg-white/5 rounded min-h-[80px]">
              {booking.additionalNotes || 'None provided'}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <div>
            <Label>Status</Label>
             <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger className="glass-card border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
                <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Admin Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this booking..."
              className="glass-card border-white/20 bg-white/5"
            />
          </div>

          <div>
            <Label>Preparation Notes</Label>
            <Textarea
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              placeholder="Notes for preparation..."
              className="glass-card border-white/20 bg-white/5"
            />
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-blue-500">
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  )
}
