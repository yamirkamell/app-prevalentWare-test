"use client";

import { UsersPage } from "@/features/usuarios/pages/UsersPage";
import { withRole } from "@/features/auth/guards/withRole";
import { Role } from "@/lib/rbac";
import { PageLayout } from "@/components/PageLayout";

export default withRole(
  function Usuarios() {
    return (
      <PageLayout>
        <UsersPage />
      </PageLayout>
    );
  },
  { roles: [Role.ADMIN] }
);
