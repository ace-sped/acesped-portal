# Access Code Verification System

## 🔐 Overview

The access code verification system validates user access codes against the `ProjectAccessCode` database table before granting access to the projects page.

---

## 📋 Database Table

### ProjectAccessCode Model
```prisma
model ProjectAccessCode {
  id         String   @id @default(cuid())
  code       String   @unique
  accessTo   String[] // Array of project IDs
  isActive   Boolean  @default(true)
  maxUses    Int?     // null = unlimited
  usageCount Int      @default(0)
  createdBy  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

---

## 🔄 Verification Flow

```
1. User visits /access page
         ↓
2. User enters access code
         ↓
3. Frontend sends POST to /api/verify-access-code
         ↓
4. Backend validates code:
   - Code exists in database?
   - isActive = true?
   - maxUses not exceeded?
         ↓
5. If valid:
   - Increment usageCount
   - Return success
         ↓
6. Frontend stores code in sessionStorage
         ↓
7. Redirect to /projects
         ↓
8. /projects validates code again
         ↓
9. Fetch and show only accessible projects
```

---

## 🛠️ Implementation

### 1. Verification API Endpoint

**File:** `app/api/verify-access-code/route.ts`

```typescript
POST /api/verify-access-code
Content-Type: application/json

{
  "accessCode": "INNOV2024"
}
```

**Response (Success):**
```json
{
  "valid": true,
  "message": "Access code verified successfully",
  "projectCount": 3
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "Invalid access code or no projects found"
}
```

### 2. Validation Logic

**File:** `lib/project-access-codes.ts`

The `validateAccessCode()` function checks:

✅ **Code exists** - Looks up code in database  
✅ **Is active** - `isActive = true`  
✅ **Not maxed out** - `usageCount < maxUses` (if maxUses is set)  
✅ **Has projects** - Returns array of project IDs from `accessTo` field  

```typescript
export async function validateAccessCode(code: string): Promise<string[] | null> {
  const accessCode = await prisma.projectAccessCode.findUnique({
    where: { code: code.trim() }
  });

  if (!accessCode) return null;
  if (!accessCode.isActive) return null;
  if (accessCode.maxUses && accessCode.usageCount >= accessCode.maxUses) return null;

  return accessCode.accessTo; // Array of project IDs
}
```

### 3. Usage Tracking

After successful verification, the system increments the `usageCount`:

```typescript
export async function incrementAccessCodeUsage(code: string) {
  await prisma.projectAccessCode.update({
    where: { code: code.trim() },
    data: {
      usageCount: { increment: 1 }
    }
  });
}
```

### 4. Frontend Access Page

**File:** `app/access/page.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Verify code with database
  const response = await fetch('/api/verify-access-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: accessCode.trim() }),
  });

  const data = await response.json();

  if (response.ok && data.valid) {
    // Store code in session
    sessionStorage.setItem('project_access_code', accessCode.trim());
    
    // Redirect to projects
    router.push('/projects');
  } else {
    // Show error
    setError(data.error || 'Invalid access code');
  }
};
```

---

## 🔍 Validation Rules

An access code is **VALID** if:

| Check | Requirement | Field |
|-------|-------------|-------|
| ✅ Exists | Code found in database | `code` |
| ✅ Active | Status is active | `isActive = true` |
| ✅ Not expired | No expiration (field removed) | N/A |
| ✅ Has capacity | Usage under limit | `usageCount < maxUses` |
| ✅ Has projects | Project IDs exist | `accessTo.length > 0` |

An access code is **INVALID** if:

| Scenario | Response |
|----------|----------|
| ❌ Code doesn't exist | "Invalid access code or no projects found" |
| ❌ isActive = false | "Invalid access code or no projects found" |
| ❌ usageCount >= maxUses | "Invalid access code or no projects found" |
| ❌ accessTo is empty | "Invalid access code or no projects found" |

---

## 📊 Usage Tracking

### Automatic Increment

Every successful verification increments `usageCount`:

```
Initial State:
- code: "INNOV2024"
- usageCount: 0
- maxUses: 100

After 1st verification: usageCount = 1
After 2nd verification: usageCount = 2
...
After 100th verification: usageCount = 100
After 101st verification: REJECTED (maxed out)
```

### Unlimited Usage

If `maxUses = null`, the code has unlimited uses:

```
- code: "TEAM2024"
- usageCount: 150
- maxUses: null

