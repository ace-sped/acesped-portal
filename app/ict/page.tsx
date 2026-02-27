"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function ICTDashboard() {
  return (
    <RoleLayout 
      rolePath="ict" 
      roleDisplayName="ICT Officer" 
      roleColor="indigo"
    >
      <RoleDashboard 
        roleDisplayName="ICT Officer" 
        roleColor="indigo"
      />
    </RoleLayout>
  );
}





