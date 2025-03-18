import { neon } from "@neondatabase/serverless";

export async function checkTables() {
    const sql = neon(process.env.DATABASE_URL!);
    console.log('Connecting to database...');
    
    // Check connection
    const check = await sql`SELECT 1 as connected`;
    console.log('Connection result:', check);
    
    // List all tables
    console.log('\nListing all tables:');
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;
    
    console.log(`Found ${tables.length} tables:`);
    for (const table of tables) {
        console.log(`- ${table.table_name}`);
    }
    
    return tables;
}

checkTables().then(tables => {
    console.log('\nDatabase check completed successfully!');
}).catch(error => {
    console.error('Error checking database:', error);
});
