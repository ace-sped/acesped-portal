# ACE Portal - Super Admin Dashboard Setup Guide

## Quick Start Guide

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Git (for version control)

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including bcryptjs for password hashing.

### Step 2: Setup Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your database connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/aceportal"
```

### Step 3: Setup Database

1. Generate Prisma Client:
```bash
npx prisma generate
```

2. Run database migrations:
```bash
npx prisma migrate dev --name init
```

3. (Optional) View your database with Prisma Studio:
```bash
npx prisma studio
```

### Step 4: Create Initial Super Admin User

You have two options:

#### Option A: Using Prisma Studio
1. Run `npx prisma studio`
2. Navigate to the `users` table
3. Add a new user with:
   - email: your-email@domain.com
   - password: (use bcrypt hash - see below)
   - role: SUPER_ADMIN
   - firstname: Your First Name
   - surname: Your Last Name

#### Option B: Using Direct SQL

```sql
-- First, generate a bcrypt hash for your password
-- You can use online tools or Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('your-password', 10);

INSERT INTO users (id, email, firstname, surname, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@aceportal.com',
  'Admin',
  'User',
  '$2a$10$YourBcryptHashedPasswordHere',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

#### Generate Password Hash

Create a file `scripts/hash-password.js`:

```javascript
const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
```

Run it:
```bash
node scripts/hash-password.js YourPasswordHere
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/admin` to access the Super Admin Dashboard.

## Features Overview

### 1. Dashboard (`/admin`)
- Overview statistics
- System health monitoring
- Recent user activity

### 2. User Management (`/admin/users`)
- Create, edit, delete users
- Search and filter users
- Role assignment

### 3. Role Management (`/admin/roles`)
- View all roles and permissions
- Understand role capabilities

### 4. Activity Logs (`/admin/logs`)
- Monitor system activities
- Filter and search logs

### 5. System Settings (`/admin/settings`)
- Configure general settings
- Security settings
- Notification preferences
- Database backup settings

### 6. Database Management (`/admin/database`)
- Create manual backups
- Restore from backups
- Database optimization

### 7. Reports (`/admin/reports`)
- Generate various reports
- Export data for analysis

## Authentication Setup (Important!)

⚠️ **Security Note**: The current implementation uses placeholder authentication. Before deploying to production, you MUST implement proper authentication.

### Recommended Authentication Options:

#### Option 1: NextAuth.js (Recommended)

1. Install NextAuth:
```bash
npm install next-auth
```

2. Create `/app/api/auth/[...nextauth]/route.ts`

3. Configure providers and callbacks

4. Update `middleware.ts` to check authentication

#### Option 2: Custom JWT Authentication

1. Create login API endpoint
2. Generate JWT tokens
3. Store in httpOnly cookies
4. Verify tokens in middleware

#### Option 3: Third-party Auth (Auth0, Clerk, Supabase)

Follow their respective integration guides.

### Update Middleware

Edit `middleware.ts` to check authentication:

```typescript
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}
```

### Protect API Routes

Update API routes in `/app/api/admin/` to verify authentication:

```typescript
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  // Continue with API logic...
}
```

## Production Deployment

### Before Deploying:

- [ ] Implement authentication system
- [ ] Set up environment variables on hosting platform
- [ ] Configure production database
- [ ] Enable database backups
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging
- [ ] Review security settings
- [ ] Test all features thoroughly

### Environment Variables for Production:

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
# Add other production-specific variables
```

### Build for Production:

```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues

1. Check DATABASE_URL format
2. Verify PostgreSQL is running
3. Test connection with:
```bash
npx prisma db pull
```

### Missing bcryptjs Module

```bash
npm install bcryptjs @types/bcryptjs
```

### Prisma Client Issues

```bash
npx prisma generate
npx prisma migrate reset
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for admin accounts
3. **Enable 2FA** for super admin accounts
4. **Regular backups** of database
5. **Monitor activity logs** regularly
6. **Keep dependencies updated**
7. **Use HTTPS** in production
8. **Implement rate limiting**
9. **Regular security audits**
10. **Follow OWASP guidelines**

## Support & Documentation

- Main Documentation: `ADMIN_DASHBOARD_README.md`
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev

## Next Steps

1. ✅ Complete initial setup
2. ⚠️ Implement authentication
3. ⚠️ Create first admin user
4. ⚠️ Test all features
5. ⚠️ Configure production settings
6. ⚠️ Deploy to production

For detailed information about each feature, see `ADMIN_DASHBOARD_README.md`.

