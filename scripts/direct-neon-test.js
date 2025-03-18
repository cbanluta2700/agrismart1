#!/usr/bin/env bun

// Direct test script for Neon PostgreSQL connection
// This doesn't rely on any internal modules

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';
import dns from 'dns';
import { promisify } from 'util';

// Promisify DNS lookup
const dnsLookup = promisify(dns.lookup);

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Test DNS resolution for a hostname
async function testDnsResolution(hostname) {
  try {
    console.log(`Testing DNS resolution for ${hostname}...`);
    const result = await dnsLookup(hostname);
    console.log(`✅ DNS resolution successful: ${hostname} -> ${result.address}`);
    return true;
  } catch (error) {
    console.error(`❌ DNS resolution failed for ${hostname}: ${error.message}`);
    return false;
  }
}

// Test HTTPS connectivity
function testHttpsConnectivity(hostname) {
  return new Promise((resolve) => {
    console.log(`Testing HTTPS connectivity to ${hostname}...`);
    
    const req = https.request({
      hostname,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 5000,
    }, (res) => {
      console.log(`✅ HTTPS connection successful: Status code ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.error(`❌ HTTPS connection failed: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.error('❌ HTTPS connection timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function testNeonDirectly() {
  // Get connection string
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined');
    return;
  }
  
  const isNeonDb = connectionString.includes('neon.tech');
  
  console.log(`\n========== POSTGRES CONNECTION TEST ==========`);
  console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
  console.log(`Database type: ${isNeonDb ? 'Neon PostgreSQL' : 'Standard PostgreSQL'}`);
  
  // Parse connection string
  function parseConnectionString(url) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parsed.port || '5432',
        database: parsed.pathname.substring(1),
        user: parsed.username,
        password: parsed.password,
        ssl: parsed.searchParams.get('sslmode') === 'require' ? 
          { rejectUnauthorized: false } : 
          undefined
      };
    } catch (e) {
      console.error('Failed to parse connection string:', e);
      return {};
    }
  }
  
  // Create client with the parsed connection details
  const parsedConfig = parseConnectionString(connectionString);
  console.log('Connection details:', {
    host: parsedConfig.host,
    port: parsedConfig.port,
    database: parsedConfig.database,
    user: parsedConfig.user,
    ssl: parsedConfig.ssl ? 'enabled' : 'disabled'
  });
  
  // Run network diagnostics
  console.log('\n========== NETWORK DIAGNOSTICS ==========');
  
  // Test DNS resolution
  if (parsedConfig.host) {
    await testDnsResolution(parsedConfig.host);
    
    // If it's a Neon database, also test HTTPS connectivity
    if (isNeonDb) {
      await testHttpsConnectivity(parsedConfig.host);
    }
  }
  
  console.log('\n========== DATABASE CONNECTION TEST ==========');
  
  // Try different SSL configurations
  const sslConfigs = [
    { name: 'Default SSL config', config: { rejectUnauthorized: false } },
    { name: 'SSL with CA verification disabled', config: { rejectUnauthorized: false, ca: null } },
    { name: 'SSL with explicit TLS 1.3', config: { rejectUnauthorized: false, minVersion: 'TLSv1.3' } },
    { name: 'SSL with explicit TLS 1.2', config: { rejectUnauthorized: false, minVersion: 'TLSv1.2' } }
  ];
  
  for (const sslConfig of sslConfigs) {
    const config = {
      ...parsedConfig,
      ssl: sslConfig.config
    };
    
    const client = new pg.Client(config);
    
    try {
      console.log(`\nTrying connection with ${sslConfig.name}...`);
      await client.connect();
      console.log(`Connection successful with ${sslConfig.name}! ✅`);
      
      // Get database info
      const dbInfoResult = await client.query(`
        SELECT current_database() as database, 
               current_user as user,
               version() as version
      `);
      
      console.log('\n--------- Database Information ---------');
      console.table(dbInfoResult.rows[0]);
      
      // Get table list
      const tablesResult = await client.query(`
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      console.log('\n--------- Database Tables ---------');
      if (tablesResult.rows.length === 0) {
        console.log('No tables found in the public schema');
      } else {
        console.table(tablesResult.rows);
      }
      
      console.log('\nConnection test completed successfully ✅');
      
      // Successfully connected, no need to try other configs
      break;
    } catch (error) {
      console.error(`Connection failed with ${sslConfig.name}: ${error.message}`);
      
      // If it's the last configuration, show detailed troubleshooting information
      if (sslConfig === sslConfigs[sslConfigs.length - 1]) {
        console.error('\n========== TROUBLESHOOTING SUGGESTIONS ==========');
        console.error('1. Verify POSTGRES_URL is correctly formatted in your .env.local file');
        console.error('2. Check that the Neon database is active and not in hibernation mode');
        console.error('3. Ensure server firewall allows outbound connections to Neon (port 5432)');
        console.error('4. Check SSL settings - Neon typically requires SSL connections');
        console.error('5. Verify your IP is allowed to connect to the database');
        
        // If it's a specific error, provide more detailed guidance
        if (error.code === 'ENOTFOUND') {
          console.error('\nHost not found. Please check that the hostname is correct in your connection string.');
        } else if (error.code === 'ECONNREFUSED') {
          console.error('\nConnection refused. The database server is not accepting connections on the specified host/port.');
        } else if (error.code === 'ETIMEDOUT') {
          console.error('\nConnection timed out. This might be due to network issues or firewall restrictions.');
        }
      }
    } finally {
      try {
        await client.end();
      } catch (e) {
        // Ignore errors from closing the connection
      }
    }
  }
}

// Run the test
testNeonDirectly().catch(error => {
  console.error('Unhandled error:', error);
});
