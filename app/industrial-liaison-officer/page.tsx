"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function IndustrialLiaisonOfficerDashboard() {
  return (
    <RoleLayout 
      rolePath="industrial-liaison-officer" 
      roleDisplayName="Industrial Liaison Officer" 
      roleColor="teal"
    >
      <RoleDashboard 
        roleDisplayName="Industrial Liaison Officer" 
        roleColor="teal"
      />
    </RoleLayout>
  );
}





