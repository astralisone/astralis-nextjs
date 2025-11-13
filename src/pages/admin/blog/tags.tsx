import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
} from '@/components/ui/alert-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
  postsCount?: number;
  createdAt: string;
  updatedAt: string;
}

const tagSchema = z.object({
  name: z.string().min(2, { message: 'Tag name must be at least 2 characters' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters' }).regex(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  }),
});

type TagFormValues = z.infer<typeof tagSchema>;

export default function BlogTagsPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [addError, setAddError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const { 
    data: tagsData, 
    error: tagsError, 
    isLoading: tagsLoading,
    refetch
  } = useApi<{ status: string; data: Tag[] }>('/api/blog/tags');

  // Add console logs for debugging
  console.log('tagsData:', tagsData);
  console.log('tagsLoading:', tagsLoading);
  console.log('tagsError:', tagsError);

  // Extract the tags array from the response with more defensive checks
  const tags: Tag[] = Array.isArray(tagsData?.data) ? tagsData.data : [];
  console.log('tags array:', tags);

  useEffect(() => {
    if (currentTag) {
      form.setValue('name', currentTag.name);
      form.setValue('slug', currentTag.slug);
    }
  }, [currentTag, form]);

  const { mutate: addTag, isLoading: isAddingTag } = useApiMutation<Tag, TagFormValues>('/blog/tags', {
    onSuccess: () => {
      setAddError('');
      form.reset({ name: '', slug: '' });
      refetch();
    },
    onError: (error: any) => {
      setAddError(error.message || 'Failed to add tag');
      setTimeout(() => setAddError(''), 3000);
    },
  });

  const { mutate: updateTag, isLoading: isUpdatingTag } = useApiMutation<TagFormValues & { id: string }, Tag>(`/blog/tags/${currentTag?.id}`, {
    onSuccess: () => {
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setIsEditing(false);
      setCurrentTag(null);
      form.reset({ name: '', slug: '' });
      refetch();
    },
    onError: (error: any) => {
      setAddError(error.message || 'Failed to update tag');
      setTimeout(() => setAddError(''), 3000);
    },
  });

  const { mutate: deleteTag, isLoading: isDeletingTag } = useApiMutation<{ success: boolean }, null>(`/blog/tags/${tagToDelete?.id}`, {
    method: 'DELETE',
    onSuccess: () => {
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
      setTagToDelete(null);
      refetch();
    },
    onError: (error: any) => {
      setAddError(error.message || 'Failed to delete tag');
      setTimeout(() => setAddError(''), 3000);
    },
  });

  const onSubmit = (data: TagFormValues) => {
    if (isEditing && currentTag) {
      updateTag({ ...data, id: currentTag.id } as Tag);
    } else {
      addTag(data);
    }
  };

  const handleEditClick = (tag: Tag) => {
    setCurrentTag(tag);
    setIsEditing(true);
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
  };

  const confirmDelete = () => {
    if (tagToDelete) {
      deleteTag(null);
    }
  };

  const cancelDelete = () => {
    setTagToDelete(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentTag(null);
    form.reset({ name: '', slug: '' });
  };

  const generateSlug = () => {
    const name = form.getValues('name');
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      form.setValue('slug', slug);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Blog Tags</h1>
          <Button onClick={() => router.push('/admin/blog')}>Back to Blog Admin</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Tag' : 'Add New Tag'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update the tag details below'
                : 'Create a new tag for categorizing blog posts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {addError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{addError}</AlertDescription>
              </Alert>
            )}

            {updateSuccess && (
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Tag updated successfully</AlertDescription>
              </Alert>
            )}

            {deleteSuccess && (
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Tag deleted successfully</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Tag name"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEditing) {
                              generateSlug();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="tag-slug" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isAddingTag || isUpdatingTag}>
                    {isEditing ? 'Update Tag' : 'Add Tag'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Manage your blog tags</CardDescription>
          </CardHeader>
          <CardContent>
            {tagsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : tagsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load tags</AlertDescription>
              </Alert>
            ) : !tags || tags.length === 0 ? (
              <p className="text-center py-4">No tags found. Create your first tag above.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag: Tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell>{tag.slug}</TableCell>
                        <TableCell>{tag.postsCount || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(tag)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteClick(tag)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the tag "{tag.name}".
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={cancelDelete}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction onClick={confirmDelete}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 