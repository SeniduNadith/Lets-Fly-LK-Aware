import { Request, Response } from 'express';
import '../middleware/auth';
export declare const getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getPreferences: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updatePreferences: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getActivityHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const toggleMFA: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getUserStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=profileController.d.ts.map