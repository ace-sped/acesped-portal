"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function CenterSecretaryDashboard() {
  return (
    <RoleLayout 
      rolePath="center-secretary" 
      roleDisplayName="Center Secretary" 
      roleColor="blue"
    >
      <RoleDashboard 
        roleDisplayName="Center Secretary" 
        roleColor="blue"
      />
    </RoleLayout>
  );
}





