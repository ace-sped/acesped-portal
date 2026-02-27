# Role Management Database Setup

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- Added `Role` model to store role permissions persistently
- Fields: id, role (unique), displayName, description, permissions (JSON array)

### 2. API Endpoints Created

#### `/api/admin/roles` (GET & POST)
- **GET**: Fetches all roles from database (returns default roles if DB is empty)
- **POST**: Initializes database with default roles

#### `/api/admin/roles/[roleId]` (GET & PUT)
- **GET**: Fetches a specific role
- **PUT**: Updates or creates a role with new permissions

### 3. Updated Role Management Component (`app/admin/roles/page.tsx`)
- Now fetches roles from database on load
- Saves role permission changes to database
- Added loading states
- Added "Initialize Default Roles" button if database is empty
- Permissions persist across page refreshes

## Setup Instructions

### Step 1: Run Database Migration

You need to apply the schema changes to your database. Run these commands:

```bash
# Generate Prisma Client with new Role model
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_role_model
```

### Step 2: Initialize Roles (Optional)

After the migration, you have two options:

**Option A: Automatic Initialization**
- Visit the Role Management page (`/admin/roles`)
- Click "Initialize Default Roles" button if no roles exist

**Option B: Manual API Call**
```bash
# Use curl or any API client
curl -X POST http://localhost:3000/api/admin/roles
```

## Default Roles Initialized

The system will create these roles with their respective permissions:

1. **Super Administrator** - All 15 sidebar items
2. **Center Leader** - Dashboard, Profile, User Management, Manage Programs, Manage Team, Reports
3. **Deputy Center Leader** - Dashboard, Profile, Manage Programs, Reports
4. **Academic Program Coordinator** - Dashboard, Profile, Manage Programs, Manage Applicants, Reports
5. **Applied Research Coordinator** - Dashboard, Profile, Reports, Share Docs
6. **Head of Program** - Dashboard, Profile, Manage Programs, Manage Applicants
7. **Lecturer** - Dashboard, Profile
8. **Student** - Dashboard, Profile
9. **Applicant** - Dashboard, Profile
10. **Staff** - Dashboard, Profile
11. **Head of Finance** - Dashboard, Profile, Reports
12. **Industrial Liaison Officer** - Dashboard, Profile, Reports, Share Docs

## Features

✅ **Persistent Storage** - Role permissions saved to PostgreSQL database
✅ **Auto-sync** - Changes reflect immediately in the UI
✅ **Loading States** - User-friendly loading indicators
✅ **Error Handling** - Graceful error messages for failed operations
✅ **Default Fallback** - Returns default roles if database is empty
✅ **Checkbox Interface** - All 15 sidebar items as selectable checkboxes
✅ **Real-time Updates** - Changes saved to database on submit

## Testing

1. Navigate to `/admin/roles`
2. Click edit on any role
3. Select/deselect permissions using checkboxes
4. Click "Save Changes"
5. Refresh the page - changes should persist!

## Troubleshooting

### Issue: Migration fails
**Solution**: Make sure your DATABASE_URL is correctly set in `.env` file

### Issue: Roles don't appear after migration
**Solution**: Click "Initialize Default Roles" button or make a POST request to `/api/admin/roles`

### Issue: Changes don't persist
**Solution**: Check browser console for API errors and ensure database connection is working





