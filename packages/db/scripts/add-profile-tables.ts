import { neon } from "@neondatabase/serverless";

export async function addProfileTables() {
    const sql = neon(process.env.DATABASE_URL!);
    console.log('Adding profile tables to database...');
    
    try {
        // Create UserProfile table
        console.log('Creating UserProfile table...');
        await sql`
            CREATE TABLE IF NOT EXISTS "UserProfile" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" TEXT UNIQUE NOT NULL,
                "bio" TEXT,
                "headline" TEXT,
                "location" TEXT,
                "skills" TEXT[],
                "expertise" TEXT[],
                "experience" TEXT,
                "education" TEXT,
                "socialLinks" JSONB,
                "interests" TEXT[],
                "availability" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
            )
        `;
        
        // Create index on UserProfile
        await sql`CREATE INDEX IF NOT EXISTS "IDX_UserProfile_userId" ON "UserProfile"("userId")`;
        console.log('✓ UserProfile table created');
        
        // Create UserConnection table
        console.log('Creating UserConnection table...');
        await sql`
            CREATE TABLE IF NOT EXISTS "UserConnection" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" TEXT NOT NULL,
                "connectedToId" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("userId", "connectedToId"),
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
                FOREIGN KEY ("connectedToId") REFERENCES "User"("id") ON DELETE CASCADE
            )
        `;
        
        // Create indexes on UserConnection
        await sql`CREATE INDEX IF NOT EXISTS "IDX_UserConnection_userId" ON "UserConnection"("userId")`;
        await sql`CREATE INDEX IF NOT EXISTS "IDX_UserConnection_connectedToId" ON "UserConnection"("connectedToId")`;
        console.log('✓ UserConnection table created');
        
        // Update Course-Instructor relationship
        console.log('Updating Course-Instructor relationship...');
        
        // Check if the constraint exists
        const constraints = await sql`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'Course' 
            AND constraint_type = 'FOREIGN KEY'
        `;
        
        // If the constraint exists, drop it first
        for (const c of constraints) {
            if (c.constraint_name.includes('instructorId')) {
                await sql`ALTER TABLE "Course" DROP CONSTRAINT "${sql(c.constraint_name)}"`;
            }
        }
        
        // Add new constraint
        await sql`
            ALTER TABLE "Course" ADD CONSTRAINT "FK_Course_Instructor_Relation"
            FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE
        `;
        console.log('✓ Course-Instructor relationship updated');
        
        console.log('\nAll profile tables added successfully!');
        return true;
    } catch (error) {
        console.error('Error adding profile tables:', error);
        return false;
    }
}

addProfileTables().then(success => {
    if (success) {
        console.log('Database schema update completed successfully!');
    } else {
        console.error('Failed to update database schema.');
    }
});
