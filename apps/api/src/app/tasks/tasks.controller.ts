import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { HasPermissions, HasRoles, PermissionName, RoleName } from '../../decorator/has-roles.decorators';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {

    @Get('my-tasks')
    @HasRoles(RoleName.ADMIN, RoleName.OWNER)
    // @HasPermissions(PermissionName.READ_TASK)
    getMyTasks(@Request() req) {
        return `Hello ${JSON.stringify(req.user)}`
    }
}
