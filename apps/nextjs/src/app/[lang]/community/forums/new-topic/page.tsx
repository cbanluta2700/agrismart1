import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/langs";
import { TopicForm } from "@/components/community/topic-form";
import { getForumCategories } from "@/lib/community/forums";

export default async function NewTopicPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);
  const categories = await getForumCategories();
  
  return (
    <div className="container mx-auto space-y-6">
      <PageHeader
        heading={dict.community.forums.new_topic.title}
        text={dict.community.forums.new_topic.description}
      />
      
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>{dict.community.forums.new_topic.form_title}</CardTitle>
            <CardDescription>
              {dict.community.forums.new_topic.form_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopicForm lang={lang} categories={categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
