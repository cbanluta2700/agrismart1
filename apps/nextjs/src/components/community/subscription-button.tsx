"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface SubscriptionButtonProps {
  type: "FORUM" | "TOPIC";
  targetId: string;
  initialSubscribed?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SubscriptionButton({
  type,
  targetId,
  initialSubscribed = false,
  variant = "outline",
  size = "default",
  className,
}: SubscriptionButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("Community.subscriptions");

  // Check subscription status on component mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // You can implement an API endpoint to check subscription status if needed
        // For now we'll use the initialSubscribed prop
        setIsSubscribed(initialSubscribed);
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkSubscription();
  }, [initialSubscribed, targetId, type]);

  const toggleSubscription = async () => {
    try {
      setIsLoading(true);

      if (isSubscribed) {
        // Unsubscribe
        const response = await fetch(
          `/api/community/subscriptions?type=${type}&targetId=${targetId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to unsubscribe");
        }

        toast.success(t("unsubscribed_success"));
      } else {
        // Subscribe
        const response = await fetch("/api/community/subscriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            targetId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to subscribe");
        }

        toast.success(t("subscribed_success"));
      }

      // Toggle the subscription state
      setIsSubscribed(!isSubscribed);
      
      // Refresh the page to update any subscription-dependent UI
      router.refresh();
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : isSubscribed 
            ? t("unsubscribed_error") 
            : t("subscribed_error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleSubscription}
      disabled={isLoading}
      className={className}
      aria-label={isSubscribed ? t("unsubscribe") : t("subscribe")}
      title={isSubscribed ? t("unsubscribe") : t("subscribe")}
    >
      {size === "icon" ? (
        isSubscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />
      ) : (
        <>
          {isSubscribed ? (
            <Bell className="mr-2 h-4 w-4" />
          ) : (
            <BellOff className="mr-2 h-4 w-4" />
          )}
          {isSubscribed ? t("unsubscribe") : t("subscribe")}
        </>
      )}
    </Button>
  );
}
