import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireAuth?: boolean;
  requireUpload?: boolean;
}

/**
 * ProtectedRoute — gate access to Real Mode pages.
 * In Demo mode all pages are freely accessible (no protection).
 * In Real mode:
 *   requireAuth → redirect to /login if not authenticated
 *   requireUpload → redirect to /app/data-studio if no genome uploaded
 */
export default function ProtectedRoute({ children, requireAuth = false, requireUpload = false }: Props) {
  const { mode, isAuthenticated, hasUploadedData } = useAppContext();

  // Demo mode: no protection, everything accessible
  if (mode === 'demo') return <>{children}</>;

  // Real mode checks
  if (requireAuth && !isAuthenticated) return <Navigate to="/login" replace />;
  if (requireUpload && isAuthenticated && !hasUploadedData) return <Navigate to="/app/data-studio" replace />;

  return <>{children}</>;
}
