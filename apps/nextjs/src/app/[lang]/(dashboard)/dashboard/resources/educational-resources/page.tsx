import React from "react";
import Link from "next/link";
import Image from "next/image";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { Button } from "@saasfly/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Badge } from "@saasfly/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@saasfly/ui/tabs";
import * as Icons from "@saasfly/ui/icons";

// Create a custom Progress component since the UI package's Progress component is not being recognized
const Progress = ({ value, className }: { value: number, className?: string }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className || ""}`}>
    <div 
      className="h-full w-full flex-1 bg-primary transition-all" 
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </div>
);

import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Educational Resources - AgriSmart Platform",
};

// Placeholder data for courses
const courses = [
  {
    id: "course-1",
    title: "Introduction to Sustainable Agriculture",
    description: "Learn the fundamentals of sustainable farming practices and how to implement them.",
    category: "Beginner",
    instructor: "Dr. Maria Johnson",
    lessons: 8,
    duration: "4 hours",
    progress: 0,
    image: "/images/placeholder-course.jpg",
  },
  {
    id: "course-2",
    title: "Advanced Crop Rotation Techniques",
    description: "Master the art of crop rotation to improve soil health and increase yields.",
    category: "Intermediate",
    instructor: "Prof. James Smith",
    lessons: 6,
    duration: "3 hours",
    progress: 35,
    image: "/images/placeholder-course.jpg",
  },
  {
    id: "course-3",
    title: "Organic Pest Management",
    description: "Discover effective strategies for managing pests without synthetic chemicals.",
    category: "Intermediate",
    instructor: "Dr. Sarah Williams",
    lessons: 10,
    duration: "5 hours",
    progress: 70,
    image: "/images/placeholder-course.jpg",
  },
  {
    id: "course-4",
    title: "Farm Business Management",
    description: "Learn essential business skills for running a successful agricultural enterprise.",
    category: "Advanced",
    instructor: "Michael Rodriguez, MBA",
    lessons: 12,
    duration: "6 hours",
    progress: 0,
    image: "/images/placeholder-course.jpg",
  },
];

export default function EducationalResourcesPage({
  params: { lang: _lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const _dict = getDictionary(_lang);
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Educational Resources"
        text="Enhance your agricultural knowledge with our comprehensive courses and lessons."
      />
      
      <Tabs defaultValue="all-courses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all-courses">All Courses</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-courses" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="h-full flex flex-col overflow-hidden">
                <div className="relative h-48 w-full">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Course Image</span>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{course.title}</CardTitle>
                    <Badge variant={
                      course.category === "Beginner" ? "default" : 
                      course.category === "Intermediate" ? "secondary" : "destructive"
                    }>
                      {course.category}
                    </Badge>
                  </div>
                  <CardDescription>
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Instructor:</span>
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lessons:</span>
                      <span>{course.lessons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                    {course.progress > 0 && (
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/resources/educational-resources/${course.id}`}>
                      {course.progress > 0 ? "Continue Learning" : "Start Course"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="my-courses" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter(course => course.progress > 0)
              .map((course) => (
                <Card key={course.id} className="h-full flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Course Image</span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{course.title}</CardTitle>
                      <Badge variant={
                        course.category === "Beginner" ? "default" : 
                        course.category === "Intermediate" ? "secondary" : "destructive"
                      }>
                        {course.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Instructor:</span>
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lessons:</span>
                        <span>{course.lessons}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/resources/educational-resources/${course.id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {courses.filter(course => course.progress > 0).length === 0 && (
                <div className="col-span-full">
                  <EmptyPlaceholder>
                    <EmptyPlaceholder.Icon name="Post" />
                    <EmptyPlaceholder.Title>No courses in progress</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                      You haven&apos;t started any courses yet. Browse our catalog and start learning!
                    </EmptyPlaceholder.Description>
                    <Button asChild>
                      <Link href="/dashboard/resources/educational-resources?tab=all-courses">
                        Browse Courses
                      </Link>
                    </Button>
                  </EmptyPlaceholder>
                </div>
              )}
          </div>
        </TabsContent>
        
        <TabsContent value="certificates" className="space-y-4">
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="Rocket" />
            <EmptyPlaceholder.Title>No certificates yet</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Complete courses to earn certificates that showcase your agricultural expertise.
            </EmptyPlaceholder.Description>
            <Button asChild>
              <Link href="/dashboard/resources/educational-resources?tab=all-courses">
                Explore Courses
              </Link>
            </Button>
          </EmptyPlaceholder>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
