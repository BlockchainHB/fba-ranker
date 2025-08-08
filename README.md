# 🏆 FBA Hangout - Seller's Leaderboard

A competitive leaderboard platform for Amazon FBA sellers to track, compare, and showcase their monthly and all-time profits. Built with Next.js, Supabase, and modern UI components.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 Features

- **🔐 Secure Authentication** - Supabase Auth with role-based access control
- **📸 Proof Submissions** - Upload profit screenshots with detailed revenue/cost breakdown
- **✅ Admin Review System** - Moderated approval process for all submissions
- **📊 Dual Rankings** - Monthly leaderboards and all-time champions
- **👥 User Management** - Admin panel for user roles and submission oversight
- **🎨 Modern UI** - Beautiful, responsive design with shadcn/ui components
- **📱 Mobile Friendly** - Fully responsive across all devices
- **🛡️ Row-Level Security** - Database-level security with Supabase RLS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BlockchainHB/fba-ranker.git
   cd fba-ranker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Admin Configuration
   ADMIN_PASSCODE=your_admin_passcode
   ```

4. **Set up Supabase**
   
   Run the SQL script to create the database schema:
   ```bash
   # Copy the contents of scripts/sql/0001_init.sql
   # and run it in your Supabase SQL editor
   ```

5. **Create storage bucket**
   
   In your Supabase dashboard:
   - Go to Storage → Create new bucket
   - Name it `proofs`
   - Set appropriate access policies

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Create an admin user**
   - Sign up through the application
   - In Supabase dashboard, go to Table Editor → profiles
   - Change your user's `role` from `user` to `admin`

## 🏗️ Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript
- **State Management**: React hooks
- **File Storage**: Supabase Storage
- **Deployment**: Vercel-ready

## 📱 Usage

### For Sellers
1. **Sign Up**: Create an account using email authentication
2. **Submit Proof**: Upload profit screenshots with product details
3. **Track Progress**: View your submissions and approval status
4. **Compete**: Climb the monthly and all-time leaderboards

### For Admins
1. **Review Submissions**: Approve or reject profit submissions
2. **Manage Users**: View and modify user roles
3. **Monitor Activity**: Track platform usage and engagement

## 🗄️ Database Schema

### Tables

- **`profiles`**: User profiles with role management
- **`submissions`**: Revenue submissions with approval workflow

### Key Features
- Row-Level Security (RLS) enabled on all tables
- Automatic profile creation on user signup
- Comprehensive indexing for performance
- Audit trails with timestamps

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Project Structure

```
fba-ranker/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
├── public/                 # Static assets
├── scripts/sql/            # Database migration scripts
└── styles/                 # Global styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_URL` | Supabase project URL (server-side) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `ADMIN_PASSCODE` | Admin access passcode | ✅ |

### Supabase Setup

1. **Storage Policies**: Configure the `proofs` bucket with appropriate access policies
2. **RLS Policies**: Ensure Row-Level Security is enabled (handled by migration script)
3. **Authentication**: Configure preferred auth providers in Supabase dashboard

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables
3. **Deploy**: Automatic deployments on push to main branch

### Other Deployment Options

- **Netlify**: Compatible with minor configuration changes
- **Railway**: Database and application hosting
- **Self-hosted**: Docker configuration can be added

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- Powered by [Supabase](https://supabase.com) for backend infrastructure
- Icons from [Lucide React](https://lucide.dev/)

## 📞 Support

If you have any questions or run into issues:

1. Check the [setup guide](SETUP_GUIDE.md) for detailed instructions
2. Open an issue on GitHub
3. Join our community discussions

---

**Built with ❤️ for the Amazon FBA community**

*Transform your seller group into a competitive, engaging community where success is celebrated and tracked!*