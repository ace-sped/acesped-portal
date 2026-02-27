"use client";

import React from "react";
import RoleLayout from "../../components/shared/RoleLayout";
import AccessCodesManager from "@/components/access-codes-manager";

export default function HeadOfInnovationAccessCodesPage() {
  return (
    <RoleLayout
      rolePath="head-of-innovation"
      roleDisplayName="Head of Innovation"
      roleColor="indigo"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Codes Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage access codes for project viewing
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <AccessCodesManager />
        </div>
      </div>
    </RoleLayout>
  );
}
