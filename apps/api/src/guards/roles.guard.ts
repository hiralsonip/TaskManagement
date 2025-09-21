import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY, ROLE_KEY } from "../decorator/has-roles.decorators";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [context.getHandler(), context.getClass()])
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [context.getHandler(), context.getClass()])

        //* No roles or permissions required, allow access
        if (!requiredRoles && !requiredPermissions) return true;

        const { user } = context.switchToHttp().getRequest();
        if (!user) return false;

        // check roles
        if (requiredRoles?.length) {
            const hasRole = requiredRoles.some(role => user.roles?.some((r: any) => r.name === role));
            if (!hasRole) return false;
        }

        // check permissions
        if (requiredPermissions?.length) {
            const userPermissions = user.roles?.flatMap((r: any) => r.permissions?.map((p: any) => p.name)) || [];
            const hasPermissions = requiredPermissions.every(p => userPermissions.includes(p));
            if (!hasPermissions) return false;
        }

        return true;
    }
}
