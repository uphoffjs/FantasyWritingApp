# Supabase 403 Forbidden Error - Complete Solution

## 🔍 Root Cause Analysis

The 403 Forbidden error you're experiencing is caused by **Row Level Security (RLS) policies** not being properly configured in your Supabase database. Even though you're authenticated, Supabase is blocking access to the `projects` table because:

1. RLS is enabled on the table (which is good for security)
2. But the policies that allow authenticated users to access their own data haven't been applied

## ✅ Solution Steps

### Step 1: Apply RLS Policies via Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor** (in the left sidebar)
3. **Open the file**: `/scripts/simple-fix-rls.sql`
4. **Copy the entire contents** and paste into the SQL Editor
5. **Click "Run"** to execute the script
6. **Verify the results** - you should see a success message and a table showing the created policies

### Step 2: Verify the Fix

After applying the SQL script, test if the issue is resolved:

1. **Refresh your application**
2. **Try the operation that was failing** (it should work now)
3. **Check the browser console** - the 403 error should be gone

### Step 3: (Optional) Run Diagnostics

If you want to verify everything is working correctly, I've created a diagnostic component:

1. Import and use the `SupabaseDiagnostic` component in your app
2. It will run comprehensive tests and show you the status of:
   - Authentication session
   - RLS policies
   - Database permissions
   - Test queries

## 📝 What the Fix Does

The SQL script (`/scripts/simple-fix-rls.sql`) performs these actions:

1. **Drops any existing policies** (to start fresh)
2. **Enables RLS** on the projects table
3. **Creates 4 essential policies**:
   - **SELECT Policy**: Users can view projects where `user_id = auth.uid()`
   - **INSERT Policy**: Users can create projects with their `user_id`
   - **UPDATE Policy**: Users can update their own projects
   - **DELETE Policy**: Users can delete their own projects
4. **Verifies the setup** with test queries

## 🔐 Understanding Row Level Security (RLS)

RLS is Supabase's way of securing your data at the database level. When enabled:
- **Without policies**: Nobody can access the data (even authenticated users)
- **With policies**: Only users matching the policy conditions can access data

Your policies ensure that:
- Each user can only see/modify their own projects
- User A cannot access User B's projects
- The database enforces this security automatically

## 🚨 Common Issues & Solutions

### Issue 1: Policies not applying
**Solution**: Make sure you run the ENTIRE SQL script, not just parts of it

### Issue 2: Still getting 403 after applying policies
**Possible causes**:
- User not properly authenticated → Check auth session
- `user_id` field is NULL → Ensure projects have valid user_id values
- Cached responses → Clear browser cache and retry

### Issue 3: Can't see any projects after fix
**This is normal if**:
- You haven't created any projects yet with the authenticated user
- Projects in the database have different user_id values

## 🔧 Alternative Solutions

### Using Service Role Key (Development Only!)
If you need to bypass RLS for development/debugging:

```typescript
// WARNING: Never use service role key in production/client-side code!
const supabaseAdmin = createClient(supabaseUrl, SERVICE_ROLE_KEY);
```

### Temporarily Disable RLS (Not Recommended)
```sql
-- Disable RLS (allows all access - dangerous!)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

## 📚 Files Created for This Fix

1. **`/scripts/simple-fix-rls.sql`** - Main SQL script to apply RLS policies
2. **`/scripts/fix-supabase-rls.sql`** - Extended version with more details
3. **`/src/components/SupabaseDiagnostic.tsx`** - React component for testing
4. **`/SUPABASE_403_FIX.md`** - This documentation file

## ✔️ Verification Checklist

After applying the fix, verify:
- [ ] SQL script executed successfully in Supabase Dashboard
- [ ] No more 403 errors in browser console
- [ ] Can create new projects
- [ ] Can view existing projects
- [ ] Can update project details
- [ ] Can delete projects

## 🆘 Still Having Issues?

If the problem persists after following these steps:

1. **Check authentication**: Ensure you're logged in with a valid Supabase user
2. **Verify user_id**: Check that the user_id in your projects table matches the authenticated user's ID
3. **Review policies**: Use the Supabase Dashboard to review the applied policies
4. **Test with diagnostic tool**: Use the SupabaseDiagnostic component to identify the specific issue

---

**Remember**: The key is that RLS policies must be applied to your Supabase database. Without them, even authenticated users will get 403 errors!