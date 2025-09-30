import { Request, Response } from 'express';
import '../middleware/auth';
export interface LoginRequest {
    username: string;
    password: string;
    mfaToken?: string;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role_id: number;
    department: string;
}
export declare const login: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const register: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=authController.d.ts.map