"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function HeadOfFinanceDashboard() {
  return (
    <RoleLayout 
      rolePath="head-of-finance" 
      roleDisplayName="Head of Finance" 
      roleColor="green"
    >
      <RoleDashboard 
        roleDisplayName="Head of Finance" 
        roleColor="green"
      />
    </RoleLayout>
  );
}





