import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import type { ForumCategoryWithCounts } from "@/lib/community/forums";

const topicFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must not be longer than 100 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  content: z.string().min(20, {
    message: "Content must be at least 20 characters.",
  }).max(5000, {
    message: "Content must not be longer than 5000 characters.",
  }),
  tags: z.string().optional(),
});

type TopicFormValues = z.infer<typeof topicFormSchema>;

interface TopicFormProps {
  lang: string;
  categories: ForumCategoryWithCounts[];
  topic?: TopicFormValues;
}

export function TopicForm({ lang, categories, topic }: TopicFormProps) {
  const router = useRouter();
  const t = useTranslations("Community.forums.new_topic");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<TopicFormValues> = {
    title: topic?.title || "",
    category: topic?.category || "",
    content: topic?.content || "",
    tags: topic?.tags || "",
  };

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues,
  });

  const watchContent = form.watch("content");

  async function onSubmit(values: TopicFormValues) {
    try {
      setIsSubmitting(true);
      
      // Convert comma-separated tags to array
      const tagsArray = values.tags
        ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
      
      // Submit to API endpoint
      const response = await fetch("/api/community/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          forumId: values.category,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create topic");
      }

      const newTopic = await response.json();
      
      toast.success(t("topic_created"));
      
      // Redirect to the new topic page
      router.push(`/${lang}/community/forums/topic/${newTopic.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("topic_creation_error")
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_title_label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form_title_placeholder")} {...field} />
              </FormControl>
              <FormDescription>
                {t("form_title_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_category_label")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form_category_placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t("form_category_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_content_label")}</FormLabel>
              <Tabs defaultValue="write" value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
                <TabsList className="mb-2">
                  <TabsTrigger value="write">{t("write_tab")}</TabsTrigger>
                  <TabsTrigger value="preview">{t("preview_tab")}</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-0">
                  <FormControl>
                    <Textarea 
                      placeholder={t("form_content_placeholder")}
                      className="min-h-[300px] font-mono"
                      {...field} 
                    />
                  </FormControl>
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <Card className="min-h-[300px] p-4 overflow-auto">
                    {watchContent ? (
                      <Markdown content={watchContent} />
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {t("preview_empty")}
                      </p>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
              <FormDescription>
                {t("form_content_description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_tags_label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form_tags_placeholder")} {...field} />
              </FormControl>
              <FormDescription>
                {t("form_tags_description")}
              </FormDescription>
              <FormMessage />
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
