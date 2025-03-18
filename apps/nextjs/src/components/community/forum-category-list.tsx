import { Icons } from "@/components/icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getForumCategories } from "@/lib/community/forums";
import { getDictionary } from "@/lib/langs";

interface ForumCategoryListProps {
  lang: string;
}

export async function ForumCategoryList({ lang }: ForumCategoryListProps) {
  const dict = await getDictionary(lang);
  // In a real implementation, this would fetch categories from the database
  const categories = await getForumCategories();

  return (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <div key={category.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {category.icon === "crop" && <Icons.crop className="h-5 w-5 text-primary" />}
                {category.icon === "leaf" && <Icons.leaf className="h-5 w-5 text-primary" />}
                {category.icon === "tractor" && <Icons.tractor className="h-5 w-5 text-primary" />}
                {category.icon === "seedling" && <Icons.seedling className="h-5 w-5 text-primary" />}
                {category.icon === "sun" && <Icons.sun className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <Link 
                  href={`/community/forums/category/${category.slug}`}
                  className="text-lg font-medium hover:underline"
                >
                  {category.name}
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
                {category.tags && category.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {category.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              <div>{category.topicCount} {dict.community.forums.topics}</div>
              <div>{category.postCount} {dict.community.forums.posts}</div>
            </div>
          </div>
          {index < categories.length - 1 && (
            <div className="mt-4 space-y-3">
              <div className="border-t" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {category.latestTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/community/forums/topic/${topic.id}`}
                    className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted"
                  >
                    <Icons.messageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{topic.title}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {topic.date}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
