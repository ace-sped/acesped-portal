# Verified Access Flow - All Projects Display

## ✅ Current Implementation

Once an access code is verified, users are redirected to `/projects` and see **ALL projects**, not just filtered ones.

---

## 🔄 Complete Flow

### Step 1: Access Code Entry (`/access`)

```
User enters code "INNOV2024"
         ↓
POST /api/verify-access-code
{
  "accessCode": "INNOV2024",
  "incrementUsage": true  ← Increments usage count
}
         ↓
Validate against ProjectAccessCode table:
  ✓ Code exists?
  ✓ isActive = true?
  ✓ usageCount < maxUses?
         ↓
Response: { valid: true, projectCount: 3 }
         ↓
Store in sessionStorage
         ↓
Redirect to /projects
```

### Step 2: Projects Page Load (`/projects`)

```
Check sessionStorage for code
         ↓
Code exists? → Continue
No code? → Redirect to /access
         ↓
POST /api/verify-access-code
{
  "accessCode": "INNOV2024",
  "incrementUsage": false  ← Don't increment (just checking)
}
         ↓
Validate code is still valid
         ↓
Invalid? → Clear session → Redirect to /access
Valid? → Continue
         ↓
GET /api/projects
(No accessCode parameter = fetch ALL)
         ↓
Display ALL projects
```

---

## 🎯 Key Points

### ✅ Access Code Verifies User Identity
- Access code confirms user has permission
- Stored in sessionStorage after verification

### ✅ All Projects Displayed
- Once verified, user sees **ALL projects**
- No filtering by `accessTo` array
- Complete project catalog available

### ✅ Usage Count Management
- **Incremented once** - On initial verification at `/access`
- **Not incremented** - On page refreshes or navigation

### ✅ Continuous Validation
- Code validity checked on page load
- Invalid codes trigger redirect to `/access`
- Ensures security even if code becomes invalid

---

## 📊 API Behavior

### GET /api/projects

**Without accessCode parameter:**
```http
GET /api/projects
```
Returns: **ALL projects** in the database

**With accessCode parameter:**
```http
GET /api/projects?accessCode=INNOV2024
```
Returns: **Only projects** in the code's `accessTo` array

### POST /api/verify-access-code

**With incrementUsage = true:**
```json
{
  "accessCode": "INNOV2024",
  "incrementUsage": true
}
```
- Validates code
- Increments `usageCount` if valid
- Used by: `/access` page (initial entry)

**With incrementUsage = false (default):**
```json
{
  "accessCode": "INNOV2024",
  "incrementUsage": false
}
```
- Validates code only
- Does NOT increment `usageCount`
- Used by: `/projects` page (validation check)

---

## 💻 Code Implementation

### Access Page (`/access`)
```typescript
// On form submit - Increment usage
const response = await fetch('/api/verify-access-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessCode: accessCode.trim(),
    incrementUsage: true  // ← Count this as a use
  }),
});

if (response.ok && data.valid) {
  sessionStorage.setItem('project_access_code', accessCode.trim());
  router.push('/projects');
}
```

### Projects Page (`/projects`)
```typescript
// On page load - Just validate, don't increment
const verifyResponse = await fetch('/api/verify-access-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessCode: accessCode,
    incrementUsage: false  // ← Don't count page loads
  }),
});

if (verifyResponse.ok && verifyData.valid) {
  // Fetch ALL projects
  const projectsResponse = await fetch('/api/projects');
  const projectsData = await projectsResponse.json();
  setProjects(projectsData);  // Shows ALL projects
}
```

---

## 🔐 Security Features

### 1. **Verification Required**
- Users must enter valid access code
- Code validated against database
- Invalid codes rejected immediately

### 2. **Session Management**
- Valid code stored in sessionStorage
- Persists during browser session
- Cleared when tab closes or user signs out

### 3. **Continuous Validation**
- Code re-validated on page load
- Invalid/deactivated codes caught immediately
- Automatic redirect if code becomes invalid

### 4. **Usage Tracking**
- Each initial entry increments counter
- Page refreshes don't increment
- Admins can monitor usage patterns

---

## 📈 Usage Count Behavior

### Example Scenario

```
Access Code: "INNOV2024"
Initial State: usageCount = 5, maxUses = 100

User Actions:
1. Enters code at /access     → usageCount = 6 ✅ (incremented)
2. Redirected to /projects     → usageCount = 6 (not incremented)
3. Refreshes /projects         → usageCount = 6 (not incremented)
4. Navigates to /projects/[id] → usageCount = 6 (not incremented)
5. Returns to /projects        → usageCount = 6 (not incremented)
6. Signs out and enters again  → usageCount = 7 ✅ (incremented)

Result: Usage count reflects actual entries, not page views
```

---

## 🎨 User Experience

### What Users See

1. **Enter Access Code**
   - Beautiful entry page at `/access`
   - Real-time validation feedback
   
2. **Verification Success**
   - Automatic redirect to `/projects`
   - Loading state during redirect
   
3. **View All Projects**
   - See complete project catalog
   - Search and filter functionality
   - No access restrictions within projects

4. **Sign Out**
   - Clear button in header
   - Returns to `/access` page
   - Requires re-entry of code

---

## 🧪 Testing

### Test 1: Valid Code Shows All Projects

```bash
1. Create access code with accessTo: ["proj1"]
2. Create multiple projects (proj1, proj2, proj3)
3. Enter valid code at /access
4. Verify redirect to /projects
5. Check: Should see ALL 3 projects (not just proj1)
```

### Test 2: Usage Count Increments Correctly

```bash
1. Create code with maxUses: 3, usageCount: 0
2. Enter code at /access (usageCount → 1)
3. Refresh /projects page (usageCount → still 1)
4. Sign out and re-enter (usageCount → 2)
5. Refresh again (usageCount → still 2)
6. Sign out and re-enter (usageCount → 3)
7. Try to enter 4th time → REJECTED (maxed out)
```

### Test 3: Invalid Code Rejected

```bash
1. Enter "INVALID123" at /access
2. Should show error message
3. Should stay on /access page
4. Should NOT redirect to /projects
```

---

## 🔑 Key Features

✅ **One-time verification** - Validate code, then show everything  
✅ **All projects visible** - No filtering after verification  
✅ **Smart usage tracking** - Count entries, not page views  
✅ **Continuous security** - Re-validate on page load  
✅ **Session-based access** - Persists during session  
✅ **Easy sign out** - Clear session and start over  

---

## 📝 Summary

The system works as follows:

1. **User enters valid access code** at `/access`
2. **System verifies** against `ProjectAccessCode` table
3. **Usage count incremented** (only once)
4. **Code stored** in sessionStorage
5. **Redirect to** `/projects`
6. **Display ALL projects** in the database
7. **Code re-validated** on page loads (without incrementing)
8. **User can browse freely** until sign out

This provides **security through verification** while offering **full access after validation**! 🎉
