/**
 * Script to create database schema directly using SQL and the Neon serverless driver
 */

const { neon } = require('@neondatabase/serverless');

// Get database connection string
const connectionUrl = process.env.POSTGRES_URL || '';
console.log(`Database connection: ${connectionUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL'}`);
console.log(`Connection URL: ${connectionUrl.replace(/:[^:]*@/, ':****@')}`);

// Create SQL executor
const sql = neon(connectionUrl);

// SQL schema definition - directly from Prisma schema
const schemaSQL = `
-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  emailVerified TIMESTAMP,
  image TEXT
);

-- Create Account table
CREATE TABLE IF NOT EXISTS "Account" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint for Account
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"(provider, "providerAccountId");

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Customer table
CREATE TABLE IF NOT EXISTS "Customer" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  stripeId TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Status enum
DO $$ BEGIN
  CREATE TYPE "Status" AS ENUM ('PENDING', 'CREATING', 'INITING', 'RUNNING', 'STOPPED', 'DELETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create OrderStatus enum
DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create Category table
CREATE TABLE IF NOT EXISTS "Category" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "parentId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");

-- Create Product table
CREATE TABLE IF NOT EXISTS "Product" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  stock INTEGER DEFAULT 0,
  images TEXT[],
  "sellerId" TEXT NOT NULL,
  "categoryId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Product_sellerId_idx" ON "Product"("sellerId");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");

-- Create Order table
CREATE TABLE IF NOT EXISTS "Order" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "buyerId" TEXT NOT NULL,
  status "OrderStatus" DEFAULT 'PENDING',
  total FLOAT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Order_buyerId_idx" ON "Order"("buyerId");

-- Create OrderItem table
CREATE TABLE IF NOT EXISTS "OrderItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price FLOAT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

-- Create Review table
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  rating SMALLINT NOT NULL,
  comment TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");

-- Create CartItem table
CREATE TABLE IF NOT EXISTS "CartItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");
CREATE INDEX IF NOT EXISTS "CartItem_userId_idx" ON "CartItem"("userId");
CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId");

-- Create Favorite table
CREATE TABLE IF NOT EXISTS "Favorite" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");
CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS "Favorite_productId_idx" ON "Favorite"("productId");
`;

// Function to execute SQL statements sequentially
async function executeSQLStatements() {
  const statements = schemaSQL
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute`);

  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      try {
        // Use the tagged template function of sql instead of sql.raw
        await sql`${statement}`;
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (err) {
        // If the error is about the relation already existing, that's okay
        if (err.message && err.message.includes('already exists')) {
          console.log(`ℹ️ Note: ${err.message}`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}: ${err.message}`);
          console.error('Statement:', statement);
          // Continue despite errors to create as much of the schema as possible
        }
      }
    }

    console.log('\n✅ Schema creation completed!');
    
    // List tables to verify creation
    console.log('\nVerifying created tables:');
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    tables.forEach(table => {
      console.log(`- ${table.tablename}`);
    });
    
    return true;
  } catch (error) {
    console.error('\n❌ Error during schema creation:', error);
    return false;
  }
}

// Execute the SQL statements
executeSQLStatements()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
