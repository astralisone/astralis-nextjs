import { useState, useEffect } from "react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { MarketplaceItem } from "@/types/marketplace";
import { formatCurrency } from "@/lib/utils";

export default function MarketplaceAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [itemToDelete, setItemToDelete] = useState<MarketplaceItem | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Build query string
  const queryString = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
    ...(category !== "all" && { category }),
    ...(status !== "all" && { status }),
    sortBy,
    order,
  }).toString();

  // Fetch marketplace items
  const { 
    data: marketplaceData, 
    error, 
    isLoading,
    refetch
  } = useApi<{ items: MarketplaceItem[], pagination: any }>(`/api/marketplace?${queryString}`);

  // Fetch categories for filter
  const { 
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useApi<Array<{ name: string, slug: string }>>('/api/marketplace/categories');

  // Safely access items and pagination with fallbacks
  const items = marketplaceData?.items || [];
  const pagination = marketplaceData?.pagination || { 
    page: 1, 
    totalPages: 1, 
    hasNextPage: false, 
    hasPrevPage: false 
  };

  // Debug marketplace data whenever it changes
  useEffect(() => {
    console.log('MarketplaceAdminPage - marketplaceData:', marketplaceData);
    console.log('MarketplaceAdminPage - isLoading:', isLoading);
    console.log('MarketplaceAdminPage - error:', error);
    
    if (marketplaceData?.items) {
      console.log('MarketplaceAdminPage - items count:', marketplaceData.items.length);
      if (marketplaceData.items.length > 0) {
        console.log('MarketplaceAdminPage - first item:', marketplaceData.items[0]);
      }
    }
  }, [marketplaceData, isLoading, error]);

  // Debug categories data whenever it changes
  useEffect(() => {
    console.log('MarketplaceAdminPage - categoriesData:', categoriesData);
    console.log('MarketplaceAdminPage - categoriesLoading:', categoriesLoading);
    console.log('MarketplaceAdminPage - categoriesError:', categoriesError);
    
    if (categoriesData) {
      console.log('MarketplaceAdminPage - categories count:', categoriesData.length);
      if (categoriesData.length > 0) {
        console.log('MarketplaceAdminPage - first category:', categoriesData[0]);
      }
    }
  }, [categoriesData, categoriesLoading, categoriesError]);

  // Add detailed logging for marketplace items data
  useEffect(() => {
    console.log('MarketplaceAdminPage - items array:', items);
    console.log('MarketplaceAdminPage - pagination:', pagination);
    
    // Log the query string being used
    console.log('MarketplaceAdminPage - queryString:', queryString);
    
    // Check if we're getting the expected structure
    if (marketplaceData) {
      console.log('MarketplaceAdminPage - marketplaceData structure:', {
        hasItemsProperty: marketplaceData.hasOwnProperty('items'),
        itemsType: Array.isArray(marketplaceData.items) ? 'array' : typeof marketplaceData.items,
        hasPagination: marketplaceData.hasOwnProperty('pagination'),
        paginationType: typeof marketplaceData.pagination
      });
    }
  }, [marketplaceData, items, pagination, queryString]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
  };

  const handleDeleteClick = (item: MarketplaceItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem({}, "DELETE");
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'default';
      case 'SOLD_OUT':
        return 'secondary';
      case 'COMING_SOON':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Setup delete mutation
  const { 
    mutate: deleteItem, 
    isLoading: isDeletingItem 
  } = useApiMutation<any, any>(`/marketplace/${itemToDelete?.id}`, {
    onSuccess: () => {
      setItemToDelete(null);
      setDeleteSuccess("Item deleted successfully");
      
      // Refresh the data by reloading the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setDeleteError(error.message || "Failed to delete item");
      setItemToDelete(null);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    },
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Marketplace Items</h1>
        <Button asChild>
          <Link href="/admin/marketplace/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Link>
        </Button>
      </div>

      {/* Success/Error Messages */}
      {deleteSuccess && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {deleteSuccess}
          </AlertDescription>
        </Alert>
      )}

      {deleteError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoriesData?.length ? (
              categoriesData.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug || cat.name}>
                  {cat.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-categories" disabled>
                No categories available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
            <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-destructive">
                  Error loading marketplace items. Please try again.
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No marketplace items found. Create your first item!
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="h-8 w-8 rounded object-cover"
                      />
                      <span className="truncate max-w-[150px]">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(item.status)}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/marketplace/${item.slug}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/marketplace/${item.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              marketplace item "{itemToDelete?.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={confirmDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeletingItem ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 