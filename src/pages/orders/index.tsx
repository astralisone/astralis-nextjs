import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Package, Calendar, CreditCard, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks"
import axios from "@/lib/axios"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  itemType?: string
  digitalDownloadUrl?: string
  marketplaceItem?: {
    id: string
    title: string
    imageUrl: string
    itemType: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  taxAmount?: number
  shippingAmount?: number
  customerEmail: string
  customerName?: string
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/orders/my-orders')
      setOrders(response.data.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to fetch your orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'fulfilled':
        return 'default'
      case 'processing':
      case 'confirmed':
      case 'shipped':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'cancelled':
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleDownload = async (downloadUrl: string, itemName: string) => {
    try {
      // Create a temporary link and click it to download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = itemName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download started",
        description: `Downloading ${itemName}...`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">My Orders</h1>
            <p className="text-muted-foreground">View and manage your order history</p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card className="glass-card text-center p-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button onClick={() => window.location.href = '/marketplace'}>
                Browse Marketplace
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="glass-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Order {order.orderNumber}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {formatCurrency(order.total)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 backdrop-blur-sm"
                        >
                          {/* Item Image */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                            {item.marketplaceItem?.imageUrl ? (
                              <img
                                src={item.marketplaceItem.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                            <div className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × {formatCurrency(item.price)}
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {formatCurrency(item.subtotal)}
                            </span>
                            
                            {/* Download button for digital items */}
                            {item.digitalDownloadUrl && order.paymentStatus === 'COMPLETED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(item.digitalDownloadUrl!, item.name)}
                                className="flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Order Summary */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="space-y-1">
                        <p>Subtotal: {formatCurrency(order.subtotal)}</p>
                        {order.taxAmount && order.taxAmount > 0 && (
                          <p>Tax: {formatCurrency(order.taxAmount)}</p>
                        )}
                        {order.shippingAmount && order.shippingAmount > 0 && (
                          <p>Shipping: {formatCurrency(order.shippingAmount)}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Total: {formatCurrency(order.total)}</p>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // You could implement an order details modal here
                          console.log('View order details:', order.id)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}