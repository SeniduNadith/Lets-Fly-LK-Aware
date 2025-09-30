import { Request, Response, NextFunction } from 'express';
export declare const hasPermission: (_requiredPermissions: any) => (_req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const canViewDashboard: (_req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const canManageUsers: (_req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const canManagePolicies: (_req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const canViewReports: (_req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (_roles: string | string[]) => (_req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rbac.d.ts.map