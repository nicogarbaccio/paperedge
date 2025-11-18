# Supabase MCP Server Setup for Claude Desktop

## What is Supabase MCP?

The Supabase MCP (Model Context Protocol) server allows Claude Desktop to directly interact with your Supabase database, enabling you to run SQL queries, manage your database schema, and more - all through natural language.

## Installation Steps

### Step 1: Locate Your Claude Desktop Config File

The Claude Desktop configuration file location depends on your OS:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Step 2: Create or Edit the Config File

If the file doesn't exist, create it. Then add the Supabase MCP server configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

### Step 3: Optional - Configure with Project Scope and Read-Only Mode

For **PaperEdge development**, I recommend using a scoped, read-only configuration to start:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=jirbuorgigynnohhlntw&features=database"
    }
  }
}
```

To enable **write access** (needed for running migrations), remove `read_only=true`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=jirbuorgigynnohhlntw&features=database"
    }
  }
}
```

### Step 4: Restart Claude Desktop

After saving the configuration file, completely quit and restart Claude Desktop for the changes to take effect.

### Step 5: Authenticate

When you first use Supabase MCP commands, you'll be prompted to authenticate via OAuth. This connects Claude Desktop to your Supabase account.

## Configuration Options

### URL Parameters

You can customize the MCP server behavior with URL parameters:

- `?project_ref=<id>` - Scope to a specific Supabase project
- `?read_only=true` - Enable read-only mode (prevents write operations)
- `?features=database,storage,functions` - Control which features are available

Available features:
- `account` - Account management
- `docs` - Documentation access
- `database` - Database operations (what we need!)
- `debugging` - Debugging tools
- `development` - Development tools
- `functions` - Edge Functions
- `storage` - Storage operations
- `branching` - Database branching

### Example: Production-Safe Configuration

For safety, you can start with read-only access and only enable database features:

```json
{
  "mcpServers": {
    "supabase-readonly": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=jirbuorgigynnohhlntw&features=database&read_only=true"
    },
    "supabase-write": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=jirbuorgigynnohhlntw&features=database"
    }
  }
}
```

This gives you two connections:
- `supabase-readonly` for safe queries
- `supabase-write` for migrations and schema changes

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Don't connect to production** - Use development/staging environments
2. **Use project scoping** - Always specify `?project_ref=<id>`
3. **Consider read-only mode** - Enable when you don't need write access
4. **Use database branching** - Test schema changes on branches first
5. **Review before executing** - Always review SQL before running it

## Using Supabase MCP

Once configured and authenticated, you can ask Claude to:

- **Run queries**: "Show me all accounts in the database"
- **Check schema**: "What columns exist in the account_daily_pl table?"
- **Run migrations**: "Execute the SQL in migrations/update_accounts_kind_constraint.sql"
- **Check constraints**: "Show me the check constraints on the accounts table"

## Running Our Casino Tracker Migrations

Once MCP is set up, you can simply ask Claude:

> "Use the Supabase MCP to run the migrations in migrations/update_accounts_kind_constraint.sql and migrations/add_casino_fields.sql"

Claude will:
1. Read the SQL files
2. Execute them against your Supabase database
3. Report the results

## Troubleshooting

### Config File Not Found
Create the directory and file manually:
```bash
# macOS
mkdir -p ~/Library/Application\ Support/Claude/
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Changes Not Taking Effect
- Completely quit Claude Desktop (not just close the window)
- Check JSON syntax is valid (use a JSON validator)
- Ensure no trailing commas in the JSON

### Authentication Issues
- Check you're logged into the correct Supabase account
- Try revoking and re-authenticating
- Verify your project ref is correct

### Permission Errors
- Ensure your Supabase user has the necessary permissions
- Check RLS policies if queries fail
- Verify you're not in read-only mode when trying to write

## Alternative: Manual Execution

If MCP setup is complex, you can still run migrations manually:

```bash
# Option 1: Supabase CLI
supabase link --project-ref jirbuorgigynnohhlntw
supabase db execute --file migrations/update_accounts_kind_constraint.sql
supabase db execute --file migrations/add_casino_fields.sql

# Option 2: Supabase Dashboard
# Go to: https://supabase.com/dashboard/project/jirbuorgigynnohhlntw/sql
# Paste and run each SQL file
```

## Resources

- [Supabase MCP Server](https://github.com/supabase-community/mcp-server-supabase)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude MCP Documentation](https://docs.claude.com/en/docs/build-with-claude/mcp)

---

**Ready to proceed?** Once you've added the configuration to your Claude Desktop config file and restarted, let me know and we can run the migrations!
