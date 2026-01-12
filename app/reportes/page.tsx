"use client";

import { ReportsPage } from "@/features/reportes/pages/ReportsPage";
import { withRole } from "@/features/auth/guards/withRole";
import { Role } from "@/lib/rbac";
import { PageLayout } from "@/components/PageLayout";

export default withRole(
  function Reportes() {
    return (
      <PageLayout>
        <ReportsPage />
      </PageLayout>
    );
  },
  { roles: [Role.ADMIN] }
);
