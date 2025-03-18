import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "@/components/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createDiscussionGroup } from "@/lib/community/discussion-groups";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const groupFormSchema = z.object({
  name: z.string().min(3, {
    message: "Group name must be at least 3 characters.",
  }).max(50, {
    message: "Group name must not be longer than 50 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }).max(500, {
    message: "Description must not be longer than 500 characters.",
  }),
  privacy: z.enum(["public", "private", "secret"], {
    required_error: "You must select a privacy setting.",
  }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  lang: string;
  group?: {
    id: string;
    name: string;
    description: string;
    privacy: 'public' | 'private' | 'secret';
    topics: string[];
  };
}

export function GroupForm({ lang, group }: GroupFormProps) {
  const router = useRouter();
  const t = useTranslations("Community.groups");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topics, setTopics] = useState<string[]>(group?.topics || []);
  const [topicInput, setTopicInput] = useState("");
  
  const defaultValues: Partial<GroupFormValues> = {
    name: group?.name || "",
    description: group?.description || "",
    privacy: group?.privacy || "public",
  };
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues,
  });
  
  const handleAddTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput("");
    }
  };
  
  const handleRemoveTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };
  
  async function onSubmit(values: GroupFormValues) {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would create/update the group in the database
      // For now, we're just using the mock data from the discussion-groups.ts file
      
      // Mock user data - in a real app, this would come from the session
      const userData = {
        id: "current-user-id",
        name: "Current User",
      };
      
      if (group) {
        // Update existing group
        toast.success(t("group_updated"));
      } else {
        // Create new group
        const newGroup = await createDiscussionGroup({
          name: values.name,
          description: values.description,
          privacy: values.privacy as 'public' | 'private' | 'secret',
          topics: topics,
          createdBy: userData,
        });
        
        toast.success(t("group_created"));
      }
      
      // Redirect to groups list
      router.push("/community/groups");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(group ? t("group_update_error") : t("group_creation_error"));
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{group ? t("edit_group") : t("create_group")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("group_name")}</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder={t("group_name_placeholder")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t("group_description")}</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder={t("group_description_placeholder")}
              className="min-h-[120px]"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label>{t("group_privacy")}</Label>
            <RadioGroup
              defaultValue={form.getValues("privacy")}
              onValueChange={(value) => form.setValue("privacy", value as "public" | "private" | "secret")}
              className="space-y-2"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="public" id="privacy-public" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="privacy-public" className="font-medium cursor-pointer">
                    {t("public")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("public_description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="private" id="privacy-private" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="privacy-private" className="font-medium cursor-pointer">
                    {t("private")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("private_description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="secret" id="privacy-secret" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="privacy-secret" className="font-medium cursor-pointer">
                    {t("secret")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("secret_description")}
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>{t("group_topics")}</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder={t("topic_placeholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTopic} variant="outline">
                {t("add")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("topics_help")}
            </p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="group">
                  {topic}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(topic)}
                    className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center hover:bg-destructive/50 group-hover:opacity-100 opacity-70"
                  >
                    <Icons.close className="h-2 w-2" />
                  </button>
                </Badge>
              ))}
              {topics.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  {t("no_topics_added")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/community/groups">
              {t("cancel")}
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {group ? t("updating") : t("creating")}
              </>
            ) : (
              <>{group ? t("update_group") : t("create_group")}</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
