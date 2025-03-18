/**
 * Script to create community tables using Neon Serverless approach
 * Following the exact pattern provided:
 * 
 * import { neon } from "@neondatabase/serverless";
 * 
 * export async function getData() {
 *     const sql = neon(process.env.DATABASE_URL);
 *     const data = await sql`SELECT * FROM posts;`;
 *     return data;
 * }
 */

import { neon } from "@neondatabase/serverless";

export async function createCommunityTables() {
  // Connect to database using the pattern
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('===== CREATING COMMUNITY TABLES =====');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const test = await sql`SELECT 1 as connected;`;
    console.log('Connection successful:', test[0]);
    
    // Check if user_profile table exists
    const userProfileExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profile'
      ) as exists;
    `;
    
    // Create user_profile table if it doesn't exist
    if (!userProfileExists[0]?.exists) {
      console.log('Creating user_profile table...');
      
      await sql`
        CREATE TABLE "user_profile" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT UNIQUE NOT NULL,
          bio TEXT,
          headline TEXT,
          location TEXT,
          skills TEXT[],
          expertise TEXT[],
          experience TEXT,
          education TEXT,
          social_links JSONB,
          interests TEXT[],
          availability TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id)
            REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE INDEX idx_user_profile_user_id ON user_profile(user_id);
      `;
      
      console.log('✓ user_profile table created successfully!');
    } else {
      console.log('user_profile table already exists.');
    }
    
    // Check if user_connection table exists
    const userConnectionExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_connection'
      ) as exists;
    `;
    
    // Create user_connection table if it doesn't exist
    if (!userConnectionExists[0]?.exists) {
      console.log('Creating user_connection table...');
      
      await sql`
        CREATE TABLE "user_connection" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          connected_to_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT user_connection_user_id_connected_to_id_key UNIQUE (user_id, connected_to_id),
          CONSTRAINT fk_user_connection_user FOREIGN KEY (user_id)
            REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_user_connection_connected_to FOREIGN KEY (connected_to_id)
            REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE INDEX idx_user_connection_user_id ON user_connection(user_id);
        CREATE INDEX idx_user_connection_connected_to_id ON user_connection(connected_to_id);
      `;
      
      console.log('✓ user_connection table created successfully!');
    } else {
      console.log('user_connection table already exists.');
    }
    
    // Add the course_instructor named relation constraint if it doesn't exist
    console.log('Checking course instructor relationship...');
    
    // First check if the constraint exists
    const constraintExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_course_instructor_named_relation' 
        AND table_name = 'Course'
      ) as exists;
    `;
    
    if (!constraintExists[0]?.exists) {
      console.log('Adding named relation constraint to course instructor relationship...');
      
      // Drop existing constraint if it exists
      try {
        await sql`ALTER TABLE "Course" DROP CONSTRAINT IF EXISTS "Course_instructorId_fkey";`;
      } catch (error) {
        console.log('No default constraint found or already dropped.');
      }
      
      // Add named relation constraint
      await sql`
        ALTER TABLE "Course" ADD CONSTRAINT fk_course_instructor_named_relation 
        FOREIGN KEY ("instructorId") REFERENCES "User"(id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
      `;
      
      console.log('✓ Course instructor relationship updated successfully!');
    } else {
      console.log('Course instructor named relationship already exists.');
    }
    
    console.log('\n===== COMMUNITY TABLES SETUP COMPLETE =====');
    return true;
  } catch (error) {
    console.error('Error setting up community tables:', error);
    return false;
  }
}

// Execute the function
createCommunityTables().then(success => {
  if (success) {
    console.log('Successfully set up community database tables!');
  } else {
    console.error('Failed to set up community database tables.');
  }
}).catch(error => {
  console.error('Unhandled error:', error);
});
