import { neon } from "@neondatabase/serverless";

async function getData() {
  const sql = neon(process.env.DATABASE_URL || '');
  try {
    // First try a simple connection test
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('Connection test result:', connectionTest);
    
    // Then check if the User table exists and get a user count
    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM "User"`;
      return {
        success: true,
        message: 'Database connection successful',
        test: connectionTest,
        userCount: userCount && userCount[0] ? userCount[0].count : 0
      };
    } catch (err) {
      // User table doesn't exist yet, but connection is successful
      return {
        success: true,
        message: 'Database connection successful, but User table not found',
        test: connectionTest,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default async function TestDatabasePage() {
  const data = await getData();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <div className="p-4 rounded border">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <div className={`p-3 rounded ${data.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p><strong>Status:</strong> {data.success ? '✅ Connected' : '❌ Failed'}</p>
          <p><strong>Message:</strong> {data.message}</p>
          
          {data.test && (
            <div className="mt-2">
              <strong>Test Query Result:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1">
                {JSON.stringify(data.test, null, 2)}
              </pre>
            </div>
          )}
          
          {data.userCount !== undefined && (
            <p className="mt-2"><strong>User Count:</strong> {data.userCount}</p>
          )}
          
          {data.error && (
            <div className="mt-2">
              <strong>Error Details:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-red-500">
                {data.error}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Environment Check</h2>
        <div className="p-3 rounded bg-gray-100">
          <p><strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? '✅ Defined' : '❌ Not defined'}</p>
          <p><strong>POSTGRES_URL:</strong> {process.env.POSTGRES_URL ? '✅ Defined' : '❌ Not defined'}</p>
        </div>
      </div>
    </div>
  );
}
