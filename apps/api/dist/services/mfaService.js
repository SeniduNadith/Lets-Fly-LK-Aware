"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFAService = void 0;
const logger_1 = require("../config/logger");
class MFAService {
    static async generateSecret(_email) {
        logger_1.logger.warn('MFA generateSecret called while MFA is disabled');
        return { secret: '', otpauthUrl: '', qrCodeUrl: '' };
    }
    static verifyToken(_secret, _token) {
        logger_1.logger.warn('MFA verifyToken called while MFA is disabled');
        return true;
    }
    static generateRecoveryCode() {
        return Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10);
    }
    static generateRecoveryCodes(count = 5) {
        return Array.from({ length: count }, () => this.generateRecoveryCode());
    }
}
exports.MFAService = MFAService;
//# sourceMappingURL=mfaService.js.map