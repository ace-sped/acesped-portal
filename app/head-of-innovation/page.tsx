"use client"

import React from 'react';
import RoleLayout from '../components/shared/RoleLayout';
import RoleDashboard from '../components/shared/RoleDashboard';

export default function HeadOfInnovationDashboard() {
    return (
        <RoleLayout
            rolePath="head-of-innovation"
            roleDisplayName="Head of Innovation"
            roleColor="indigo"
        >
            <RoleDashboard
                roleDisplayName="Head of Innovation"
                roleColor="indigo"
                customStatLabels={{
                    totalUsers: 'Total Projects',
                    activeUsers: 'Live Projects',
                    recentActivity: 'Recent Updates'
                }}
            />
        </RoleLayout>
    );
}
