"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function CoHeadOfProgramDashboard() {
  return (
    <RoleLayout 
      rolePath="co-head-of-program" 
      roleDisplayName="Co-Head of Program" 
      roleColor="orange"
    >
      <RoleDashboard 
        roleDisplayName="Co-Head of Program" 
        roleColor="orange"
      />
    </RoleLayout>
  );
}



