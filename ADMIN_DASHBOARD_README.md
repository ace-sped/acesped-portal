# Super Admin Dashboard Documentation

## Overview

This Super Admin Dashboard provides comprehensive control and management capabilities for the ACE Portal. It includes user management, role administration, system settings, activity monitoring, and database operations.

## Features

### 1. Dashboard Overview (`/admin`)
- **Real-time Statistics**: View total users, active users, super admins, and recent activity
- **Role Distribution Charts**: Visual representation of user roles across the platform
- **System Health Monitoring**: Real-time status of database, API, and storage
- **Recent Users Table**: Quick view of newly registered users

### 2. User Management (`/admin/users`)
- **Create Users**: Add new users with email, name, password, and role assignment
- **Edit Users**: Modify user information and change roles
- **Delete Users**: Remove users from the system (with confirmation)
- **Search & Filter**: Find users by name, email, or role
- **Bulk Operations**: Export user data for reporting

### 3. Role Management (`/admin/roles`)
- **View All Roles**: Complete list of available user roles
- **Role Permissions**: Detailed breakdown of permissions for each role
- **User Counts**: See how many users are assigned to each role
- **Role Descriptions**: Understand the purpose and capabilities of each role

#### Available Roles:
- **SUPER_ADMIN**: Full system access and control
- **Center_Leader**: Manages center operations and staff
- **Deputy_Center_Leader**: Assists in center management
- **Academic_Program_Coordinator**: Coordinates academic programs
- **Head_of_Program**: Leads specific academic programs
- **Lecturer**: Manages courses and student assessments
- **Student**: Accesses learning materials and courses
- **Applicant**: Applies for admission
- **Staff**: Administrative and support functions
- **Head_of_Finance**: Manages financial operations
- **Industrial_Liaison_Officer**: Handles industry partnerships

### 4. Activity Logs (`/admin/logs`)
- **Real-time Activity Tracking**: Monitor all system activities
- **Filter by Type**: View logs by info, success, warning, or error
- **Search Functionality**: Find specific activities or users
- **Export Logs**: Download activity logs for auditing
- **Detailed Information**: View timestamp, user, action, IP address, and details

### 5. System Settings (`/admin/settings`)
- **General Settings**: Site name, description, contact email, timezone
- **Security Settings**: Password requirements, session timeout, 2FA options
- **Notification Settings**: Email notifications, system alerts, reports
- **Database Settings**: Backup frequency, retention period, auto-backup

### 6. Database Management (`/admin/database`)
- **Manual Backups**: Create on-demand database backups
- **Restore Backups**: Restore from previous backups
- **Database Optimization**: Optimize database performance
- **Backup History**: View and manage all database backups
- **Database Statistics**: Monitor size, records, and last backup time

### 7. Reports & Analytics (`/admin/reports`)
- **User Activity Reports**: Detailed user action reports
- **Growth Reports**: User registration trends and metrics
- **Role Distribution Reports**: Analysis of role assignments
- **System Usage Reports**: Performance and usage statistics
- **Analytics Reports**: Engagement and usage analytics
- **Security Audit Reports**: Security events and access attempts

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `bcryptjs` - For password hashing
- `@prisma/client` - Database ORM
- `lucide-react` - UI icons

### 2. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed initial admin user
npx prisma db seed
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aceportal"
# Add other environment variables as needed
```

### 4. Create Initial Super Admin

You'll need to create an initial SUPER_ADMIN user directly in the database:

```sql
INSERT INTO users (id, email, firstname, surname, password, role, "createdAt", "updatedAt")
VALUES (
  'initial-admin-id',
  'admin@aceportal.com',
  'Super',
  'Admin',
  '$2a$10$hashedPasswordHere', -- Use bcrypt to hash your password
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

Or use the API endpoint after initial setup.

## Access Control

### Authentication Middleware

The admin dashboard is protected by middleware in `middleware.ts`. Currently, it's set up as a placeholder. To implement full authentication:

1. **Set up authentication** (NextAuth, Auth0, custom JWT, etc.)
2. **Update `middleware.ts`** to check for valid sessions
3. **Verify user roles** in the middleware
4. **Redirect unauthorized users** to login page

### API Route Protection

All admin API routes include TODO comments for authentication checks:

```typescript
// TODO: Add authentication check for SUPER_ADMIN role
```

Implement these checks to ensure only SUPER_ADMIN users can access the APIs.

### Example Authentication Check

```typescript
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!isSuperAdmin(user)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  // Continue with the API logic...
}
```

## Security Considerations

### 1. Password Security
- Passwords are hashed using bcrypt with a cost factor of 10
- Never store plain-text passwords
- Enforce strong password requirements in settings

### 2. Session Management
- Implement session timeouts (configurable in settings)
- Use secure, httpOnly cookies for session tokens
- Implement CSRF protection

### 3. Role-Based Access Control (RBAC)
- Always verify user roles before granting access
- Use the permission system in `lib/auth.ts`
- Implement the principle of least privilege

### 4. Audit Logging
- All admin actions should be logged
- Include IP addresses, timestamps, and action details
- Regular review of activity logs

### 5. Database Backups
- Enable automatic backups
- Store backups securely off-site
- Test restoration procedures regularly

## API Endpoints

### User Management
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/users/recent` - Get recent users

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

### System Health
- `GET /api/admin/health` - Check system health status

## Customization

### Adding New Admin Pages

1. Create a new page in `/app/admin/[pagename]/page.tsx`
2. Use the `AdminLayout` component for consistent styling
3. Add the route to the sidebar navigation in `AdminLayout.tsx`

### Modifying Permissions

Edit the `PERMISSIONS` object in `lib/auth.ts` to add or modify role permissions.

### Styling

The dashboard uses Tailwind CSS with dark mode support. Customize colors and styles by modifying the Tailwind configuration or component classes.

## Development

### Running the Development Server

```bash
npm run dev
```

Access the admin dashboard at: `http://localhost:3000/admin`

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Check database credentials

2. **Missing Dependencies**
   - Run `npm install`
   - Verify package.json includes bcryptjs

3. **Permission Denied Errors**
   - Implement authentication middleware
   - Verify user role is SUPER_ADMIN
   - Check API route protection

4. **Build Errors**
   - Run `npx prisma generate`
   - Clear `.next` directory
   - Check for TypeScript errors

## Future Enhancements

- [ ] Implement complete authentication system
- [ ] Add real-time notifications
- [ ] Enhanced analytics with charts
- [ ] Email notification system
- [ ] Two-factor authentication
- [ ] Advanced search and filtering
- [ ] Batch user operations
- [ ] Audit trail export
- [ ] System performance monitoring
- [ ] API rate limiting

## Support

For issues or questions about the Super Admin Dashboard, please contact the development team or refer to the project documentation.

## License

This admin dashboard is part of the ACE Portal project and follows the same license terms.

