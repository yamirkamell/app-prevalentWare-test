"use client";

import { MovementsPage } from "@/features/movimientos/pages/MovementsPage";
import { withAuth } from "@/features/auth/guards/withAuth";
import { PageLayout } from "@/components/PageLayout";

export default withAuth(function Movimientos() {
  return (
    <PageLayout>
      <MovementsPage />
    </PageLayout>
  );
});
