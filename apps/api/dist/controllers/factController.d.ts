import { Request, Response } from 'express';
import '../middleware/auth';
export declare const getFacts: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getRandomFact: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getFactById: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getFactsByCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createFact: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateFact: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deleteFact: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getFactCategories: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=factController.d.ts.map