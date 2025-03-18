# Neon PostgreSQL Troubleshooting Guide

This document provides comprehensive troubleshooting steps for resolving connection issues with your Neon PostgreSQL database.

## Common Connection Issues

We've observed connection failures with various error messages like:
- `Connection terminated unexpectedly`
- `Server closed the connection unexpectedly`

## Troubleshooting Steps

### 1. Check Neon Database Status

First, ensure your database is active and not in sleep mode:

1. Log in to the [Neon Console](https://console.neon.tech)
2. Select your project
3. Check if your database branch is active
4. If the database is in sleep mode, it will wake up automatically on the first connection attempt, but may take a few seconds

### 2. Verify Connection String

Ensure your connection string is correctly formatted:

```
postgres://username:password@hostname:port/database?sslmode=require
```

For example:
```
postgres://neondb_owner:npg_OfArl0epnYW2@ep-gentle-band-a1nyci63-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 3. IP Access Control

Neon may have IP restrictions enabled:

1. In the Neon Console, go to the "Settings" page
2. Check the "IP Access" section
3. Either add your current IP address or temporarily disable IP restrictions for testing

### 4. Connection Pooling

There are two connection endpoints in Neon:
- Pooled connection (default): `hostname-pooler.region.aws.neon.tech`
- Direct connection: `hostname.region.aws.neon.tech`

Try both endpoints to see if one works better than the other.

### 5. SSL Configuration

Neon requires SSL. Make sure your connection includes:
- For direct connection: `?sslmode=require`
- For connection libraries:
  ```javascript
  ssl: {
    require: true,
    rejectUnauthorized: true
  }
  ```

### 6. Check Database Access

If you can connect with psql or another tool but not from your application:

1. Check if the database user has the appropriate permissions
2. Verify the database exists and is accessible
3. Ensure the schema and tables have been created

### 7. Network Connectivity

Test if your network can reach the Neon servers:

```bash
# Test DNS resolution
ping ep-gentle-band-a1nyci63-pooler.ap-southeast-1.aws.neon.tech

# Test TCP connection to port 5432
telnet ep-gentle-band-a1nyci63-pooler.ap-southeast-1.aws.neon.tech 5432
```

### 8. Prisma-Specific Configuration

If using Prisma, ensure your schema.prisma file contains:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}
```

And your .env file contains:

```
DATABASE_URL=postgres://neondb_owner:npg_OfArl0epnYW2@ep-gentle-band-a1nyci63-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 9. Library-Specific Settings

#### Node-Postgres (pg)
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: true
  }
});
```

#### Postgres.js
```javascript
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});
```

#### @vercel/postgres
```javascript
import { sql } from '@vercel/postgres';
// Uses the DATABASE_URL environment variable automatically
```

## Next Steps

If you continue to experience connection issues after trying these steps:

1. Check the Neon status page for any service disruptions
2. Contact Neon support with detailed error logs
3. Consider using a different PostgreSQL provider temporarily to rule out application issues

## Connection Test Commands

```bash
# Test with psql
psql "postgres://neondb_owner:npg_OfArl0epnYW2@ep-gentle-band-a1nyci63-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT 1"

# Test with our node script
bun run neon:sdk
```
