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
import { BlogPost } from "@/types/api";

export default function BlogAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [order, setOrder] = useState("desc");
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
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

  // Fetch blog posts
  const { 
    data: blogData, 
    error, 
    isLoading,
    refetch
  } = useApi<{ posts: BlogPost[], pagination: any }>(`/blog?${queryString}`);

  // Fetch categories for filter
  const { 
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useApi<Array<{ id: string, name: string, slug: string, description: string, _count: { posts: number } }>>('/blog/categories');

  // Safely access posts and pagination with fallbacks
  const posts = blogData?.posts || [];
  const pagination = blogData?.pagination || { 
    page: 1, 
    totalPages: 1, 
    hasNextPage: false, 
    hasPrevPage: false 
  };

  // Debug categories data whenever it changes
  useEffect(() => {
    console.log('BlogAdminPage - categoriesData:', categoriesData);
    console.log('BlogAdminPage - categoriesLoading:', categoriesLoading);
    console.log('BlogAdminPage - categoriesError:', categoriesError);
    
    if (categoriesData) {
      console.log('BlogAdminPage - categoriesData length:', categoriesData.length);
      if (categoriesData.length > 0) {
        console.log('BlogAdminPage - first category:', categoriesData[0]);
      }
    }
  }, [categoriesData, categoriesLoading, categoriesError]);

  // Add debug logging for blog posts data
  useEffect(() => {
    console.log('BlogAdminPage - blogData:', blogData);
    console.log('BlogAdminPage - posts array:', posts);
    console.log('BlogAdminPage - pagination:', pagination);
    console.log('BlogAdminPage - isLoading:', isLoading);
    console.log('BlogAdminPage - error:', error);
    
    // Log the query string being used
    console.log('BlogAdminPage - queryString:', queryString);
    
    // Check if we're getting the expected structure
    if (blogData) {
      console.log('BlogAdminPage - blogData structure:', {
        hasPostsProperty: blogData.hasOwnProperty('posts'),
        postsType: Array.isArray(blogData.posts) ? 'array' : typeof blogData.posts,
        hasPagination: blogData.hasOwnProperty('pagination'),
        paginationType: typeof blogData.pagination
      });
    }
  }, [blogData, posts, pagination, isLoading, error, queryString]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
  };

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePost({}, "DELETE");
    }
  };

  const cancelDelete = () => {
    setPostToDelete(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'default';
      case 'DRAFT':
        return 'secondary';
      case 'ARCHIVED':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Setup delete mutation
  const { 
    mutate: deletePost, 
    isLoading: isDeletingPost 
  } = useApiMutation<any, any>(`/blog/${postToDelete?.id}`, {
    onSuccess: () => {
      setPostToDelete(null);
      setDeleteSuccess("Post deleted successfully");
      refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setDeleteError(error.message || "Failed to delete post");
      setPostToDelete(null);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    },
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button asChild>
          <Link href="/admin/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Post
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
            placeholder="Search posts..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
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
                  onClick={() => handleSort("category")}
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("viewCount")}
                >
                  Views
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("publishedAt")}
                >
                  Published Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-6 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[50px]" />
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
                  Error loading blog posts. Please try again.
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No blog posts found. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {post.featuredImage && (
                        <img 
                          src={post.featuredImage} 
                          alt={post.title} 
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <span className="truncate max-w-[200px]">{post.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{post.category.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(post.status)}
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.viewCount}</TableCell>
                  <TableCell>
                    {post.publishedAt 
                      ? new Date(post.publishedAt).toLocaleDateString() 
                      : "Not published"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/blog/${post.slug}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/blog/${post.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteClick(post)}
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
                              blog post "{postToDelete?.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={confirmDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeletingPost ? "Deleting..." : "Delete"}
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