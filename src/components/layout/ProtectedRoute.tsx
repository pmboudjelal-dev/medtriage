// src/components/layout/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only users with this role can access */
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (requiredRole && profile?.role !== requiredRole) {
      // Redirect to dashboard with an error param if role is insufficient
      router.replace('/dashboard?error=unauthorized');
    }
  }, [user, profile, isLoading, requiredRole, router]);

  // Full-screen loading spinner while session is hydrating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && profile?.role !== requiredRole) return null;

  return <>{children}</>;
}