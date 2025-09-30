import { Request, Response } from 'express';
import '../middleware/auth';
export declare const getPolicies: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getPolicyById: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createPolicy: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updatePolicy: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deletePolicy: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const acknowledgePolicy: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getPolicyStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=policyController.d.ts.map