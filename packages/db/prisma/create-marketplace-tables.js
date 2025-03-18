// Load environment variables from .env file
require('dotenv').config();

const { neon } = require('@neondatabase/serverless');

async function createMarketplaceTables() {
  console.log('Creating marketplace tables...');
  
  // Get database connection
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    return false;
  }
  console.log(`Using DATABASE_URL: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
  
  // Create SQL executor
  const sql = neon(dbUrl);
  
  try {
    // First, add the role column to User table if it doesn't exist
    try {
      const roleCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'role'
      `;
      
      if (roleCheck.length === 0) {
        console.log('Adding role column to User table...');
        await sql`
          ALTER TABLE "User" 
          ADD COLUMN "role" TEXT NOT NULL DEFAULT 'BUYER'
        `;
        console.log('✅ Added role column to User table');
      } else {
        console.log('✅ User table already has role column');
      }
    } catch (err) {
      console.error('Error checking/adding role column:', err.message);
    }
    
    // Create Category table
    try {
      console.log('Creating Category table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "parentId" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Category_parentId_fkey" 
            FOREIGN KEY ("parentId") REFERENCES "Category"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId")
      `;
      console.log('✅ Created Category table');
    } catch (err) {
      console.error('Error creating Category table:', err.message);
    }
    
    // Create Product table
    try {
      console.log('Creating Product table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "price" DOUBLE PRECISION NOT NULL,
          "stock" INTEGER NOT NULL DEFAULT 0,
          "images" TEXT[] NOT NULL,
          "sellerId" TEXT NOT NULL,
          "categoryId" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Product_sellerId_fkey" 
            FOREIGN KEY ("sellerId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Product_categoryId_fkey" 
            FOREIGN KEY ("categoryId") REFERENCES "Category"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Product_sellerId_idx" ON "Product"("sellerId")
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId")
      `;
      console.log('✅ Created Product table');
    } catch (err) {
      console.error('Error creating Product table:', err.message);
    }
    
    // Create Order table
    try {
      console.log('Creating Order table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT PRIMARY KEY,
          "buyerId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "total" DOUBLE PRECISION NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Order_buyerId_fkey" 
            FOREIGN KEY ("buyerId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Order_buyerId_idx" ON "Order"("buyerId")
      `;
      console.log('✅ Created Order table');
    } catch (err) {
      console.error('Error creating Order table:', err.message);
    }
    
    // Create OrderItem table
    try {
      console.log('Creating OrderItem table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "OrderItem" (
          "id" TEXT PRIMARY KEY,
          "orderId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "OrderItem_orderId_fkey" 
            FOREIGN KEY ("orderId") REFERENCES "Order"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "OrderItem_productId_fkey" 
            FOREIGN KEY ("productId") REFERENCES "Product"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId")
      `;
      console.log('✅ Created OrderItem table');
    } catch (err) {
      console.error('Error creating OrderItem table:', err.message);
    }
    
    // Create Review table
    try {
      console.log('Creating Review table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "Review" (
          "id" TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "rating" SMALLINT NOT NULL,
          "comment" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Review_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Review_productId_fkey" 
            FOREIGN KEY ("productId") REFERENCES "Product"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId")
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId")
      `;
      console.log('✅ Created Review table');
    } catch (err) {
      console.error('Error creating Review table:', err.message);
    }
    
    // Create CartItem table
    try {
      console.log('Creating CartItem table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "CartItem" (
          "id" TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CartItem_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "CartItem_productId_fkey" 
            FOREIGN KEY ("productId") REFERENCES "Product"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "CartItem_userId_productId_key" UNIQUE ("userId", "productId")
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "CartItem_userId_idx" ON "CartItem"("userId")
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId")
      `;
      console.log('✅ Created CartItem table');
    } catch (err) {
      console.error('Error creating CartItem table:', err.message);
    }
    
    // Create Favorite table
    try {
      console.log('Creating Favorite table...');
      await sql`
        CREATE TABLE IF NOT EXISTS "Favorite" (
          "id" TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Favorite_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Favorite_productId_fkey" 
            FOREIGN KEY ("productId") REFERENCES "Product"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Favorite_userId_productId_key" UNIQUE ("userId", "productId")
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId")
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS "Favorite_productId_idx" ON "Favorite"("productId")
      `;
      console.log('✅ Created Favorite table');
    } catch (err) {
      console.error('Error creating Favorite table:', err.message);
    }
    
    // Verify all tables were created
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    console.log('\nVerified tables:');
    tables.forEach(table => {
      console.log(`- ${table.tablename}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error creating marketplace tables:', error);
    return false;
  }
}

// Execute the function
createMarketplaceTables()
  .then(success => {
    console.log(success ? '\n✅ Marketplace tables creation completed successfully!' : '\n❌ Marketplace tables creation failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
