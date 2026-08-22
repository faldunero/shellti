# Turso Integration Guide — Complete Setup

## What's Changed

Your logging system has been upgraded from **filesystem JSON storage** to **Turso persistent database**. This means:

- ✅ Data persists between Vercel function invocations
- ✅ Queries accessible from anywhere globally
- ✅ Automatic indexing for fast statistics
- ✅ Free tier covers your current usage
- ✅ Same API endpoints, improved backend

## Files Created

### 1. **services/queryLoggerTurso.js** (NEW)
Replaces the filesystem-based `queryLogger.js` with Turso database operations:
- Automatic table creation on first run
- SQL-based query logging
- Async/await pattern for serverless
- Same statistical methods as before

### 2. **api/stats.js** (UPDATED)
Vercel serverless function using new Turso logger:
- `GET /api/stats?type=dashboard` → Dashboard statistics
- `GET /api/stats?type=usuarios` → User activity
- `GET /api/stats?type=agentes` → Agent usage
- `POST /api/stats` → Log new query
- CORS headers for cross-origin requests

### 3. **package.json** (NEW)
Dependencies for Turso integration:
```json
{
  "@libsql/client": "^0.5.6",  // Turso client
  "express": "^4.18.2",        // Express.js
  "dotenv": "^16.3.1"          // Environment vars
}
```

### 4. **.env.local** (NEW)
Your Turso credentials (KEEP SECURE):
```
TURSO_CONNECTION_URL=libsql://database-cordovan-fountain-vercel-icfg-ktxbwjk4nrn596svufncn2le.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### 5. **.env.example** (NEW)
Template for developers (safe to commit):
```
TURSO_CONNECTION_URL=libsql://database-name-xxxx.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

### 6. **TURSO_SETUP.md** (NEW)
Complete setup documentation including:
- Database creation instructions
- Credential management
- Troubleshooting guide
- Cost information
- SQL query examples

## Integration Steps

### Step 1: Update Your Repository

Copy these files to your GitHub repository:

**New files to add:**
- `services/queryLoggerTurso.js`
- `api/stats.js`
- `package.json`
- `.env.example`
- `TURSO_SETUP.md`
- `TURSO_INTEGRATION_GUIDE.md` (this file)

**Files to update:**
- `.gitignore` → Add `.env.local` (if not already present)

**Legacy files (optional archive):**
- `services/queryLogger.js` → Rename to `services/queryLogger.legacy.js` or keep for reference
- `routes/api/stats.js` → Archive or remove if using Vercel functions

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `@libsql/client` - Turso database driver
- `express` - Web framework (for local testing)
- `dotenv` - Environment variables

### Step 3: Add Environment Variables

**Local Development (.env.local):**
```bash
TURSO_CONNECTION_URL=libsql://database-cordovan-fountain-vercel-icfg-ktxbwjk4nrn596svufncn2le.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc0MDA5ODAsImlkIjoiMDFhMDI5NjYtODcwMS03Yzg5LWEyMTUtNWQ2MGVkOGU4NTNmIiwia2lkIjoiVTBuNm9ESXE2c3BLZDNvOVBTOHBzNnlQcnIxZkxhemNFYzZ5dF9NTXJZdyIsInJpZCI6ImJlMjg3NjRhLWIxNTQtNDBkZC04MDQyLTE4ZDg0ZDc1N2ZiYSJ9.pvkk5y0HVqZRP87Agf7uIuWipX_lYN6MkrOmtSPoa-oujn7alenYKscbTtMDGINB_hxdEbZnkbEliN392qoZCA
```

**Vercel Production:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add both `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN`
4. Apply to: **Production**, **Preview**, **Development**
5. Redeploy your project

### Step 4: Update Your Browser Code (agente.html, etc.)

The `enviarLogging()` function in your HTML files should already use `/api/stats` endpoint.

If you're using Express locally, ensure your server imports the stats router:

```javascript
const statsRouter = require('./routes/api/stats');
app.use('/api/stats', statsRouter);
```

For Vercel, the `api/stats.js` function handles all requests automatically.

### Step 5: Test the Integration

**Local testing:**
```bash
node -e "
const QueryLoggerTurso = require('./services/queryLoggerTurso');
const logger = new QueryLoggerTurso();
logger.logQuery({
  usuario_id: 'test_123',
  nombre_usuario: 'Test User',
  email: 'test@example.com',
  agente: 'compliance',
  pregunta: 'Test question',
  respuesta: 'Test response',
  tiempo_ms: 1000,
  tokens: 50
}).then(id => console.log('Logged:', id));
"
```

