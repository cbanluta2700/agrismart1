/**
 * Script to check database status using Prisma
 */

import { prisma } from '../src';

async function checkDatabaseStatus() {
  try {
    // Check connection by performing a simple query
    console.log('Checking database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful:', result);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function getCommunityTablesInfo() {
  try {
    console.log('\n--- COMMUNITY FEATURES TABLES ---');
    
    // Organizations
    const organizationCount = await prisma.organization.count();
    console.log(`Organizations: ${organizationCount} records`);
    if (organizationCount > 0) {
      const organizations = await prisma.organization.findMany({ take: 3 });
      console.log('Sample organizations:', organizations);
    }
    
    // Organization Members
    const orgMemberCount = await prisma.organizationMember.count();
    console.log(`Organization Members: ${orgMemberCount} records`);
    
    // Forums
    const forumCount = await prisma.forum.count();
    console.log(`Forums: ${forumCount} records`);
    if (forumCount > 0) {
      const forums = await prisma.forum.findMany({ take: 3 });
      console.log('Sample forums:', forums);
    }
    
    // Topics
    const topicCount = await prisma.topic.count();
    console.log(`Topics: ${topicCount} records`);
    
    // Comments
    const commentCount = await prisma.comment.count();
    console.log(`Comments: ${commentCount} records`);
    
    // Groups
    const groupCount = await prisma.group.count();
    console.log(`Groups: ${groupCount} records`);
    
    // Group Members
    const groupMemberCount = await prisma.groupMember.count();
    console.log(`Group Members: ${groupMemberCount} records`);
    
  } catch (error) {
    console.error('Error getting community tables info:', error);
  }
}

async function getResourceTablesInfo() {
  try {
    console.log('\n--- RESOURCE FEATURES TABLES ---');
    
    // Articles
    const articleCount = await prisma.article.count();
    console.log(`Articles: ${articleCount} records`);
    if (articleCount > 0) {
      const articles = await prisma.article.findMany({ take: 3 });
      console.log('Sample articles:', articles);
    }
    
    // Courses
    const courseCount = await prisma.course.count();
    console.log(`Courses: ${courseCount} records`);
    if (courseCount > 0) {
      const courses = await prisma.course.findMany({ take: 3 });
      console.log('Sample courses:', courses);
    }
    
    // Lessons
    const lessonCount = await prisma.lesson.count();
    console.log(`Lessons: ${lessonCount} records`);
    
    // Course Enrollments
    const enrollmentCount = await prisma.courseEnrollment.count();
    console.log(`Course Enrollments: ${enrollmentCount} records`);
    
    // Documentation
    const documentationCount = await prisma.documentation.count();
    console.log(`Documentation: ${documentationCount} records`);
    
  } catch (error) {
    console.error('Error getting resource tables info:', error);
  }
}

async function getUserInfo() {
  try {
    console.log('\n--- USER INFORMATION ---');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`Total Users: ${userCount} records`);
    
    // Count users by role
    const buyerCount = await prisma.user.count({ where: { role: 'BUYER' } });
    const sellerCount = await prisma.user.count({ where: { role: 'SELLER' } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    console.log(`Users by role: BUYER=${buyerCount}, SELLER=${sellerCount}, ADMIN=${adminCount}`);
    
  } catch (error) {
    console.error('Error getting user info:', error);
  }
}

async function main() {
  const connected = await checkDatabaseStatus();
  
  if (connected) {
    await getCommunityTablesInfo();
    await getResourceTablesInfo();
    await getUserInfo();
  }
  
  // Always disconnect at the end
  await prisma.$disconnect();
}

// Run the script
main().catch(e => {
  console.error('Error in main function:', e);
  prisma.$disconnect();
  process.exit(1);
});
