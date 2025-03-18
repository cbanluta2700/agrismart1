import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(3).max(100).nonempty("Product name is required"),
  description: z.string().min(10).max(1000).nonempty("Description is required"),
  price: z.number().min(0.01, "Price must be greater than 0").nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  categoryId: z.string().uuid().nonempty("Category is required"),
  images: z.array(z.string().url("Must be a valid URL")).min(1, "At least one image is required"),
});