Status: ✅ VALID (no limit)
```

---

## 🔐 Security Features

### 1. **Database Validation**
- Every access code is verified against the database
- No hardcoded or client-side validation
- Server-side enforcement only

### 2. **Session Storage**
- Code stored in sessionStorage after verification
- Cleared when browser tab closes
- Not shared across tabs or windows

### 3. **Usage Limits**
- Admins can set max uses per code
- Automatic rejection when limit reached
- Prevents unlimited sharing

### 4. **Deactivation**
- Admins can deactivate codes instantly
- No need to delete (maintains audit trail)
- Immediate effect on all validation attempts

### 5. **Project Filtering**
- Codes grant access to specific projects only
- `accessTo` array defines accessible projects
- Server filters results based on this array

---

## 🎯 Example Scenarios

### Scenario 1: Valid Code

```
Code: "INNOV2024"
Database Record:
{
  code: "INNOV2024",
  accessTo: ["proj1", "proj2", "proj3"],
  isActive: true,
  maxUses: 100,
  usageCount: 45
}

Result: ✅ VALID
- User can access 3 projects
- usageCount incremented to 46
- Redirect to /projects
```

### Scenario 2: Maxed Out Code

```
Code: "LIMITED"
Database Record:
{
  code: "LIMITED",
  accessTo: ["proj1"],
  isActive: true,
  maxUses: 10,
  usageCount: 10
}

Result: ❌ INVALID
- Max uses reached
- Show error message
- Stay on /access page
```

### Scenario 3: Deactivated Code

```
Code: "EXPIRED"
Database Record:
{
  code: "EXPIRED",
  accessTo: ["proj1", "proj2"],
  isActive: false,
  maxUses: null,
  usageCount: 25
}

Result: ❌ INVALID
- Code deactivated by admin
- Show error message
- Stay on /access page
```

### Scenario 4: Non-existent Code

```
Code: "FAKE123"
Database Record: Not found

Result: ❌ INVALID
- Code doesn't exist
- Show error message
- Stay on /access page
```

---

## 🧪 Testing the System

### Test Valid Code

1. Create access code in admin panel:
   - Code: "TEST2024"
   - Access To: ["project-id-1", "project-id-2"]
   - Max Uses: 10
   - Active: Yes

2. Navigate to `/access`
3. Enter: "TEST2024"
4. Should redirect to `/projects`
5. Should see only 2 projects

### Test Invalid Code

1. Navigate to `/access`
2. Enter: "INVALID123"
3. Should show error: "Invalid access code or no projects found"
4. Should stay on `/access` page

### Test Maxed Out Code

1. Create code with maxUses = 1
2. Use it once successfully
3. Try to use it again
4. Should be rejected (maxed out)

### Test Deactivated Code

1. Create and use a valid code
2. Deactivate it in admin panel
3. Try to use it again
4. Should be rejected (inactive)

---

## 📈 Monitoring Usage

Admins can track access code usage:

- **Usage Count** - How many times code has been used
- **Max Uses** - Limit (if set)
- **Active Status** - Whether code is active
- **Projects** - Which projects code grants access to
- **Created Date** - When code was created

View in: `/admin/access-codes`

---

## 🔧 API Reference

### Verify Access Code

**Endpoint:** `POST /api/verify-access-code`

**Request:**
```json
{
  "accessCode": "string (required)"
}
```

**Success Response (200):**
```json
{
  "valid": true,
  "message": "Access code verified successfully",
  "projectCount": 3
}
```

**Error Response (401):**
```json
{
  "valid": false,
  "error": "Invalid access code or no projects found"
}
```

**Error Response (400):**
```json
{
  "valid": false,
  "error": "Access code is required"
}
```

**Error Response (500):**
```json
{
  "valid": false,
  "error": "Failed to verify access code"
}
```

---

## ✨ Benefits

✅ **Secure** - All validation happens server-side  
✅ **Scalable** - Supports unlimited codes and projects  
✅ **Trackable** - Usage statistics for each code  
✅ **Flexible** - Set limits, deactivate, or delete codes  
✅ **User-Friendly** - Simple code entry process  
✅ **Admin-Friendly** - Easy management interface  
✅ **Audit Trail** - Track who created codes and when  

---

## 🚀 Summary

The access code verification system:

1. **Validates codes** against the ProjectAccessCode database table
2. **Checks validity** - active status and usage limits
3. **Tracks usage** - increments counter on each use
4. **Filters projects** - shows only accessible projects
5. **Provides security** - server-side enforcement only
6. **Enables management** - admin panel for code CRUD operations

This system ensures only users with valid, active access codes can view projects! 🔐
