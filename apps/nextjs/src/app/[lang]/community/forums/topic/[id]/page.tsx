import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { getDictionary } from "@/lib/langs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { getForumTopicById, getForumCommentsByTopic } from "@/lib/community/forums";
import { auth } from "@/auth";
import { CommentForm } from "@/components/community/comment-form";

export default async function TopicPage({
  params: { lang, id },
}: {
  params: { lang: string; id: string };
}) {
  const dict = await getDictionary(lang);
  const session = await auth();
  
  // In a real implementation, this would fetch the topic and its comments from the database
  const topic = await getForumTopicById(id);
  
  if (!topic) {
    notFound();
  }
  
  const comments = await getForumCommentsByTopic(id);
  
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Link 
            href="/community/forums"
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
          >
            <Icons.arrowLeft className="h-4 w-4 mr-1" />
            {dict.community.forums.back_to_forums}
          </Link>
          <h1 className="text-2xl font-bold">{topic.title}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/community/forums/new-topic">
            <Icons.plus className="mr-2 h-4 w-4" />
            {dict.community.forums.new_topic_button}
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Icons.calendar className="h-4 w-4" />
          <span>
            {new Date(topic.createdAt).toLocaleDateString(lang, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Icons.eye className="h-4 w-4" />
          <span>{topic.viewCount} {dict.community.forums.views}</span>
        </div>
        <div className="flex items-center gap-1">
          <Icons.messageSquare className="h-4 w-4" />
          <span>{topic.replyCount} {dict.community.forums.replies}</span>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row space-x-4 items-start pb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={topic.authorImageUrl} alt={topic.authorName} />
            <AvatarFallback>{topic.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold">{topic.authorName}</div>
            <div className="text-sm text-muted-foreground">
              {dict.community.forums.topic_posted_on}{" "}
              {new Date(topic.createdAt).toLocaleDateString(lang, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <Markdown content={topic.content} />
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {topic.tags.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/community/forums/tags/${encodeURIComponent(tag)}`}
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-3 bg-muted/50 flex justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-1">
              <Icons.heart className="h-4 w-4" />
              {dict.community.forums.like}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <Icons.share className="h-4 w-4" />
              {dict.community.forums.share}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            <Icons.flag className="h-4 w-4" />
            {dict.community.forums.report}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {comments.length} {comments.length === 1
              ? dict.community.forums.reply
              : dict.community.forums.replies}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span>{dict.community.forums.sort_by}:</span>
            <Button variant="ghost" size="sm" className="gap-1">
              {dict.community.forums.newest}
              <Icons.chevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader className="flex flex-row space-x-4 items-start pb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.authorImageUrl} alt={comment.authorName} />
                    <AvatarFallback>{comment.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{comment.authorName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString(lang, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-4">
                  <Markdown content={comment.content} />
                </CardContent>
                <CardFooter className="border-t px-6 py-2 bg-muted/50 flex justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Icons.heart className="h-4 w-4" />
                      {comment.likes} {dict.community.forums.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Icons.reply className="h-4 w-4" />
                      {dict.community.forums.reply}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Icons.flag className="h-4 w-4" />
                    {dict.community.forums.report}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-10 text-center">
            <Icons.messageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              {dict.community.forums.no_replies_yet}
            </h3>
            <p className="text-muted-foreground mt-2 mb-6">
              {dict.community.forums.be_first_to_reply}
            </p>
          </Card>
        )}
        
        {session ? (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-medium">
                {dict.community.forums.leave_reply}
              </h3>
            </CardHeader>
            <CardContent>
              <CommentForm topicId={id} lang={lang} />
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground mb-4">
              {dict.community.forums.login_to_reply}
            </p>
            <Button asChild>
              <Link href="/sign-in">
                {dict.community.forums.sign_in}
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
