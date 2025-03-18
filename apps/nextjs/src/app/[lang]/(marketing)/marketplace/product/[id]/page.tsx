import { Metadata } from "next";
import { notFound } from "next/navigation";

import agriProductData from "../../components/Shop/agriProductData";
import Breadcrumb from "../../components/Common/Breadcrumb";
import ProductDetail from "../../components/ProductDetail";
import Newsletter from "../../components/Common/Newsletter";
import RelatedProducts from "../../components/ProductDetail/RelatedProducts";
import { Product } from "~/types/product";

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const productId = parseInt(params.id);
  const product = agriProductData.find((item: Product) => item.id === productId);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.title,
    description: product.description,
  };
}

export default function ProductDetailPage({ params }: Props) {
  const productId = parseInt(params.id);
  const product = agriProductData.find((item: Product) => item.id === productId);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Breadcrumb
        title={product.title}
        pages={["Marketplace", product.category || "", product.title]}
      />

      <div className="container mx-auto my-8 px-4">
        <ProductDetail product={product} />
      </div>

      <div className="container mx-auto my-16 px-4">
        <RelatedProducts 
          categoryName={product.category || ""} 
          currentProductId={product.id} 
        />
      </div>

      <Newsletter />
    </>
  );
}
