"use client";

import { useSession } from "@/hooks/useAuth";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({
  roles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { data: user } = useSession();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
