import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";

const commentFormSchema = z.object({
  content: z.string().min(5, {
    message: "Comment must be at least 5 characters.",
  }).max(1000, {
    message: "Comment must not be longer than 1000 characters.",
  }),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

interface CommentFormProps {
  topicId: string;
  lang: string;
  parentId?: string;
}

export function CommentForm({ topicId, lang, parentId }: CommentFormProps) {
  const router = useRouter();
  const t = useTranslations("Community.forums");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const defaultValues: Partial<CommentFormValues> = {
    content: "",
  };

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues,
  });

  const watchContent = form.watch("content");

  async function onSubmit(values: CommentFormValues) {
    try {
      // Post the comment to the API
      const response = await fetch("/api/community/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: values.content,
          topicId,
          parentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post comment");
      }

      toast.success(t("comment_posted"));
      
      // Reset the form
      form.reset();
      
      // Refresh the page to show the new comment
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("comment_posting_error")
      );
      console.error(error);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Tabs defaultValue="write" value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
        <TabsList className="mb-2">
          <TabsTrigger value="write">{t("write_tab")}</TabsTrigger>
          <TabsTrigger value="preview">{t("preview_tab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-0">
          <Textarea 
            placeholder={t("comment_placeholder")}
            className="min-h-[150px]"
            {...form.register("content")}
          />
          {form.formState.errors.content && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.content.message}
            </p>
          )}
        </TabsContent>
        <TabsContent value="preview" className="mt-0">
          <Card className="min-h-[150px] p-4 overflow-auto">
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
      
      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <span className="mr-2">{t("posting")}</span>
              <span className="animate-spin">...</span>
            </>
          ) : (
            t("post_comment")
          )}
        </Button>
      </div>
    </form>
  );
}
