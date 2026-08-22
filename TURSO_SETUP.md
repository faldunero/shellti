# Turso Database Setup Guide

## Overview
This logging system now uses **Turso** (managed SQLite) for persistent data storage instead of filesystem JSON files. Turso is a free tier service that provides:
- ✅ 100 databases included
- ✅ 5GB storage per database
- ✅ 500M monthly read rows
- ✅ 10M monthly write rows
- ✅ Global database replicas
- ✅ Zero-cost for most use cases

## Step 1: Create Turso Database

### Option A: Via Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Storage** tab
3. Click **Create Database** → Choose **Turso**
4. Configure:
   - **Database Name**: `database-cordovan-fountain` (or your preferred name)
   - **Primary Region**: US East (iad1) or your preferred region
   - **Plan**: Starter (Free)
5. Click **Create** and wait for setup

### Option B: Direct via Turso CLI
```bash
# Install Turso CLI
curl https://get.turso.tech | bash

# Create database
turso db create database-cordovan-fountain --region iad1

# Get connection credentials
turso db show database-cordovan-fountain
```

## Step 2: Get Connection Credentials

After database creation, you'll see:

```
Database URL: libsql://database-cordovan-fountain-xxxx.turso.io
Auth Token: eyJhbGciOiJFZEdTIn0.your_token_here
```

Copy these values exactly.

## Step 3: Configure Environment Variables

### For Local Development
Create `.env.local` in your project root:

```bash
TURSO_CONNECTION_URL=libsql://database-cordovan-fountain-xxxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZEdTIn0.your_token_here
```

### For Vercel Deployment
1. Go to Vercel Project Settings → **Environment Variables**
2. Add:
   - `TURSO_CONNECTION_URL` = your database URL
   - `TURSO_AUTH_TOKEN` = your auth token
3. Apply to: **Production**, **Preview**, **Development**
4. Redeploy your project

## Step 4: Install Dependencies

```bash
npm install
```

This installs:
- `@libsql/client` - Turso database driver
- `express` - Web framework
- `dotenv` - Environment variable management

## Step 5: Verify Setup

### Test Logging
```bash
curl -X POST http://localhost:3000/api/stats \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": "test_user",
    "nombre_usuario": "Test User",
    "email": "test@example.com",
    "agente": "compliance",
    "pregunta": "Test query",
    "respuesta": "Test response",
    "tiempo_ms": 1000,
    "tokens": 100
  }'
```

Expected response:
```json
{
  "consulta_id": "con_1724252400123_abcd",
  "status": "logged"
}
```

### Test Dashboard Endpoint
```bash
curl http://localhost:3000/api/stats?type=dashboard
```

Expected response: Statistics JSON with agregated data

## Database Schema

The Turso database automatically creates this table:

```sql
CREATE TABLE consultas (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  nombre_usuario TEXT,
  email TEXT,
  agente TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  tipo_consulta TEXT DEFAULT 'pregunta',
  tema TEXT,
  resumen_pregunta TEXT,
  respuesta_caracteres INTEGER DEFAULT 0,
  tiempo_respuesta_ms INTEGER DEFAULT 0,
  tokens_utilizados INTEGER DEFAULT 0,
  user_agent TEXT,
  ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

Indexes are automatically created on:
- `usuario_id` (for user filtering)
- `agente` (for agent statistics)
- `timestamp` (for time-range queries)

## Query Examples

### Connect to Database
```bash
turso db shell database-cordovan-fountain
```

### View All Queries
```sql
SELECT * FROM consultas LIMIT 10;
```

### Statistics by Agent
```sql
SELECT agente, COUNT(*) as total, SUM(tokens_utilizados) as total_tokens
FROM consultas
GROUP BY agente;
```

### User Activity Last 7 Days
```sql
SELECT usuario_id, nombre_usuario, COUNT(*) as consultas, MAX(timestamp) as ultima_actividad
FROM consultas
WHERE timestamp > datetime('now', '-7 days')
GROUP BY usuario_id
ORDER BY ultima_actividad DESC;
```

### Average Response Time
```sql
SELECT agente, AVG(tiempo_respuesta_ms) as promedio_ms
FROM consultas
GROUP BY agente;
```

## Troubleshooting

### Connection Error: "TURSO_CONNECTION_URL not set"
- Verify `.env.local` file exists
- Check URL format: `libsql://...` (not https)
- Reload your terminal/IDE after creating .env file

### Auth Token Error: "Invalid or expired auth token"
- Regenerate token in Turso dashboard
- Update both local `.env` and Vercel environment variables

### Database Not Found
- Verify database name matches in Turso dashboard
- Check region is accessible
- Try creating a new database

### Slow Queries
- Monitor usage in Turso dashboard
- Check for missing indexes
- Consider upgrading from Starter plan if exceeding limits

## Monitoring & Limits

Visit [Turso Dashboard](https://app.turso.tech) to:
- Monitor current usage (reads, writes, storage)
- Check remaining quota for the month
- View database backups
- Access database shell for direct queries

## Cost (Free Tier)
- 100 databases: ✅ 1 database used
- 5GB storage: ✅ ~10-50MB for typical use
- 500M monthly read rows: ✅ Sufficient for most cases
- 10M monthly write rows: ✅ Each logging call = 1 write

For high-volume deployments (>1M daily queries), consider upgrading to a paid plan.

## Migration from Filesystem Logging

If you previously used JSON file logging:

1. **Old system** (filesystem): `./logs/queries.json`
2. **New system** (Turso): `libsql://...`

No migration script needed—both systems coexist. Old logs remain in `/logs` directory, new logs go to Turso database. Over time, filesystem logs can be archived or deleted.

## References

- [Turso Documentation](https://docs.turso.tech)
- [Turso CLI Reference](https://docs.turso.tech/cli/introduction)
- [@libsql/client API](https://github.com/libsql/libsql-client-js)
- [Vercel Storage Integration](https://vercel.com/docs/storage/vercel-postgres)
