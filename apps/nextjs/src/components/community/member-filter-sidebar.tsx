import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { getCommunityMemberRoles, getCommunityMemberExpertise } from "@/lib/community/members";
import { useTranslations } from "next-intl";

interface MemberFilterSidebarProps {
  lang: string;
  roleFilter?: string;
}

export async function MemberFilterSidebar({ lang, roleFilter }: MemberFilterSidebarProps) {
  const t = useTranslations("Community.members");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Fetch all available roles and expertise
  const roles = await getCommunityMemberRoles();
  const expertise = await getCommunityMemberExpertise();
  
  // Group expertise into categories (in a real app, these would be predefined categories)
  const expertiseCategories = {
    "Farming Methods": expertise.filter(e => 
      ["organic farming", "regenerative agriculture", "permaculture", "urban farming", "no-till"].includes(e)
    ),
    "Crops & Production": expertise.filter(e => 
      ["vegetable production", "grain production", "specialty crops", "microgreens", "tropical agriculture"].includes(e)
    ),
    "Soil & Water": expertise.filter(e => 
      ["soil health", "water conservation", "irrigation", "crop rotation", "cover crops", "water harvesting"].includes(e)
    ),
    "Livestock": expertise.filter(e => 
      ["livestock", "rotational grazing", "pasture management"].includes(e)
    ),
    "Knowledge Areas": expertise.filter(e => 
      ["education", "plant pathology", "agtech", "plant breeding", "food safety", "farm design"].includes(e)
    ),
  };
  
  // Handler for role filter changes
  const handleRoleChange = (role: string) => {
    startTransition(() => {
      const searchParams = new URLSearchParams(window.location.search);
      
      if (roleFilter === role) {
        searchParams.delete('role');
      } else {
        searchParams.set('role', role);
      }
      
      router.push(`/community/members?${searchParams.toString()}`);
    });
  };
  
  // Handler for expertise filter changes
  const handleExpertiseChange = (expertise: string, isChecked: boolean) => {
    startTransition(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const currentExpertise = searchParams.getAll('expertise');
      
      if (isChecked) {
        if (!currentExpertise.includes(expertise)) {
          searchParams.append('expertise', expertise);
        }
      } else {
        const updatedExpertise = currentExpertise.filter(e => e !== expertise);
        searchParams.delete('expertise');
        updatedExpertise.forEach(e => searchParams.append('expertise', e));
      }
      
      router.push(`/community/members?${searchParams.toString()}`);
    });
  };
  
  // Handler for clearing all filters
  const handleClearFilters = () => {
    startTransition(() => {
      router.push('/community/members');
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{t("filters")}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="h-7 px-2 text-xs"
            disabled={isPending}
          >
            {t("clear_all")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" defaultValue={["roles"]} className="w-full">
          <AccordionItem value="roles" className="border-b-0">
            <AccordionTrigger className="py-2 font-medium">
              {t("filter_by_role")}
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`role-${role}`} 
                      checked={roleFilter === role}
                      onCheckedChange={() => handleRoleChange(role)}
                      disabled={isPending}
                    />
                    <Label 
                      htmlFor={`role-${role}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {Object.entries(expertiseCategories).map(([category, items]) => (
            <AccordionItem key={category} value={category} className="border-b-0">
              <AccordionTrigger className="py-2 font-medium">
                {category}
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`expertise-${item}`}
                        // In a real implementation, this would check against the current URL params
                        disabled={isPending}
                        onCheckedChange={(checked) => 
                          handleExpertiseChange(item, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={`expertise-${item}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          
          <AccordionItem value="location" className="border-b-0">
            <AccordionTrigger className="py-2 font-medium">
              {t("filter_by_location")}
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {/* This would be implemented with a region/country selector in a real application */}
              <p className="text-sm text-muted-foreground py-2">
                {t("location_filter_coming_soon")}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
