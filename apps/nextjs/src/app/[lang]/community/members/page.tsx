import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/langs";
import { MembersSearch } from "@/components/community/members-search";
import { MemberCard } from "@/components/community/member-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCommunityMembers, getCommunityMemberExpertise, getCommunityMemberRoles, getCommunityMemberStats } from "@/lib/community/members";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default async function MembersPage({
  params: { lang },
  searchParams,
}: {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const dict = await getDictionary(lang);
  
  // Parse search parameters for filtering
  const query = typeof searchParams.query === 'string' ? searchParams.query : '';
  const roleFilter = typeof searchParams.role === 'string' ? searchParams.role : '';
  const skillFilter = typeof searchParams.skill === 'string' ? searchParams.skill : '';
  
  // Get all available skills and roles for search filters
  const availableSkills = await getCommunityMemberExpertise();
  const userRoles = await getCommunityMemberRoles();
  const availableRoles = userRoles.map(role => ({ id: role, name: role }));
  
  // Get community statistics
  const stats = await getCommunityMemberStats();
  
  // Get members with filtering applied
  const members = await getCommunityMembers({
    search: query,
    role: roleFilter,
    expertise: skillFilter ? [skillFilter] : undefined,
  });
  
  return (
    <div className="container mx-auto space-y-8">
      <PageHeader
        heading={dict.community.members.title}
        text={dict.community.members.description}
      />
      
      <MembersSearch 
        lang={lang} 
        availableSkills={availableSkills}
        availableRoles={availableRoles}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dict.community.members.community_stats}</CardTitle>
              <CardDescription>
                {dict.community.members.community_stats_description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{dict.community.members.total_members}</span>
                <span className="font-medium">{stats.totalMembers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{dict.community.members.new_this_month}</span>
                <span className="font-medium">{stats.newMembersThisMonth}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{dict.community.members.top_contributors}</CardTitle>
              <CardDescription>
                {dict.community.members.top_contributors_description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.mostActiveMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {member.postCount} {dict.community.members.contributions}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">
              {members.length} {dict.community.members.members_found}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {dict.community.members.sort_by}:
              </span>
              <Button variant="ghost" size="sm" className="gap-1">
                {dict.community.members.sort_newest}
                <Icons.chevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                id={member.id}
                name={member.name}
                email={member.email}
                image={member.avatarUrl}
                role={member.role}
                userProfile={{
                  bio: member.bio,
                  location: member.location,
                  skills: member.expertise,
                  website: member.website,
                }}
                lang={lang}
              />
            ))}
          </div>
          
          {members.length > 12 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline">
                {dict.community.members.load_more}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
