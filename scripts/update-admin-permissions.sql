-- Update SUPER_ADMIN role to include Access Codes and Manage Projects permissions
UPDATE roles 
SET permissions = ARRAY[
  'Dashboard',
  'Profile',
  'User Management',
  'Manage Applicants',
  'Skill Applicants',
  'Manage Services',
  'Manage Programs',
  'Manage Projects',
  'Manage News',
  'Manage Team',
  'Role Management',
  'Access Codes',
  'Activity Logs',
  'System Settings',
  'Reports',
  'Share Docs',
  'Database'
]
WHERE role = 'SUPER_ADMIN';

-- Verify the update
SELECT role, "displayName", permissions 
FROM roles 
WHERE role = 'SUPER_ADMIN';
