import { Request, Response } from 'express';
import '../middleware/auth';
export declare const getQuizzes: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getQuizById: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const startQuiz: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const submitQuiz: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getQuizResults: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createQuiz: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateQuiz: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const clearIncompleteAttempts: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deleteQuiz: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=quizController.d.ts.map