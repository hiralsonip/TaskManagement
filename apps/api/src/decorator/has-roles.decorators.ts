import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'roles';
export const PERMISSION_KEY = 'permissions';

export enum RoleName {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    VIEWER = 'Viewer',
}

export enum PermissionName {
    CREATE_TASK = 'CREATE_TASK',
    READ_TASK = 'READ_TASK',
    UPDATE_TASK = 'UPDATE_TASK',
    DELETE_TASK = 'DELETE_TASK',
}

export const HasRoles = (...roles: RoleName[]) => SetMetadata(ROLE_KEY, roles);
export const HasPermissions = (...permissions: PermissionName[]) => SetMetadata(PERMISSION_KEY, permissions);


