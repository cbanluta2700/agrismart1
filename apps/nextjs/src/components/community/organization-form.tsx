import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { getDictionary } from "@/lib/langs";
import { useTranslations } from "next-intl";
import { useState } from "react";

const websiteSchema = z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''));

const organizationFormSchema = z.object({
  name: z.string().min(3, {
    message: "Organization name must be at least 3 characters.",
  }).max(100, {
    message: "Organization name must not be longer than 100 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(1000, {
    message: "Description must not be longer than 1000 characters.",
  }),
  website: websiteSchema,
  industry: z.string().optional(),
  location: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface OrganizationFormProps {
  lang: string;
  organization?: Partial<OrganizationFormValues>;
}

export function OrganizationForm({ lang, organization }: OrganizationFormProps) {
  const router = useRouter();
  const t = useTranslations("Community.organizations");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<OrganizationFormValues> = {
    name: organization?.name || "",
    description: organization?.description || "",
    website: organization?.website || "",
    industry: organization?.industry || "",
    location: organization?.location || "",
    isPublic: organization?.isPublic !== undefined ? organization.isPublic : true,
  };

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues,
  });

  async function onSubmit(values: OrganizationFormValues) {
    try {
      setIsSubmitting(true);
      
      // Submit to API endpoint
      const response = await fetch("/api/community/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create organization");
      }

      const newOrganization = await response.json();
      
      toast.success(t("organization_created"));
      
      // Redirect to the organizations page
      router.push(`/${lang}/community/organizations`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("organization_creation_error")
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_name_label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form_name_placeholder")} {...field} />
              </FormControl>
              <FormDescription>
                {t("form_name_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_description_label")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("form_description_placeholder")}
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {t("form_description_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_website_label")}</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://example.org" 
                  {...field}
                  value={field.value || ""} 
                />
              </FormControl>
              <FormDescription>
                {t("form_website_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_industry_label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form_industry_placeholder")} {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                {t("form_industry_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_location_label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form_location_placeholder")} {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                {t("form_location_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("form_public_label")}
                </FormLabel>
                <FormDescription>
                  {t("form_public_description")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2">{t("form_submitting")}</span>
                <span className="animate-spin">...</span>
              </>
            ) : (
              t("form_submit_button")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
