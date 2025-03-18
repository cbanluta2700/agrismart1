import { Product } from "~/types/product";

const agriProductData: Product[] = [
  {
    id: 1,
    title: "Organic Vegetable Seeds Bundle",
    description: "A collection of 15 organic vegetable seed varieties perfect for home gardens.",
    price: 29.99,
    discountedPrice: 24.99,
    reviews: 42,
    imgs: {
      thumbnails: [
        "/images/products/agri-1-sm-1.png",
        "/images/products/agri-1-sm-2.png",
      ],
      previews: [
        "/images/products/agri-1-bg-1.png",
        "/images/products/agri-1-bg-2.png",
      ],
    },
    category: "Seeds & Plants",
    tags: ["organic", "vegetable", "seeds"],
    stock: 250,
    seller: {
      id: "1",
      name: "Green Thumb Farms"
    }
  },
  {
    id: 2,
    title: "Premium Soil Fertilizer - 10kg Bag",
    description: "All-purpose organic fertilizer for crops and gardens, rich in nutrients.",
    price: 45.00,
    discountedPrice: 39.99,
    reviews: 28,
    imgs: {
      thumbnails: [
        "/images/products/agri-2-sm-1.png",
        "/images/products/agri-2-sm-2.png",
      ],
      previews: [
        "/images/products/agri-2-bg-1.png",
        "/images/products/agri-2-bg-2.png",
      ],
    },
    category: "Fertilizers",
    tags: ["organic", "fertilizer", "soil"],
    stock: 120,
    seller: {
      id: "2",
      name: "EcoGrow Solutions"
    }
  },
  {
    id: 3,
    title: "Drip Irrigation Kit - 50 Plants",
    description: "Complete drip irrigation system for small to medium gardens, water-saving design.",
    price: 89.99,
    discountedPrice: 75.00,
    reviews: 56,
    imgs: {
      thumbnails: [
        "/images/products/agri-3-sm-1.png",
        "/images/products/agri-3-sm-2.png",
      ],
      previews: [
        "/images/products/agri-3-bg-1.png",
        "/images/products/agri-3-bg-2.png",
      ],
    },
    category: "Irrigation",
    tags: ["irrigation", "water-saving", "garden"],
    stock: 85,
    seller: {
      id: "3",
      name: "AquaSave Systems"
    }
  },
  {
    id: 4,
    title: "Premium Garden Tool Set - 10 Pieces",
    description: "Professional-grade gardening tools with ergonomic handles and stainless steel construction.",
    price: 75.00,
    discountedPrice: 59.99,
    reviews: 47,
    imgs: {
      thumbnails: [
        "/images/products/agri-4-sm-1.png",
        "/images/products/agri-4-sm-2.png",
      ],
      previews: [
        "/images/products/agri-4-bg-1.png",
        "/images/products/agri-4-bg-2.png",
      ],
    },
    category: "Farming Tools",
    tags: ["tools", "garden", "equipment"],
    stock: 65,
    seller: {
      id: "4",
      name: "FarmTools Pro"
    }
  },
  {
    id: 5,
    title: "Organic Pest Control Spray - 1L",
    description: "Chemical-free pest control solution safe for organic farming and gardens.",
    price: 24.99,
    discountedPrice: 19.99,
    reviews: 32,
    imgs: {
      thumbnails: [
        "/images/products/agri-5-sm-1.png",
        "/images/products/agri-5-sm-2.png",
      ],
      previews: [
        "/images/products/agri-5-bg-1.png",
        "/images/products/agri-5-bg-2.png",
      ],
    },
    category: "Pesticides",
    tags: ["organic", "pest-control", "spray"],
    stock: 110,
    seller: {
      id: "2",
      name: "EcoGrow Solutions"
    }
  },
  {
    id: 6,
    title: "Greenhouse Growing Kit - 4x6ft",
    description: "Easy-to-assemble greenhouse kit with UV-resistant cover and sturdy frame.",
    price: 199.99,
    discountedPrice: 169.99,
    reviews: 18,
    imgs: {
      thumbnails: [
        "/images/products/agri-6-sm-1.png",
        "/images/products/agri-6-sm-2.png",
      ],
      previews: [
        "/images/products/agri-6-bg-1.png",
        "/images/products/agri-6-bg-2.png",
      ],
    },
    category: "Equipment",
    tags: ["greenhouse", "growing", "structure"],
    stock: 25,
    seller: {
      id: "5",
      name: "GreenSpace Solutions"
    }
  },
  {
    id: 7,
    title: "Heirloom Tomato Seeds Collection",
    description: "Set of 10 rare heirloom tomato varieties with diverse colors and flavors.",
    price: 18.99,
    discountedPrice: 15.99,
    reviews: 63,
    imgs: {
      thumbnails: [
        "/images/products/agri-7-sm-1.png",
        "/images/products/agri-7-sm-2.png",
      ],
      previews: [
        "/images/products/agri-7-bg-1.png",
        "/images/products/agri-7-bg-2.png",
      ],
    },
    category: "Seeds & Plants",
    tags: ["heirloom", "tomato", "seeds"],
    stock: 180,
    seller: {
      id: "1",
      name: "Green Thumb Farms"
    }
  },
  {
    id: 8,
    title: "Smart Soil Moisture Sensor",
    description: "Wireless sensor that monitors soil moisture and sends alerts to your smartphone.",
    price: 49.99,
    discountedPrice: 39.99,
    reviews: 26,
    imgs: {
      thumbnails: [
        "/images/products/agri-8-sm-1.png",
        "/images/products/agri-8-sm-2.png",
      ],
      previews: [
        "/images/products/agri-8-bg-1.png",
        "/images/products/agri-8-bg-2.png",
      ],
    },
    category: "Technology",
    tags: ["smart", "sensor", "technology"],
    stock: 45,
    seller: {
      id: "6",
      name: "AgriTech Innovations"
    }
  },
];

export default agriProductData;
