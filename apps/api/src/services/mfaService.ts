// MFA disabled for simplified auth; provide no-op service
import { logger } from '../config/logger';

export class MFAService {
  // Generate a new MFA secret for a user
  static async generateSecret(_email: string): Promise<{ secret: string; otpauthUrl: string; qrCodeUrl: string }> {
    logger.warn('MFA generateSecret called while MFA is disabled');
    return { secret: '', otpauthUrl: '', qrCodeUrl: '' };
  }

  // Verify MFA token
  static verifyToken(_secret: string, _token: string): boolean {
    logger.warn('MFA verifyToken called while MFA is disabled');
    return true;
  }

  // Generate a recovery code
  static generateRecoveryCode(): string {
    return Math.random().toString(36).substring(2, 10) + 
           Math.random().toString(36).substring(2, 10);
  }

  // Generate multiple recovery codes
  static generateRecoveryCodes(count = 5): string[] {
    return Array.from({ length: count }, () => this.generateRecoveryCode());
  }
}
