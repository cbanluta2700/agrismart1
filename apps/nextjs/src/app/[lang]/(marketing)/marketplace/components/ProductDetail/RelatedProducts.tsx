import React from "react";
import Link from "next/link";
import agriProductData from "../Shop/agriProductData";
import { Product } from "~/types/product";
import ProductItem from "../Common/ProductItem";

interface RelatedProductsProps {
  categoryName: string;
  currentProductId: number;
}

const RelatedProducts = ({
  categoryName,
  currentProductId,
}: RelatedProductsProps) => {
  // Filter products by same category and exclude current product
  const relatedProducts = agriProductData
    .filter(
      (product) => 
        product.category === categoryName && 
        product.id !== currentProductId
    )
    .slice(0, 4); // Limit to 4 related products

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Related Products</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/marketplace" 
          className="inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
};

export default RelatedProducts;
