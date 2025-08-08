# FBA Ranker - Complete Setup Guide

A fun revenue ranking website for friends to compete by submitting proof of their monthly and all-time revenue!

## 🎯 Features

✅ **User Authentication** - Discord OAuth with Supabase Auth  
✅ **Photo Submissions** - Upload proof images with revenue/cost details  
✅ **Admin Approval System** - Review and approve/reject submissions  
✅ **Monthly Rankings** - See who's winning this month  
✅ **All-Time Rankings** - Track lifetime leaders  
✅ **Beautiful UI** - Modern design with shadcn/ui components  

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration (✅ Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://jouwtbznuildjxwwqvrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXd0YnpudWlsZGp4d3dxdnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjQzMTEsImV4cCI6MjA3MDIwMDMxMX0.6YYAKRYHCYLYqDCbB1r7HbobGJXumkaQZIL__uYiDms

# Server-side key (⚠️ REQUIRED: Get from Supabase Dashboard)
SUPABASE_URL=https://jouwtbznuildjxwwqvrj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin passcode for demo
ADMIN_PASSCODE=admin
```

**🔑 To get your Service Role Key:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/jouwtbznuildjxwwqvrj)
2. Settings → API → Copy the `service_role` key
3. Replace `your_service_role_key_here` in your `.env.local`

### 2. Create Storage Bucket

**📸 For proof image uploads:**
1. Go to [Storage](https://supabase.com/dashboard/project/jouwtbznuildjxwwqvrj/storage/buckets)
2. Create new bucket named `proofs`
3. Make it **public** or add policy: `(bucket_id = 'proofs') and (auth.role() = 'authenticated')`

### 3. Enable Discord OAuth (Optional)

1. Go to [Authentication → Providers](https://supabase.com/dashboard/project/jouwtbznuildjxwwqvrj/auth/providers)
2. Enable Discord provider
3. Add your Discord OAuth app credentials

### 4. Install Dependencies & Run

```bash
npm install --force  # ✅ Already done
npm run dev
```

### 5. Create Admin User

1. Sign up through the website
2. Go to [Table Editor → profiles](https://supabase.com/dashboard/project/jouwtbznuildjxwwqvrj/editor/profiles)
3. Find your user and change `role` from `user` to `admin`

## 📊 Database Schema (✅ Already Created)

### Tables:
- **`profiles`** - User profiles with roles
- **`submissions`** - Revenue submissions with approval status

### Key Features:
- Row Level Security (RLS) enabled
- Automatic profile creation on signup
- Admin role system
- Approval workflow

## 🎮 How to Use

1. **Sign Up** - Create account with Discord
2. **Submit Proof** - Upload revenue screenshots with details
3. **Admin Review** - Admins approve/reject submissions
4. **Rankings** - View monthly and all-time leaderboards

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Project Status

✅ Database schema created  
✅ Authentication working  
✅ Submission system ready  
✅ Admin panel functional  
✅ Rankings implemented  
⚠️ Need to create storage bucket  
⚠️ Need service role key  

## 🎯 Next Steps

1. Add your service role key to `.env.local`
2. Create the `proofs` storage bucket
3. Test the complete workflow
4. Invite friends to compete!

---

**Ready to rank your FBA profits! 🚀💰**
