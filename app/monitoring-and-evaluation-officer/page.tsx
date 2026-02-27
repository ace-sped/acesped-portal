"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function MonitoringAndEvaluationOfficerDashboard() {
  return (
    <RoleLayout 
      rolePath="monitoring-and-evaluation-officer" 
      roleDisplayName="Monitoring and Evaluation Officer" 
      roleColor="purple"
    >
      <RoleDashboard 
        roleDisplayName="Monitoring and Evaluation Officer" 
        roleColor="purple"
      />
    </RoleLayout>
  );
}





