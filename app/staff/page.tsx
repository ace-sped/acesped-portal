"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function StaffDashboard() {
  return (
    <RoleLayout 
      rolePath="staff" 
      roleDisplayName="Staff" 
      roleColor="gray"
    >
      <RoleDashboard 
        roleDisplayName="Staff" 
        roleColor="blue"
      />
    </RoleLayout>
  );
}





