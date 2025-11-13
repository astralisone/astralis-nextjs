import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { BlogPost, Category, Tag } from "@/types/api";

// Form validation schema
const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().optional().nullable(),
  featuredImage: z.string().url("Featured image URL must be a valid URL").optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  categoryId: z.string().min(1, "Category is required"),
  featured: z.boolean(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export default function EditBlogPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch the blog post
  const {
    data: postData,
    error: postError,
    isLoading: postLoading
  } = useApi<{ data: BlogPost }>(`/api/blog/${id}`);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useApi<{ data: Category[] }>('/api/blog/categories');

  // Fetch tags
  const {
    data: tagsData,
    isLoading: tagsLoading
  } = useApi<{ data: Tag[] }>('/api/blog/tags');

  // Setup form with react-hook-form
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featuredImage: "",
      status: "DRAFT",
      categoryId: "",
      featured: false,
    },
  });

  // Update form when post data is loaded
  useEffect(() => {
    if (postData?.data) {
      const post = postData.data;
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        status: post.status,
        categoryId: post.category.id,
        featured: post.featured,
      });
      
      // Set tags
      if (post.tags) {
        setSelectedTags(post.tags.map(tag => tag.id));
      }
    }
  }, [postData, form]);

  // Setup API mutation
  const { mutate, isLoading: isMutating } = useApiMutation<any, any>(`/blog/${id}`, {
    onSuccess: () => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/admin/blog");
      }, 2000);
    },
    onError: (error) => {
      setIsSubmitting(false);
      setSubmitError(error.message || "Failed to update blog post");
    },
  });

  const onSubmit = (data: BlogPostFormValues) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    // Prepare data for API
    const payload = {
      ...data,
      tags: selectedTags,
    };
    
    // Call API
    mutate(payload, "PATCH");
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    form.setValue("slug", slug);
  };

  // Loading state
  if (postLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            <Skeleton className="h-9 w-64" />
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  // Error state
  if (postError) {
    return (
      <AdminLayout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load blog post. Please try again.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
      </div>

      {submitSuccess && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Blog post updated successfully. Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="seo">SEO & Visibility</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Edit the basic details of your blog post.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      onBlur={(e) => {
                        if (!form.getValues("slug")) {
                          generateSlug(e.target.value);
                        }
                      }}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input id="slug" {...form.register("slug")} />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    {...form.register("excerpt")}
                    rows={3}
                    placeholder="A brief summary of your blog post"
                  />
                  {form.formState.errors.excerpt && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.excerpt.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={form.getValues("categoryId")}
                      onValueChange={(value) => form.setValue("categoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading-categories" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : categoriesData?.data?.length ? (
                          categoriesData.data.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            No categories found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.categoryId && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={form.getValues("status")}
                      onValueChange={(value) => form.setValue("status", value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.status && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.status.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tagsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading tags...</p>
                    ) : tagsData?.data?.length ? (
                      tagsData.data.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags found</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  Edit the content of your blog post.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    {...form.register("content")}
                    rows={15}
                    placeholder="Write your blog post content here..."
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    You can use Markdown formatting in your content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>
                  Edit images for your blog post.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <Input
                    id="featuredImage"
                    {...form.register("featuredImage")}
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.formState.errors.featuredImage && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.featuredImage.message}
                    </p>
                  )}
                </div>

                {form.getValues("featuredImage") && (
                  <div className="mt-4">
                    <Label>Image Preview</Label>
                    <div className="mt-2 border rounded-md overflow-hidden w-full max-w-md">
                      <img
                        src={form.getValues("featuredImage") ?? undefined}
                        alt="Preview"
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO & Visibility Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Visibility</CardTitle>
                <CardDescription>
                  Configure visibility settings for your blog post.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={form.getValues("featured")}
                    onCheckedChange={(checked) => form.setValue("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Featured posts are displayed prominently on the homepage and blog page.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blog")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isMutating}
          >
            {(isSubmitting || isMutating) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
} 