"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function AppliedResearchCoordinatorDashboard() {
  return (
    <RoleLayout 
      rolePath="applied-research-coordinator" 
      roleDisplayName="Applied Research Coordinator" 
      roleColor="teal"
    >
      <RoleDashboard 
        roleDisplayName="Applied Research Coordinator" 
        roleColor="teal"
      />
    </RoleLayout>
  );
}





