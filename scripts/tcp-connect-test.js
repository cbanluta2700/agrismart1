#!/usr/bin/env bun

// TCP connection test script to verify PostgreSQL connectivity
const net = require('net');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dns = require('dns').promises;

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Extract host and port from the database URL
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error('No DATABASE_URL or POSTGRES_URL found in environment variables');
  process.exit(1);
}

const urlPattern = /postgres:\/\/[^:]+:[^@]+@([^:]+):?(\d+)?\/[^?]+(.*)/;
const match = dbUrl.match(urlPattern);

if (!match) {
  console.error('Failed to parse database URL:', dbUrl.replace(/:[^:]*@/, ':****@'));
  process.exit(1);
}

const host = match[1];
const port = match[2] || 5432; // Default to 5432 if no port specified

console.log(`Testing TCP connection to ${host}:${port}`);

// First, perform a DNS lookup
async function testConnection() {
  try {
    console.log(`Resolving DNS for ${host}...`);
    const addresses = await dns.lookup(host, { all: true });
    console.log('DNS lookup successful:');
    addresses.forEach(addr => {
      console.log(` - ${addr.address} (${addr.family === 4 ? 'IPv4' : 'IPv6'})`);
    });

    console.log(`\nAttempting TCP connection to ${host}:${port}...`);
    
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      
      // Set timeout to 10 seconds
      socket.setTimeout(10000);
      
      socket.on('connect', () => {
        console.log(`Successfully connected to ${host}:${port}`);
        socket.end();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        console.error(`Connection attempt to ${host}:${port} timed out after 10 seconds`);
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', (error) => {
        console.error(`Failed to connect to ${host}:${port}:`, error.message);
        socket.destroy();
        resolve(false);
      });
      
      socket.connect(port, host);
    });
  } catch (error) {
    console.error('Error during connection test:', error.message);
    return false;
  }
}

// Run the test and report results
testConnection().then(success => {
  if (success) {
    console.log('\nConnectivity test PASSED: The server is reachable.');
    console.log('This means the network path to the server is open.');
    console.log('If database connections are still failing, the issue may be with:');
    console.log('1. Authentication credentials');
    console.log('2. Database permissions');
    console.log('3. SSL configuration');
    console.log('4. Firewall rules on the server side');
  } else {
    console.log('\nConnectivity test FAILED: The server is not reachable.');
    console.log('This indicates a network connectivity issue such as:');
    console.log('1. The server is down or not accepting connections');
    console.log('2. A firewall is blocking the connection');
    console.log('3. The hostname cannot be resolved or is incorrect');
    console.log('4. The port number is incorrect');
    console.log('5. Your network does not allow outbound connections to this service');
  }
});
