"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function PGRepDashboard() {
  return (
    <RoleLayout 
      rolePath="pg-rep" 
      roleDisplayName="PG Representative" 
      roleColor="blue"
    >
      <RoleDashboard 
        roleDisplayName="PG Representative" 
        roleColor="blue"
      />
    </RoleLayout>
  );
}





