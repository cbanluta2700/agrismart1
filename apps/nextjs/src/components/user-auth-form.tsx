"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { Input } from "@saasfly/ui/input";
import { Label } from "@saasfly/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";

type Dictionary = Record<string, string>;

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: string;
  dict: Dictionary;
  disabled?: boolean;
  isRegister?: boolean;
}

// Email-only auth schema (for magic link)
const emailAuthSchema = z.object({
  email: z.string().email(),
});

// Email + Password schema for traditional login
const credentialsAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

// Full registration schema with name, email, password, and role
const registerSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
});

type EmailFormData = z.infer<typeof emailAuthSchema>;
type CredentialsFormData = z.infer<typeof credentialsAuthSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function UserAuthForm({
  className,
  lang,
  dict,
  disabled,
  isRegister = false,
  ...props
}: UserAuthFormProps) {
  // State for login methods
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false);
  const [authType, setAuthType] = React.useState<"email" | "credentials">("email");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  const searchParams = useSearchParams();

  // Form for email magic link
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form for credentials login
  const credentialsForm = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsAuthSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form for registration
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "BUYER", // Default role
    },
  });

  // Handler for magic link email
  async function onEmailSubmit(data: EmailFormData) {
    setIsLoading(true);

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") ?? `/${lang}/dashboard`,
    }).catch((error) => {
      console.error("Error during sign in:", error);
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      });
    }

    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

  // Handler for credentials login
  async function onCredentialsSubmit(data: CredentialsFormData) {
    setIsLoading(true);

    const signInResult = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
      callbackUrl: searchParams?.get("from") ?? `/${lang}/dashboard`,
    }).catch((error) => {
      console.error("Error during credentials sign in:", error);
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast({
        title: "Invalid credentials",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      });
    }

    // For login, we'll determine the redirect URL after login success
    // by checking the user's role from the API
    try {
      const response = await fetch(`/api/auth/me`);
      if (response.ok) {
        const user = await response.json();
        if (user.role === "SELLER") {
          window.location.href = `/${lang}/dashboard/seller`;
        } else {
          window.location.href = `/${lang}/dashboard/buyer`;
        }
      } else {
        // Fallback to generic dashboard if role check fails
        window.location.href = searchParams?.get("from") ?? `/${lang}/dashboard`;
      }
    } catch (error) {
      // Fallback to generic dashboard if role check fails
      window.location.href = searchParams?.get("from") ?? `/${lang}/dashboard`;
    }
  }

  // Handler for registration
  async function onRegisterSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setErrorMessage(null); // Clear any previous errors

    try {
      console.log("Registering user with role:", data.role);
      
      // Create user account
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          role: data.role, // Include role in the request
        }),
      });

      const result = await response.json();
      console.log("Registration response:", result);

      if (!response.ok) {
        setIsLoading(false);
        setErrorMessage(result.message || "Failed to register");
        return;
      }

      // Determine redirect URL based on role
      const redirectUrl = data.role === "SELLER" 
        ? `/${lang}/dashboard/seller` 
        : `/${lang}/dashboard/buyer`;
      
      console.log("Redirecting to:", redirectUrl);

      // If registration was successful, try to sign in
      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: true,
        callbackUrl: redirectUrl,
      });
      
      // Note: If redirect: true is used, the page will redirect and this code won't execute
      // This is a fallback in case redirect doesn't work
      if (signInResult?.error) {
        console.error("Sign in error after registration:", signInResult.error);
        setErrorMessage("Registration successful but login failed. Please try logging in manually.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle specific connection errors
      if (error instanceof Error && 
          error.message && 
          (error.message.includes("ECONNREFUSED") || error.message.includes("WebSocket"))) {
        setErrorMessage("Connection error. Please ensure database services are running.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      
      setIsLoading(false);
    }
  }

  // Render different forms based on isRegister flag
  if (isRegister) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                type="text"
                autoCapitalize="none"
                autoComplete="name"
                autoCorrect="off"
                disabled={isLoading || disabled}
                {...registerForm.register("name")}
              />
              {registerForm.formState.errors?.name && (
                <p className="px-1 text-xs text-red-600">
                  {registerForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading || disabled}
                {...registerForm.register("email")}
              />
              {registerForm.formState.errors?.email && (
                <p className="px-1 text-xs text-red-600">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Password"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect="off"
                disabled={isLoading || disabled}
                {...registerForm.register("password")}
              />
              {registerForm.formState.errors?.password && (
                <p className="px-1 text-xs text-red-600">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="role">Account Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="role-buyer"
                    value="BUYER"
                    className="h-4 w-4 mr-2"
                    disabled={isLoading || disabled}
                    {...registerForm.register("role")}
                    defaultChecked
                  />
                  <Label htmlFor="role-buyer" className="text-sm font-normal cursor-pointer">
                    Buyer
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="role-seller"
                    value="SELLER"
                    className="h-4 w-4 mr-2"
                    disabled={isLoading || disabled}
                    {...registerForm.register("role")}
                  />
                  <Label htmlFor="role-seller" className="text-sm font-normal cursor-pointer">
                    Seller
                  </Label>
                </div>
              </div>
              {registerForm.formState.errors?.role && (
                <p className="px-1 text-xs text-red-600">
                  {registerForm.formState.errors.role.message}
                </p>
              )}
            </div>
            {errorMessage && (
              <p className="px-1 text-xs text-red-600">{errorMessage}</p>
            )}
            <Button className={cn("btn")} disabled={isLoading}>
              {isLoading && (
                <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create account
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Login form with tabs for different methods
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Tabs
        defaultValue="email"
        value={authType}
        onValueChange={(value) => setAuthType(value as "email" | "credentials")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Magic Link</TabsTrigger>
          <TabsTrigger value="credentials">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading || isGitHubLoading || disabled}
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button className={cn("btn")} disabled={isLoading}>
                {isLoading && (
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {dict.signin_email || "Sign in with Email"}
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="credentials">
          <form onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading || disabled}
                  {...credentialsForm.register("email")}
                />
                {credentialsForm.formState.errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {credentialsForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  placeholder="Password"
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  disabled={isLoading || disabled}
                  {...credentialsForm.register("password")}
                />
                {credentialsForm.formState.errors?.password && (
                  <p className="px-1 text-xs text-red-600">
                    {credentialsForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button className={cn("btn")} disabled={isLoading}>
                {isLoading && (
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign in
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {dict.signin_others || "Or continue with"}
          </span>
        </div>
      </div>
      <Button
        type="button"
        className={cn("btn", "btn-outline")}
        onClick={() => {
          setIsGitHubLoading(true);
          signIn("github").catch((error) => {
            console.error("GitHub signIn error:", error);
          });
        }}
        disabled={isLoading || isGitHubLoading}
      >
        {isGitHubLoading ? (
          <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.GitHub className="mr-2 h-4 w-4" />
        )}{" "}
        Github
      </Button>
    </div>
  );
}
