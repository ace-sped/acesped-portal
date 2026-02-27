"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function AcademicProgramCoordinatorDashboard() {
  return (
    <RoleLayout 
      rolePath="academic-program-coordinator" 
      roleDisplayName="Academic Program Coordinator" 
      roleColor="indigo"
    >
      <RoleDashboard 
        roleDisplayName="Academic Program Coordinator" 
        roleColor="indigo"
        statsEndpoint="/api/academic-program-coordinator/stats"
        customStatLabels={{
          totalUsers: 'Total Services',
          activeUsers: 'Total Programs',
        }}
      />
    </RoleLayout>
  );
}



