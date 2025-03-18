"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchFilters {
  query: string;
  skill: string;
  role: string;
}

interface MembersSearchProps {
  lang: string;
  availableSkills?: string[];
  availableRoles?: { id: string; name: string }[];
}

export function MembersSearch({ 
  lang, 
  availableSkills = [], 
  availableRoles = [] 
}: MembersSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Community.members");
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize filters from URL
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("query") || "",
    skill: searchParams.get("skill") || "",
    role: searchParams.get("role") || "",
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters to URL
  const applyFilters = () => {
    setIsLoading(true);
    
    // Create new URLSearchParams
    const params = new URLSearchParams();
    
    // Only add non-empty values
    if (filters.query) params.set("query", filters.query);
    if (filters.skill) params.set("skill", filters.skill);
    if (filters.role) params.set("role", filters.role);
    
    // Update URL with new search params
    router.push(`${pathname}?${params.toString()}`);
    
    // Simulating API call delay
    setTimeout(() => setIsLoading(false), 500);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ query: "", skill: "", role: "" });
    router.push(pathname);
  };
  
  // Check if filters are active
  const hasActiveFilters = filters.query || filters.skill || filters.role;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Update filters when URL changes
  useEffect(() => {
    setFilters({
      query: searchParams.get("query") || "",
      skill: searchParams.get("skill") || "",
      role: searchParams.get("role") || "",
    });
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search_placeholder")}
                  className="pl-8"
                  value={filters.query}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <Select
                value={filters.skill}
                onValueChange={(value) => handleFilterChange("skill", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("filter_by_skill")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("all_skills")}</SelectItem>
                  {availableSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.role}
                onValueChange={(value) => handleFilterChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("filter_by_role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("all_roles")}</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <Badge variant="outline" className="gap-1">
                    {t("search")}: {filters.query}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("query", "")}
                      className="ml-1 focus:outline-none"
                      aria-label={t("clear_search")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.skill && (
                  <Badge variant="outline" className="gap-1">
                    {t("skill")}: {filters.skill}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("skill", "")}
                      className="ml-1 focus:outline-none"
                      aria-label={t("clear_skill")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.role && (
                  <Badge variant="outline" className="gap-1">
                    {t("role")}: {
                      availableRoles.find(r => r.id === filters.role)?.name || filters.role
                    }
                    <button
                      type="button"
                      onClick={() => handleFilterChange("role", "")}
                      className="ml-1 focus:outline-none"
                      aria-label={t("clear_role")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    {t("clear_all")}
                  </Button>
                )}
                
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("searching")}
                    </>
                  ) : (
                    t("search")
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
