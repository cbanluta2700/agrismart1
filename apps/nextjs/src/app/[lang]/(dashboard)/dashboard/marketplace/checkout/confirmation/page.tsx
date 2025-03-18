"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, ShoppingBag, Truck, CalendarClock } from "lucide-react";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Separator } from "@saasfly/ui/separator";

export default function OrderConfirmationPage() {
  // Generate a random order number
  const orderNumber = `AGS-${Math.floor(Math.random() * 1000000)}`;
  
  // Get the current date for the order date
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  // Estimated delivery date (7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Order Confirmation"
        text="Thank you for your purchase"
      />
      
      <div className="mx-auto max-w-3xl">
        <Card className="mb-6 overflow-hidden">
          <div className="bg-primary px-6 py-12 text-center text-primary-foreground">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Order Successfully Placed!</h2>
            <p>Your order has been received and is now being processed.</p>
          </div>
          
          <CardContent className="p-6">
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-medium text-muted-foreground">Order Number</h3>
                <p className="text-lg font-medium">{orderNumber}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-muted-foreground">Order Date</h3>
                <p className="text-lg font-medium">{orderDate}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="my-6">
              <h3 className="mb-3 text-lg font-medium">Order Status</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 flex justify-center">
                      <ShoppingBag className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-medium">Order Received</h4>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ve received your order
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 flex justify-center">
                      <Truck className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium">Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      Your order is being prepared
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 flex justify-center">
                      <CalendarClock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium">Estimated Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      {estimatedDelivery}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Separator />
            
            <div className="my-6">
              <h3 className="mb-3 text-lg font-medium">What&apos;s Next?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                  <p className="text-sm">
                    You will receive an email confirmation with your order details
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                  <p className="text-sm">
                    The seller will prepare your order and ship it
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                  <p className="text-sm">
                    You will receive shipping updates via email
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary p-0.5 text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                  <p className="text-sm">
                    Once delivered, you can leave a review for the products
                  </p>
                </li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 p-6 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/marketplace/browse">
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/dashboard/marketplace/orders">
                <span>View Your Orders</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Have questions about your order?{" "}
            <Link href="/dashboard/support" className="font-medium text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
