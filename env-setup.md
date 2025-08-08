# Environment Setup for FBA Ranker

Create a `.env.local` file in the project root with these values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jouwtbznuildjxwwqvrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXd0YnpudWlsZGp4d3dxdnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjQzMTEsImV4cCI6MjA3MDIwMDMxMX0.6YYAKRYHCYLYqDCbB1r7HbobGJXumkaQZIL__uYiDms

# For server-side operations, you'll need the service role key from Supabase dashboard
SUPABASE_URL=https://jouwtbznuildjxwwqvrj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin Configuration
ADMIN_PASSCODE=admin
```

## Next Steps:

1. **Get Service Role Key**: Go to your Supabase dashboard → Settings → API → Copy the `service_role` key and replace `your_service_role_key_here`

2. **Create Storage Bucket**: 
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `proofs`
   - Make it public or add appropriate policies

3. **Enable Discord OAuth** (optional):
   - Go to Authentication → Providers
   - Enable Discord provider
   - Add your Discord OAuth credentials

4. **Create an admin user**:
   - Sign up through the app
   - Go to Supabase Dashboard → Table Editor → profiles
   - Find your user and change the `role` from `user` to `admin`

The database schema has been successfully created with all necessary tables and policies!
