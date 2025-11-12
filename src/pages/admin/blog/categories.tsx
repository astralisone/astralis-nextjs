import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApi, useApiMutation } from "@/hooks/useApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from '@/components/ui/use-toast';

// Category type
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    posts: number;
  };
}

// Form validation schema
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function BlogCategoriesPage() {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch categories
  const { 
    data: categoriesData, 
    error, 
    isLoading,
    refetch
  } = useApi<{ status: string; data: Category[] }>('/blog/categories');

  // Add console logs for debugging
  console.log('categoriesData:', categoriesData);
  console.log('isLoading:', isLoading);
  console.log('error:', error);

  // Extract the categories array from the response with defensive checks
  const categories: Category[] = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
  console.log('categories array:', categories);

  // Setup add mutation
  const { 
    mutate: addCategory, 
    isLoading: isAddingCategory 
  } = useApiMutation<any, CategoryFormValues>('/blog/categories', {
    onSuccess: () => {
      setIsAddDialogOpen(false);
      setActionSuccess("Category added successfully");
      refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to add category");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setActionError(null);
      }, 3000);
    },
  });

  // Setup edit mutation
  const { 
    mutate: updateCategory, 
    isLoading: isUpdatingCategory 
  } = useApiMutation<any, CategoryFormValues>(`/blog/categories/${categoryToEdit?.id}`, {
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setCategoryToEdit(null);
      setActionSuccess("Category updated successfully");
      refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to update category");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setActionError(null);
      }, 3000);
    },
  });

  // Setup delete mutation
  const { 
    mutate: deleteCategoryMutation, 
    isLoading: isDeletingCategory 
  } = useApiMutation<any, { id: number }>(`/blog/categories/delete`, {
    method: 'DELETE',
    onSuccess: () => {
      setCategoryToDelete(null);
      setActionSuccess("Category deleted successfully");
      refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    },
    onError: (error) => {
      setActionError(error.message || "Failed to delete category");
      setCategoryToDelete(null);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setActionError(null);
      }, 3000);
    },
  });

  // Setup forms
  const addForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: categoryToEdit?.name || "",
      slug: categoryToEdit?.slug || "",
      description: categoryToEdit?.description || "",
    },
  });

  // Reset edit form when category to edit changes
  useEffect(() => {
    if (categoryToEdit) {
      editForm.reset({
        name: categoryToEdit.name,
        slug: categoryToEdit.slug,
        description: categoryToEdit.description,
      });
    }
  }, [categoryToEdit, editForm]);

  const handleAddSubmit = (data: CategoryFormValues) => {
    addCategory(data);
  };

  const handleEditSubmit = (data: CategoryFormValues) => {
    if (categoryToEdit) {
      updateCategory(data, "PATCH");
    }
  };

  const confirmDelete = () => {
    if (categoryToDelete?.id) {
      deleteCategoryMutation({ id: Number(categoryToDelete.id) });
    }
  };

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    return slug;
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    form: ReturnType<typeof useForm<CategoryFormValues>>
  ) => {
    const name = e.target.value;
    form.setValue("name", name);
    
    // Only auto-generate slug if it's empty or matches the previous auto-generated slug
    const currentSlug = form.getValues("slug");
    const previousName = categoryToEdit?.name || "";
    const previousSlug = categoryToEdit?.slug || "";
    
    if (!currentSlug || currentSlug === generateSlug(previousName) || currentSlug === previousSlug) {
      form.setValue("slug", generateSlug(name));
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Blog Categories</h1>
      </div>

      {/* Success/Error Messages */}
      {actionSuccess && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {actionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Add Category Button */}
      <div className="mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)}>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for blog posts.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...addForm.register("name")}
                    onChange={(e) => handleNameChange(e, addForm)}
                  />
                  {addForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {addForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" {...addForm.register("slug")} />
                  {addForm.formState.errors.slug && (
                    <p className="text-sm text-destructive">
                      {addForm.formState.errors.slug.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...addForm.register("description")}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAddingCategory}>
                  {isAddingCategory && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[50px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-destructive">
                  Error loading categories. Please try again.
                </TableCell>
              </TableRow>
            ) : !categories || categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No categories found. Create your first category!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category: Category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>{category._count.posts}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={isEditDialogOpen && categoryToEdit?.id === category.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setCategoryToEdit(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCategoryToEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                              <DialogDescription>
                                Update the category details.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                  id="edit-name"
                                  {...editForm.register("name")}
                                  onChange={(e) => handleNameChange(e, editForm)}
                                />
                                {editForm.formState.errors.name && (
                                  <p className="text-sm text-destructive">
                                    {editForm.formState.errors.name.message}
                                  </p>
                                )}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-slug">Slug *</Label>
                                <Input id="edit-slug" {...editForm.register("slug")} />
                                {editForm.formState.errors.slug && (
                                  <p className="text-sm text-destructive">
                                    {editForm.formState.errors.slug.message}
                                  </p>
                                )}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  {...editForm.register("description")}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditDialogOpen(false);
                                  setCategoryToEdit(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isUpdatingCategory}>
                                {isUpdatingCategory && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCategoryToDelete(category)}
                            disabled={category._count.posts > 0}
                            title={category._count.posts > 0 ? "Cannot delete category with posts" : "Delete category"}
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
                              category "{categoryToDelete?.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDelete}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeletingCategory ? "Deleting..." : "Delete"}
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
    </AdminLayout>
  );
} 