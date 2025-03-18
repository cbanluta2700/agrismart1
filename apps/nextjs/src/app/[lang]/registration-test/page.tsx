"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@saasfly/ui/input";
import { Button } from "@saasfly/ui/button";
import { RadioGroup, RadioGroupItem } from "@saasfly/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@saasfly/ui/form";
import { toast } from "@saasfly/ui/toast";
import { Shell } from "~/components/shell";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["BUYER", "SELLER"], { 
    required_error: "Please select a role",
    invalid_type_error: "Please select either Buyer or Seller"
  })
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegistrationTestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "BUYER"
    }
  });
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setFormError(result.message || "Registration failed");
        return;
      }
      
      toast({
        title: "Registration successful!",
        description: `You've been registered as a ${data.role.toLowerCase()}.`,
        variant: "success"
      });
      
      // Redirect based on role
      setTimeout(() => {
        if (data.role === "BUYER") {
          router.push("/en/dashboard/buyer");
        } else {
          router.push("/en/dashboard/seller");
        }
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Shell>
      <div className="container mx-auto py-10">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Register</h1>
            <p className="text-gray-500 dark:text-gray-400">Create an account to get started</p>
          </div>
          
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Account Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-8"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="BUYER" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Buyer
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="SELLER" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Seller
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm">
            <p>
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
