/**
 * Simple script to show tables from Neon PostgreSQL
 */

import { neon } from "@neondatabase/serverless";

async function main() {
  try {
    // Create SQL client
    const sql = neon(process.env.DATABASE_URL!);
    
    // 1. List all tables
    console.log('--- DATABASE TABLES ---');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    // 2. Community tables
    console.log('\n--- COMMUNITY TABLES ---');
    const communityTables = ['Organization', 'OrganizationMember', 'Forum', 'Topic', 'Comment', 'Group', 'GroupMember'];
    console.log('Expected tables:', communityTables.join(', '));
    
    // 3. Resource tables
    console.log('\n--- RESOURCE TABLES ---');
    const resourceTables = ['Article', 'Course', 'Lesson', 'CourseEnrollment', 'Documentation'];
    console.log('Expected tables:', resourceTables.join(', '));
    
    // 4. Get counts from tables
    console.log('\n--- TABLE ROW COUNTS ---');
    
    // Organization count
    const orgCount = await sql`SELECT COUNT(*) FROM "Organization";`;
    console.log('Organization count:', orgCount[0].count);
    
    // OrganizationMember count
    const orgMemberCount = await sql`SELECT COUNT(*) FROM "OrganizationMember";`;
    console.log('OrganizationMember count:', orgMemberCount[0].count);
    
    // Forum count
    const forumCount = await sql`SELECT COUNT(*) FROM "Forum";`;
    console.log('Forum count:', forumCount[0].count);
    
    // Topic count
    const topicCount = await sql`SELECT COUNT(*) FROM "Topic";`;
    console.log('Topic count:', topicCount[0].count);
    
    // Comment count
    const commentCount = await sql`SELECT COUNT(*) FROM "Comment";`;
    console.log('Comment count:', commentCount[0].count);
    
    // Group count
    const groupCount = await sql`SELECT COUNT(*) FROM "Group";`;
    console.log('Group count:', groupCount[0].count);
    
    // GroupMember count
    const groupMemberCount = await sql`SELECT COUNT(*) FROM "GroupMember";`;
    console.log('GroupMember count:', groupMemberCount[0].count);
    
    // Article count
    const articleCount = await sql`SELECT COUNT(*) FROM "Article";`;
    console.log('Article count:', articleCount[0].count);
    
    // Course count
    const courseCount = await sql`SELECT COUNT(*) FROM "Course";`;
    console.log('Course count:', courseCount[0].count);
    
    // Lesson count
    const lessonCount = await sql`SELECT COUNT(*) FROM "Lesson";`;
    console.log('Lesson count:', lessonCount[0].count);
    
    // CourseEnrollment count
    const enrollmentCount = await sql`SELECT COUNT(*) FROM "CourseEnrollment";`;
    console.log('CourseEnrollment count:', enrollmentCount[0].count);
    
    // Documentation count
    const docCount = await sql`SELECT COUNT(*) FROM "Documentation";`;
    console.log('Documentation count:', docCount[0].count);
    
    // 5. Get sample data if available
    console.log('\n--- SAMPLE DATA ---');
    
    // Sample Organization data
    const orgSample = await sql`SELECT * FROM "Organization" LIMIT 3;`;
    if (orgSample.length > 0) {
      console.log('\nSample Organization data:');
      console.log(orgSample);
    }
    
    // Sample Forum data
    const forumSample = await sql`SELECT * FROM "Forum" LIMIT 3;`;
    if (forumSample.length > 0) {
      console.log('\nSample Forum data:');
      console.log(forumSample);
    }
    
    // Sample Topic data
    const topicSample = await sql`SELECT * FROM "Topic" LIMIT 3;`;
    if (topicSample.length > 0) {
      console.log('\nSample Topic data:');
      console.log(topicSample);
    }
    
    // Sample Article data
    const articleSample = await sql`SELECT * FROM "Article" LIMIT 3;`;
    if (articleSample.length > 0) {
      console.log('\nSample Article data:');
      console.log(articleSample);
    }
    
    // Sample Course data
    const courseSample = await sql`SELECT * FROM "Course" LIMIT 3;`;
    if (courseSample.length > 0) {
      console.log('\nSample Course data:');
      console.log(courseSample);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
