# Supabase MCP Server

An MCP (Model Context Protocol) server that enables Claude to interact directly with Supabase databases.

## Features

- **Query**: Execute SELECT queries with filters, ordering, and limits
- **Insert**: Insert data into tables with optional upsert
- **Update**: Update existing records with filters
- **Delete**: Delete records based on filters
- **RPC**: Call Supabase RPC functions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. Build the server:
   ```bash
   npm run build
   ```

4. Add to Claude Code configuration (`~/.config/claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "node",
         "args": ["/path/to/fantasy-element-builder/supabase-mcp-server/dist/index.js"],
         "env": {
           "SUPABASE_URL": "your_supabase_url",
           "SUPABASE_ANON_KEY": "your_supabase_anon_key"
         }
       }
     }
   }
   ```

## Usage Examples

### Query data
```javascript
// Simple query
await query({ table: "users" })

// With filters and ordering
await query({ 
  table: "posts",
  columns: "id,title,created_at",
  filters: { published: true },
  orderBy: "created_at",
  ascending: false,
  limit: 10
})

// Complex filters
await query({
  table: "products",
  filters: {
    price: { gte: 10, lte: 100 },
    category: "electronics"
  }
})
```

### Insert data
```javascript
await insert({
  table: "users",
  data: {
    email: "user@example.com",
    name: "John Doe"
  }
})
```

### Update data
```javascript
await update({
  table: "users",
  data: { name: "Jane Doe" },
  filters: { id: 123 }
})
```

### Delete data
```javascript
await delete({
  table: "posts",
  filters: { id: 456 }
})
```

### Call RPC function
```javascript
await rpc({
  functionName: "get_user_stats",
  params: { user_id: 123 }
})
```