import { Request, Response } from 'express';
import '../middleware/auth';
export declare const getGames: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getGameById: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const startGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const submitGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getGameResults: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getGameHistory: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getGameLeaderboard: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deleteGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=gameController.d.ts.map