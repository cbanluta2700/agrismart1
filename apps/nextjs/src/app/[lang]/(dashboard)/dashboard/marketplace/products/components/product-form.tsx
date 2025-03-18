"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "next-auth";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { cn } from "@saasfly/ui";
import { buttonVariants } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import * as Icons from "@saasfly/ui/icons";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { Textarea } from "@saasfly/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@saasfly/ui/select";
import { toast } from "@saasfly/ui/use-toast";

import { productSchema } from "~/lib/validations/product";
import { trpc } from "~/trpc/client";

interface ProductFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: User;
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
  };
}

type FormData = z.infer<typeof productSchema>;

export function ProductForm({ user, product, className, ...props }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  
  // Fetch categories
  React.useEffect(() => {
    async function fetchCategories() {
      const response = await trpc.products.getCategories.query();
      if (response) {
        setCategories(response);
      }
    }
    fetchCategories();
  }, []);
  
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      categoryId: product?.categoryId ?? "",
      images: product?.images ?? [""],
    },
  });

  async function onSubmit(data: FormData) {
    setIsSaving(true);

    try {
      if (product) {
        // Update existing product
        const response = await trpc.products.update.mutate({
          id: product.id,
          ...data,
        });
        
        toast({
          description: "Your product has been updated.",
        });
        
        router.push("/dashboard/marketplace/products");
      } else {
        // Create new product
        const response = await trpc.products.create.mutate(data);
        
        toast({
          description: "Your product has been created.",
        });
        
        router.push("/dashboard/marketplace/products");
      }
    } catch (error: any) {
      toast({
        title: "Something went wrong.",
        description: error.message || "Your product was not saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>{product ? "Edit Product" : "Create New Product"}</CardTitle>
          <CardDescription>
            {product 
              ? "Update your product information." 
              : "Add a new product to the marketplace."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5">
            {/* Product Name */}
            <div className="grid gap-1">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                className="w-full"
                {...register("name")}
              />
              {errors?.name && (
                <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            {/* Product Description */}
            <div className="grid gap-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="min-h-[120px] w-full"
                {...register("description")}
              />
              {errors?.description && (
                <p className="px-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            {/* Product Category */}
            <div className="grid gap-1">
              <Label htmlFor="categoryId">Category</Label>
              <Select 
                defaultValue={product?.categoryId} 
                onValueChange={(value) => setValue("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.categoryId && (
                <p className="px-1 text-xs text-red-600">{errors.categoryId.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Product Price */}
              <div className="grid gap-1">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors?.price && (
                  <p className="px-1 text-xs text-red-600">{errors.price.message}</p>
                )}
              </div>
              
              {/* Product Stock */}
              <div className="grid gap-1">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  className="w-full"
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors?.stock && (
                  <p className="px-1 text-xs text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>
            
            {/* Product Images */}
            <div className="grid gap-1">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                className="w-full"
                placeholder="https://example.com/image.jpg"
                {...register("images.0")}
              />
              {errors?.images && (
                <p className="px-1 text-xs text-red-600">{errors.images.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <button
            type="submit"
            className={cn(buttonVariants(), className)}
            disabled={isSaving}
          >
            {isSaving && (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>{product ? "Update Product" : "Create Product"}</span>
          </button>
        </CardFooter>
      </Card>
    </form>
  );
}
