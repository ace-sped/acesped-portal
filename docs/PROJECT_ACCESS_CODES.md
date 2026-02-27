# Project Access Codes

This document describes the Project Access Code system for managing restricted access to projects.

## Overview

The `ProjectAccessCode` model provides a flexible system for controlling access to projects through unique access codes. Each project can have multiple access codes with different properties.

## Database Model

```prisma
model ProjectAccessCode {
  id          String    @id @default(cuid())
  projectId   String
  code        String
  description String?
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  maxUses     Int?      // null = unlimited
  usageCount  Int       @default(0)
  createdBy   String?   // User who created this code
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, code])
}
```

## Features

- ✅ **Multiple codes per project**: Each project can have multiple access codes
- ✅ **Expiration dates**: Codes can expire after a certain date
- ✅ **Usage limits**: Set maximum number of times a code can be used
- ✅ **Usage tracking**: Track how many times each code has been used
- ✅ **Active/Inactive status**: Easily enable or disable codes
- ✅ **Descriptions**: Add notes about what each code is for
- ✅ **Creator tracking**: Know who created each code

## API Endpoints

### Get Access Codes for a Project

```http
GET /api/project-access-codes?projectId={projectId}
```

**Response:**
```json
[
  {
    "id": "clx...",
    "projectId": "clx...",
    "code": "INNOV2024",
    "description": "General access code for innovation team",
    "expiresAt": "2024-12-31T23:59:59.999Z",
    "isActive": true,
    "maxUses": null,
    "usageCount": 15,
    "createdBy": "admin@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Create Access Code

```http
POST /api/project-access-codes
Content-Type: application/json

{
  "projectId": "clx...",
  "code": "INNOV2024",
  "description": "General access code",
  "expiresAt": "2024-12-31T23:59:59.999Z",
  "maxUses": 100,
  "createdBy": "admin@example.com"
}
```

### Get Single Access Code

```http
GET /api/project-access-codes/{id}
```

### Update Access Code

```http
PATCH /api/project-access-codes/{id}
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": false,
  "maxUses": 200
}
```

### Delete Access Code

```http
DELETE /api/project-access-codes/{id}
```

## Utility Functions

The `lib/project-access-codes.ts` file provides helper functions:

### validateAccessCode()

Validates an access code and returns matching project IDs.

```typescript
import { validateAccessCode } from '@/lib/project-access-codes';

const projectIds = await validateAccessCode('INNOV2024');
// Returns: ['project-id-1', 'project-id-2'] or null if invalid
```

### incrementAccessCodeUsage()

Increments the usage count for an access code.

```typescript
import { incrementAccessCodeUsage } from '@/lib/project-access-codes';

await incrementAccessCodeUsage('INNOV2024', 'project-id');
```

### createAccessCode()

Creates a new access code.

```typescript
import { createAccessCode } from '@/lib/project-access-codes';

const accessCode = await createAccessCode('project-id', 'INNOV2024', {
  description: 'For innovation team members',
  expiresAt: new Date('2024-12-31'),
  maxUses: 100,
  createdBy: 'admin@example.com'
});
```

### getProjectAccessCodes()

Gets all access codes for a project.

```typescript
import { getProjectAccessCodes } from '@/lib/project-access-codes';

const codes = await getProjectAccessCodes('project-id');
```

### deactivateAccessCode()

Deactivates an access code (soft delete).

```typescript
import { deactivateAccessCode } from '@/lib/project-access-codes';

await deactivateAccessCode('access-code-id');
```

### deleteAccessCode()

Permanently deletes an access code.

```typescript
import { deleteAccessCode } from '@/lib/project-access-codes';

await deleteAccessCode('access-code-id');
```

### updateAccessCode()

Updates an access code.

```typescript
import { updateAccessCode } from '@/lib/project-access-codes';

await updateAccessCode('access-code-id', {
  description: 'Updated description',
  isActive: false
});
```

## Usage in Projects API

The `/api/projects` endpoint now uses the new access code system:

```typescript
// Fetch projects with access code
const response = await fetch('/api/projects?accessCode=INNOV2024');
const projects = await response.json();
```

## Migration

To migrate existing `accessCode` fields from the Project model to the new system:

```bash
node scripts/seed-access-codes.js
```

This script will:
1. Find all projects
2. Check if they have a legacy `accessCode` field
3. Create corresponding `ProjectAccessCode` records
4. Mark them as migrated

## Validation Rules

An access code is considered valid if:

1. ✅ Code matches exactly (case-sensitive)
2. ✅ `isActive` is `true`
3. ✅ Either no expiration date OR expiration date is in the future
4. ✅ Either no max uses OR usage count is below max uses

## Best Practices

1. **Use descriptive codes**: Make codes memorable but not guessable
   - Good: `INNOV2024`, `RESEARCH-SPRING`
   - Bad: `123456`, `password`

2. **Set expiration dates**: For temporary access, always set an expiration
   ```typescript
   expiresAt: new Date('2024-12-31T23:59:59.999Z')
   ```

3. **Limit usage**: For shared codes, set a reasonable max uses limit
   ```typescript
   maxUses: 100
   ```

4. **Track creators**: Always include who created the code
   ```typescript
   createdBy: currentUser.email
   ```

5. **Use descriptions**: Document the purpose of each code
   ```typescript
   description: 'Access code for Q4 2024 innovation team members'
   ```

6. **Deactivate instead of delete**: For audit trails, deactivate codes instead of deleting
   ```typescript
   await deactivateAccessCode(id);
   ```

## Security Considerations

- ⚠️ Access codes are stored in plain text (suitable for non-sensitive access control)
- ⚠️ Codes should not be used for authentication (use proper auth for that)
- ⚠️ Rate limit the validation endpoint to prevent brute force attacks
- ⚠️ Monitor usage counts for suspicious activity
- ⚠️ Regularly audit and expire old codes

## Example: Creating Time-Limited Codes

```typescript
// Create a code that expires in 30 days with 50 max uses
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 30);

await createAccessCode('project-id', 'TEMP-2024', {
  description: 'Temporary 30-day access code',
  expiresAt: expiryDate,
  maxUses: 50,
  createdBy: 'admin@example.com'
});
```

## Example: One-Time Use Codes

```typescript
// Create a code that can only be used once
await createAccessCode('project-id', 'SINGLE-USE-CODE', {
  description: 'One-time access code for VIP guest',
  maxUses: 1,
  createdBy: 'admin@example.com'
});
```

## Troubleshooting

### Code not working

1. Check if the code is active: `isActive = true`
2. Check expiration date: Should be null or in the future
3. Check usage limit: Should be null or `usageCount < maxUses`
4. Verify the code matches exactly (case-sensitive)

### Database migration failed

If the migration fails:

1. Run `npx prisma db push` to sync the schema
2. Run `npx prisma generate` to update the Prisma client
3. Restart your development server

### Access codes not being validated

Ensure you're importing from the correct path:

```typescript
import { validateAccessCode } from '@/lib/project-access-codes';
```

Not from the old system.
