import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@saasfly/db";
import { getCurrentUser } from "@saasfly/auth";

// Validate the incoming request body
const updateInventorySchema = z.record(z.string(), z.number().int().min(0));

export async function POST(request: Request) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const updates: Record<string, number> = {};
    
    // Extract product IDs and their new stock quantities
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('stock-')) {
        const productId = key.replace('stock-', '');
        const quantity = parseInt(value as string, 10);
        
        if (!isNaN(quantity) && quantity >= 0) {
          updates[productId] = quantity;
        }
      }
    }
    
    // Validate the updates
    const validatedData = updateInventorySchema.safeParse(updates);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid inventory data" },
        { status: 400 }
      );
    }
    
    // Get all product IDs belonging to the user
    const userProducts = await db.selectFrom("Product")
      .where("sellerId", "=", user.id)
      .select(["id"])
      .execute();
    
    const userProductIds = new Set(userProducts.map(p => p.id));
    
    // Process the inventory updates in a transaction
    await db.transaction().execute(async (trx) => {
      for (const [productId, quantity] of Object.entries(updates)) {
        // Security check: only update products owned by the user
        if (userProductIds.has(productId)) {
          // Get current product data
          const product = await trx.selectFrom("Product")
            .where("id", "=", productId)
            .selectAll()
            .executeTakeFirst();
          
          if (product) {
            // Update the stock quantity
            await trx.updateTable("Product")
              .set({
                stock: {
                  ...product.stock,
                  quantity: quantity,
                },
                updatedAt: new Date(),
              })
              .where("id", "=", productId)
              .execute();
          }
        }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
