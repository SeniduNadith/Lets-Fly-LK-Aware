"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.canViewReports = exports.canManagePolicies = exports.canManageUsers = exports.canViewDashboard = exports.hasPermission = void 0;
const hasPermission = (_requiredPermissions) => {
    return async (_req, _res, next) => {
        next();
    };
};
exports.hasPermission = hasPermission;
exports.canViewDashboard = (0, exports.hasPermission)('dashboard:view');
exports.canManageUsers = (0, exports.hasPermission)('users:manage');
exports.canManagePolicies = (0, exports.hasPermission)('policies:manage');
exports.canViewReports = (0, exports.hasPermission)('reports:view');
const requireRole = (_roles) => {
    return async (_req, _res, next) => {
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=rbac.js.map