export declare class MFAService {
    static generateSecret(_email: string): Promise<{
        secret: string;
        otpauthUrl: string;
        qrCodeUrl: string;
    }>;
    static verifyToken(_secret: string, _token: string): boolean;
    static generateRecoveryCode(): string;
    static generateRecoveryCodes(count?: number): string[];
}
//# sourceMappingURL=mfaService.d.ts.map