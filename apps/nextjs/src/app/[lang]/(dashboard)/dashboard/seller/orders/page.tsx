import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Filter, PackageOpen, Truck, CheckCircle, XCircle } from "lucide-react";

import { getCurrentUser } from "@saasfly/auth";
import { db } from "@saasfly/db";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Badge } from "@saasfly/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Order Management",
  description: "Manage and fulfill customer orders",
};

// Helper function to format date
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Helper function to get badge variant based on order status
function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return {
        variant: "outline" as const,
        className: "bg-yellow-100",
        icon: <PackageOpen className="mr-1 h-3 w-3" />,
        label: "Pending",
      };
    case "processing":
      return {
        variant: "outline" as const,
        className: "bg-blue-100",
        icon: <PackageOpen className="mr-1 h-3 w-3" />,
        label: "Processing",
      };
    case "shipped":
      return {
        variant: "outline" as const,
        className: "bg-indigo-100",
        icon: <Truck className="mr-1 h-3 w-3" />,
        label: "Shipped",
      };
    case "delivered":
      return {
        variant: "outline" as const,
        className: "bg-green-100",
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
        label: "Delivered",
      };
    case "cancelled":
      return {
        variant: "outline" as const,
        className: "bg-red-100",
        icon: <XCircle className="mr-1 h-3 w-3" />,
        label: "Cancelled",
      };
    default:
      return {
        variant: "outline" as const,
        className: "",
        icon: null,
        label: status,
      };
  }
}

export default async function SellerOrdersPage({
  params: { lang },
  searchParams,
}: {
  params: {
    lang: Locale;
  };
  searchParams: { status?: string };
}) {
  const user = await getCurrentUser();
  
  // Redirect if not authenticated
  if (!user) {
    redirect(`/${lang}/login`);
  }
  
  const dict = await getDictionary(lang);
  const currentStatus = searchParams.status || "all";
  
  // Fetch all order items where the seller is the current user
  const sellerOrders = await db.selectFrom("OrderItem")
    .innerJoin("Product", "Product.id", "OrderItem.productId")
    .innerJoin("Order", "Order.id", "OrderItem.orderId")
    .where("Product.sellerId", "=", user.id)
    .select([
      "OrderItem.id as orderItemId",
      "OrderItem.quantity",
      "OrderItem.priceAtPurchase",
      "OrderItem.createdAt as orderItemCreatedAt",
      "Product.id as productId",
      "Product.name as productName",
      "Product.images as productImages",
      "Order.id as orderId",
      "Order.userId as buyerId",
      "Order.status",
      "Order.createdAt as orderCreatedAt",
      "Order.shippingAddress",
    ])
    .orderBy("Order.createdAt", "desc")
    .execute();
  
  // Group order items by order ID to show consolidated orders
  const orderMap = new Map();
  for (const item of sellerOrders) {
    if (!orderMap.has(item.orderId)) {
      orderMap.set(item.orderId, {
        orderId: item.orderId,
        buyerId: item.buyerId,
        status: item.status,
        createdAt: item.orderCreatedAt,
        shippingAddress: item.shippingAddress,
        items: [],
        totalAmount: 0,
      });
    }
    const order = orderMap.get(item.orderId);
    order.items.push({
      id: item.orderItemId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImages ? item.productImages[0] : null,
      quantity: item.quantity,
      price: item.priceAtPurchase,
    });
    order.totalAmount += item.quantity * item.priceAtPurchase;
  }
  
  // Convert the map to an array of orders
  let orders = Array.from(orderMap.values());
  
  // Filter orders by status if requested
  if (currentStatus !== "all") {
    orders = orders.filter(order => order.status === currentStatus);
  }
  
  // Calculate order statistics
  const pendingCount = sellerOrders.filter(order => order.status === "pending").length;
  const processingCount = sellerOrders.filter(order => order.status === "processing").length;
  const shippedCount = sellerOrders.filter(order => order.status === "shipped").length;
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Order Management"
        text="View and manage customer orders for your products."
      >
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </DashboardHeader>
      
      {/* Order Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellerOrders.length}</div>
            <p className="text-xs text-muted-foreground">All orders from your buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-xs text-muted-foreground">Orders being prepared</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippedCount}</div>
            <p className="text-xs text-muted-foreground">Orders in transit</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Tabs */}
      <Tabs defaultValue={currentStatus} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentStatus} className="space-y-4">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => {
                const { variant, className, icon, label } = getStatusBadge(order.status);
                
                return (
                  <Card key={order.orderId}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Order #{order.orderId.substring(0, 8)}
                          </CardTitle>
                          <CardDescription>
                            Placed on {formatDate(order.createdAt)}
                          </CardDescription>
                        </div>
                        <Badge variant={variant} className={className}>
                          {icon} {label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items List */}
                        <div className="rounded-md border">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center p-4 border-b last:border-0">
                              <div className="h-10 w-10 bg-muted rounded-md mr-4">
                                {item.productImage && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="h-full w-full object-cover rounded-md"
                                  />
                                )}
                              </div>
                              <div className="flex-1 grid gap-1">
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </div>
                              </div>
                              <div className="font-medium">
                                ${(item.quantity * item.price).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Order Actions */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-sm">
                            <span className="font-medium">Total:</span> ${order.totalAmount.toFixed(2)}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/dashboard/seller/orders/${order.orderId}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                            {(order.status === "pending" || order.status === "processing") && (
                              <Link href={`/dashboard/seller/orders/${order.orderId}/fulfill`}>
                                <Button size="sm">
                                  Process Order
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyPlaceholder>
              <EmptyPlaceholder.Icon name="Post" />
              <EmptyPlaceholder.Title>No orders found</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                No orders matching the selected status.
              </EmptyPlaceholder.Description>
            </EmptyPlaceholder>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
