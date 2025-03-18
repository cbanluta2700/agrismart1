#!/usr/bin/env node

/**
 * Simple Database Connection Check Script
 * Uses direct PostgreSQL client to validate connection
 */
const { Client } = require('pg');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = promisify(exec);

// Load .env.local file
function loadEnv() {
  try {
    const envFilePath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envFilePath)) {
      const envFile = fs.readFileSync(envFilePath, 'utf8');
      const envVars = envFile.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .reduce((vars, line) => {
          const [key, ...value] = line.split('=');
          if (key && value.length) {
            vars[key.trim()] = value.join('=').replace(/^['"](.*)['"]$/, '$1').trim();
          }
          return vars;
        }, {});
      
      // Set environment variables
      Object.entries(envVars).forEach(([key, value]) => {
        process.env[key] = value;
      });
      
      return true;
    } else {
      console.warn('No .env.local file found');
      return false;
    }
  } catch (error) {
    console.error('Error loading .env file:', error);
    return false;
  }
}

async function checkDbConnection() {
  loadEnv();
  
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('ERROR: POSTGRES_URL environment variable is not set');
    return false;
  }
  
  console.log('Checking database connection...');
  console.log(`Using connection URL: ${connectionString.replace(/\/\/([^:]+):[^@]+@/, '//******:******@')}`);
  
  // Parse connection URL
  const matches = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/([^?]+)/);
  if (!matches) {
    console.error('ERROR: Invalid PostgreSQL connection URL format');
    return false;
  }
  
  const [_, username, password, host, port, database] = matches;
  
  // Check PostgreSQL server connectivity
  console.log('\nChecking if PostgreSQL server is reachable...');
  try {
    const { stdout } = await execPromise(`pg_isready -h ${host} -p ${port}`);
    console.log(`PostgreSQL server status: ${stdout.trim()}`);
  } catch (error) {
    console.error(`PostgreSQL server check failed: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\nCONNECTION REFUSED: The PostgreSQL server is not running or not accepting connections.');
      console.error('Please make sure PostgreSQL is running on the specified host and port.');
    }
    return false;
  }
  
  // Connect directly to PostgreSQL
  console.log('\nTesting direct database connection...');
  const client = new Client({
    user: username,
    host,
    database,
    password,
    port,
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false
  });
  
  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL!');
    
    // Check if tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`\nFound ${res.rows.length} tables in database:`);
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    await client.end();
    console.log('\n✅ Database connection is working correctly!');
    return true;
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error(error.message);
    
    if (error.message.includes('WebSocket')) {
      console.error('\nWebSocket error detected. This might be related to:');
      console.error('1. The connection trying to use WebSockets');
      console.error('2. A configuration issue with the connection string');
      console.error('\nTry these solutions:');
      console.error('- Check your POSTGRES_URL format (should be postgresql://...)');
      console.error('- Ensure your PostgreSQL server supports the connection method');
    }
    
    try {
      await client.end();
    } catch (e) {
      // Ignore error on disconnect
    }
    
    return false;
  }
}

// Run the check
checkDbConnection()
  .then(success => {
    if (!success) process.exit(1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
