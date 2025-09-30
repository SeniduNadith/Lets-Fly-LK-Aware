import { Request, Response } from 'express';
import '../middleware/auth';
export declare const getTrainingModules: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getTrainingModuleById: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getTrainingProgress: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const startTraining: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateTrainingProgress: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const completeTraining: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createTrainingModule: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateTrainingModule: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deleteTrainingModule: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=trainingController.d.ts.map