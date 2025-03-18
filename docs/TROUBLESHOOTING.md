# Troubleshooting Guide

## Database Connection Issues

### General PostgreSQL Connection Problems

- **Connection Timeout**: Check if your PostgreSQL server is running and accessible from your current environment.
- **Authentication Failure**: Verify your username, password, and database name in the connection string.
- **SSL Issues**: If using SSL, ensure that your connection string includes the correct SSL parameters.
- **Firewall Issues**: Check if there's a firewall blocking connections to your PostgreSQL server.

### Neon Database Specific Issues

#### Using Neon with Vercel/Postgres-Kysely

When using Neon PostgreSQL with Vercel's PostgreSQL Kysely integration, you might encounter these issues:

1. **WebSocket Connection Errors**:
   - Neon uses a serverless driver approach that's different from traditional PostgreSQL connections
   - Solution: Use the `@neondatabase/serverless` package alongside Vercel's Postgres Kysely

2. **Connection Pool Configuration**:
   - Neon databases work best with the pooled connection string for most operations
   - Use the non-pooled connection string only for operations that require direct connections (like schema changes)

3. **SSL Requirements**:
   - Neon databases require SSL connections
   - Ensure your connection string includes `?sslmode=require` for secure connections

4. **Connection String Format**:
   - For Vercel's Postgres-Kysely: Use the format that starts with `postgres://`
   - For direct Neon serverless driver: Either format works, but be consistent

#### Troubleshooting Steps for Neon Database

1. **Verify Connection String**:
   ```
   POSTGRES_URL="postgres://username:password@endpoint-pooler.region.aws.neon.tech/dbname?sslmode=require"
   ```

2. **Test Direct Connection** with the Neon driver:
   ```javascript
   import { neon } from '@neondatabase/serverless';
   const sql = neon(process.env.POSTGRES_URL);
   const result = await sql`SELECT 1 as test`;
   console.log(result); // Should return [{ test: 1 }]
   ```

3. **Check for Package Installation**:
   ```bash
   # Check if the package is installed
   npm list @neondatabase/serverless
   
   # Install if missing
   npm install @neondatabase/serverless
   ```

4. **Run Database Connection Check**:
   ```bash
   # Run the connection check script
   npm run db:check
   # or specifically for Neon
   npm run neon:check
   ```

5. **Verify Fetch API Availability**:
   - The Neon serverless driver uses the Fetch API
   - Make sure you're in an environment where Fetch is available (Node.js 18+, Bun, or environments with polyfill)

#### Integrating Neon with Existing Code

When adding Neon to an existing application using @vercel/postgres-kysely:

1. Configure your db/index.ts to use the Neon fetch handler:
   ```typescript
   import { createKysely } from "@vercel/postgres-kysely";
   import { neon } from '@neondatabase/serverless';
   
   const options = {
     connectionString: process.env.POSTGRES_URL,
     fetch: (url, init) => {
       // Configure fetch to work with Neon
       const connectionUrl = process.env.POSTGRES_URL.split('?')[0];
       const hostname = new URL(connectionUrl).hostname;
       const reqUrl = new URL(url);
       reqUrl.hostname = hostname;
       return fetch(reqUrl.toString(), init);
     }
   };
   
   export const db = createKysely<DB>(options);
   ```

2. For direct SQL queries, use the Neon client:
   ```typescript
   import { neon } from '@neondatabase/serverless';
   
   export const neonClient = neon(process.env.POSTGRES_URL);
   
   // Example usage
   const result = await neonClient`SELECT * FROM users`;
   ```

### WebSocket Connection Errors

If you encounter errors related to WebSocket connections during user registration or other database operations, follow these steps to diagnose and resolve the issue:

#### Symptoms:
- Error message containing `ECONNREFUSED` or `WebSocket` during user registration
- 500 errors when submitting forms that interact with the database
- Console errors about connection failures

#### Resolution Steps:

1. **Verify PostgreSQL is running**:
   ```bash
   pg_isready -h localhost -p 5432
   ```
   This should return "accepting connections" if PostgreSQL is running properly.

2. **Check Database Connection**:
   Run the database connection check script:
   ```bash
   bun run db:check
   ```
   This will verify if the database is accessible and properly configured.

3. **Verify Environment Variables**:
   Ensure your `.env.local` file contains the correct PostgreSQL connection string:
   ```
   POSTGRES_URL=postgresql://postgres:password@localhost:5432/agrismart-saasfly
   ```

4. **Check Database Schema**:
   Ensure the database schema is up to date:
   ```bash
   bun run db:push
   ```

5. **Database Initialization**:
   If you're setting up for the first time, make sure to run:
   ```bash
   bun run db:push
   bun run db:seed # Optional, for test data
   ```

### Connection Configuration Notes

The application uses `@vercel/postgres-kysely` for database connections, which may attempt to use WebSockets for connection pooling. If you're experiencing persistent WebSocket connection issues, you might need to consider:

1. Using a different PostgreSQL client library
2. Configuring your PostgreSQL server to accept WebSocket connections
3. Implementing the error handling in the codebase (which has been added in the latest updates)

## User Registration Process

The user registration process involves:

1. Client-side form submission from `user-auth-form.tsx`
2. API endpoint handling at `/api/auth/register`
3. Database interaction through `@saasfly/db`

If registration fails, check:
- Console logs for specific error messages
- Network tab in developer tools for API response details
- Database connectivity using `bun run db:check`
- That the email isn't already registered

## Other Common Issues

### Next.js Port Already in Use

If you see "Port 3000 is in use", either:
- Wait for the application to use an alternative port automatically
- Kill the process using port 3000:
  ```bash
  # On Windows:
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Environment Variables Not Loading

If environment variables aren't being loaded:
1. Verify `.env.local` exists in the project root
2. Check it contains all required variables
3. Restart the development server
4. Use `dotenv -e .env.local -- <your command>` to run commands with the env variables
