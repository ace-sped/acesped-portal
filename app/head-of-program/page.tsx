"use client"

import React, { useState, useEffect } from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function HeadOfProgramDashboard() {
  const [programName, setProgramName] = useState<string>('Head of Program');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramName = async () => {
      try {
        const response = await fetch('/api/head-of-program/program-data');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.programs && data.programs.length > 0) {
            setProgramName(data.programs[0].title);
          }
        }
      } catch (error) {
        console.error('Failed to fetch program name', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgramName();
  }, []);

  return (
    <RoleLayout
      rolePath="head-of-program"
      roleDisplayName={loading ? 'Loading...' : programName}
      roleColor="orange"
    >
      <RoleDashboard
        roleDisplayName={loading ? 'Loading...' : programName}
        roleColor="orange"
      />
    </RoleLayout>
  );
}