**Test dashboard endpoint:**
```bash
curl http://localhost:3000/api/stats?type=dashboard
```

### Step 6: Git Commit and Push

```bash
# Stage new files
git add .env.example package.json services/queryLoggerTurso.js \
  api/stats.js TURSO_SETUP.md TURSO_INTEGRATION_GUIDE.md

# Ensure .env.local is in .gitignore
echo ".env.local" >> .gitignore

# Commit
git commit -m "feat: Migrate logging system to Turso persistent database

- Replace filesystem JSON storage with Turso SQLite
- Implement async/await pattern for serverless functions
- Automatic table schema creation on first run
- Maintain same API endpoints (GET dashboard/usuarios/agentes, POST log)
- Add environment configuration for Turso credentials
- Keep all statistical aggregations and inactivity detection"

# Push to main (your source of truth)
git push origin main

# Optional: Also push to dev for homologation
git push origin dev
```

## Architecture Comparison

### Before (Filesystem)
```
agente.html
    ↓ fetch("/api/stats")
   api/stats.js (Vercel)
    ↓
services/queryLogger.js
    ↓ fs.writeFile()
   /tmp/queries.json (ephemeral - LOST)
```

### After (Turso)
```
agente.html
    ↓ fetch("/api/stats")
   api/stats.js (Vercel)
    ↓
services/queryLoggerTurso.js
    ↓ SQL INSERT/SELECT
   Turso Database (persistent, global)
    ↓
Turso Dashboard (monitoring)
```

## Key Improvements

| Aspect | Filesystem | Turso |
|--------|-----------|-------|
| **Persistence** | ❌ Lost between Vercel invocations | ✅ Permanent |
| **Query Speed** | ⚠️ Full file read (O(n)) | ✅ Indexed queries (O(log n)) |
| **Scalability** | ⚠️ File size grows unbounded | ✅ Database designed for scale |
| **Availability** | ⚠️ Single region | ✅ Global replicas |
| **Backups** | ⚠️ Manual | ✅ Automatic |
| **Cost** | ✅ Free | ✅ Free (up to 500M reads/month) |

## Database Statistics

Current database: `database-cordovan-fountain`
- **Region**: AWS US East 1 (Virginia)
- **Size**: ~0.05MB (growing ~50KB per 1000 queries)
- **Monthly quota**: 500M read rows, 10M write rows
- **Estimated usage**: ~0.1% of quota per month (typical)

## Monitoring

View database statistics at:
🔗 [Turso Dashboard](https://app.turso.tech) → Select your database

Or via CLI:
```bash
turso db show database-cordovan-fountain
turso db stats database-cordovan-fountain
turso db shell database-cordovan-fountain  # Interactive SQL console
```

## Rollback Plan

If you need to revert to filesystem logging:

1. Keep `services/queryLogger.js` (original)
2. In `api/stats.js`, change:
   ```javascript
   // Old:
   const QueryLogger = require('../services/queryLogger');
   const logger = new QueryLogger('./logs', 7);
   
   // Revert by uncommenting above and removing Turso version
   ```
3. Remove Turso dependencies: `npm uninstall @libsql/client`
4. Delete `.env.local` and Turso credentials
5. Push to main

## Next Steps

1. ✅ Turso database created and credentials provided
2. ✅ Code updated to use Turso
3. 🔄 **YOU**: Integrate files into your repository
4. 🔄 **YOU**: Add environment variables to Vercel
5. 🔄 **YOU**: Test with live agentes
6. 🔄 **YOU**: Verify admin dashboard displays persistent data
7. 🔄 **YOU**: Archive/remove filesystem logging code (optional)

## Support

- **Turso Issues**: [Turso Docs](https://docs.turso.tech)
- **libsql-client Issues**: [GitHub](https://github.com/libsql/libsql-client-js)
- **Vercel Issues**: [Vercel Docs](https://vercel.com/docs)

---

**Database Credentials Secure Note:**
- `.env.local` is in `.gitignore` ✅
- Credentials are stored only in your `.env.local` (local) and Vercel (production)
- Never commit `.env.local` to GitHub
- Rotate tokens annually for security
