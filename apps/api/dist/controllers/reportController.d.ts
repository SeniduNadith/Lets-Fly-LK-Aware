import { Request, Response } from 'express';
import '../middleware/auth';
export declare const getDashboardStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getComplianceReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getTrainingProgressReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getQuizPerformanceReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getPolicyAcknowledgmentReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const exportReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=reportController.d.ts.map