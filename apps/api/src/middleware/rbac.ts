// RBAC disabled for simplified authentication. Keeping no-op exports to avoid import breakage.
import { Request, Response, NextFunction } from 'express';

export const hasPermission = (_requiredPermissions: any) => {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};

export const canViewDashboard = hasPermission('dashboard:view');
export const canManageUsers = hasPermission('users:manage');
export const canManagePolicies = hasPermission('policies:manage');
export const canViewReports = hasPermission('reports:view');

export const requireRole = (_roles: string | string[]) => {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};
