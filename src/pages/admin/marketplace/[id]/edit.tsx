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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, Plus, Save, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { MarketplaceItem } from "@/types/marketplace";
import { Category, Tag } from "@/types/api";

// Form validation schema
const marketplaceItemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().positive("Discount price must be positive").optional().nullable(),
  imageUrl: z.string().url("Image URL must be a valid URL"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["AVAILABLE", "SOLD_OUT", "COMING_SOON"]),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  featured: z.boolean(),
  published: z.boolean(),
});

type MarketplaceItemFormValues = z.infer<typeof marketplaceItemSchema>;

export default function EditMarketplaceItemPage() {
  const router = useRouter();
  const { id } = router.query;
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch the marketplace item
  const {
    data: itemData,
    error: itemError,
    isLoading: itemLoading
  } = useApi<{ data: MarketplaceItem }>(`/api/marketplace/${id}`);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useApi<{ data: Category[] }>('/api/marketplace/categories');

  // Fetch tags
  const {
    data: tagsData,
    isLoading: tagsLoading
  } = useApi<{ data: Tag[] }>('/api/marketplace/tags');

  // Setup form with react-hook-form
  const form = useForm<MarketplaceItemFormValues>({
    resolver: zodResolver(marketplaceItemSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      price: 0,
      discountPrice: null,
      imageUrl: "",
      categoryId: "",
      status: "AVAILABLE",
      stock: 0,
      featured: false,
      published: true,
    },
  });

  // Update form when item data is loaded
  useEffect(() => {
    if (itemData?.data) {
      const item = itemData.data;
      form.reset({
        title: item.title,
        slug: item.slug,
        description: item.description,
        price: item.price,
        discountPrice: item.discountPrice,
        imageUrl: item.imageUrl,
        categoryId: item.category.id,
        status: item.status,
        stock: item.stock,
        featured: item.featured,
        published: item.published,
      });
      
      // Set features and tags
      if (item.features) {
        setFeatures(item.features);
      }
      
      if (item.tags) {
        setSelectedTags(item.tags.map(tag => tag.id));
      }
    }
  }, [itemData, form]);

  // Setup API mutation
  const { mutate, isLoading: isMutating } = useApiMutation<any, any>(`/marketplace/${id}`, {
    onSuccess: () => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/admin/marketplace");
      }, 2000);
    },
    onError: (error) => {
      setIsSubmitting(false);
      setSubmitError(error.message || "Failed to update item");
    },
  });

  const onSubmit = (data: MarketplaceItemFormValues) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    
    // Prepare data for API
    const payload = {
      ...data,
      features,
      tags: selectedTags,
    };
    
    // Call API
    mutate(payload, "PATCH");
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
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
  if (itemLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/marketplace">
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
  if (itemError) {
    return (
      <AdminLayout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Marketplace Item</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load marketplace item. Please try again.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Marketplace Item</h1>
      </div>

      {submitSuccess && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Marketplace item updated successfully. Redirecting...
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
            <TabsTrigger value="details">Details & Features</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="seo">SEO & Visibility</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Edit the basic details of your marketplace item.
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    rows={5}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register("price")}
                    />
                    {form.formState.errors.price && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price ($)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      {...form.register("discountPrice")}
                    />
                    {form.formState.errors.discountPrice && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.discountPrice.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={form.getValues("categoryId")}
                      onValueChange={(value) => form.setValue("categoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                      onValueChange={(value: "AVAILABLE" | "SOLD_OUT" | "COMING_SOON") => 
                        form.setValue("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                        <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.status && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.status.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...form.register("stock")}
                  />
                  {form.formState.errors.stock && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.stock.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details & Features Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Details & Features</CardTitle>
                <CardDescription>
                  Add features and select tags for your marketplace item.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Features</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="gap-1 px-3 py-1">
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleRemoveFeature(feature)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {features.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No features added yet. Add some features to highlight your item.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      disabled={!newFeature.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tagsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading tags...</p>
                    ) : (
                      tagsData?.data.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))
                    )}
                  </div>
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
                  Add images for your marketplace item.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Main Image URL *</Label>
                  <Input
                    id="imageUrl"
                    {...form.register("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.formState.errors.imageUrl && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.imageUrl.message}
                    </p>
                  )}
                </div>

                {form.getValues("imageUrl") && (
                  <div className="mt-4">
                    <Label>Image Preview</Label>
                    <div className="mt-2 border rounded-md overflow-hidden w-full max-w-md">
                      <img
                        src={form.getValues("imageUrl")}
                        alt="Preview"
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Additional images could be added here in the future */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO & Visibility Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Visibility</CardTitle>
                <CardDescription>
                  Configure visibility settings for your marketplace item.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={form.getValues("featured")}
                    onCheckedChange={(checked) => form.setValue("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Item</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Featured items are displayed prominently on the homepage and marketplace.
                </p>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={form.getValues("published")}
                    onCheckedChange={(checked) => form.setValue("published", checked)}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Published items are visible to users. Unpublished items are only visible to admins.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/marketplace")}
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